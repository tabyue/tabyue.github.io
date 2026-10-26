# -*- coding: utf-8 -*-
"""学习流水线回归测试；真实数据只读，写入测试仅使用系统临时目录。

运行：python -B -m unittest discover -s tools -p test_learn_pipeline.py -v
仅依赖标准库和本地 Git；HEAD 对照失败不会跳过，也不会联网获取对象。
"""
import builtins
from contextlib import ExitStack, contextmanager, redirect_stdout
import io
import json
import os
from pathlib import Path
import re
import subprocess
import sys
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / 'tools'
LEARN = ROOT / 'data' / 'learn'
SPLIT = ROOT / 'data' / 'learn-split'
GUIDANCE_MODULES = {
    'linear-algebra', 'imitation-learning', 'vla-models',
    'physics-simulation', 'ai-infra',
}
ESTIMATE_METHOD = (
    'browse-v1: Chinese 400 chars/min; English 220 words/min; '
    'code 900 chars/min; excludes practice'
)

# 同时支持直接执行和 unittest discovery，禁止导入业务脚本时产生 pyc。
with patch.object(sys, 'dont_write_bytecode', True), \
        patch.object(sys, 'path', [str(TOOLS), *sys.path]):
    import normalize_learn as normalize
    import sync_learn_split as sync
    import verify_learn_structure as verify


def read_json(path):
    with Path(path).open(encoding='utf-8') as stream:
        return json.load(stream)


def tree_snapshot(root):
    """只用于 TemporaryDirectory：同时记录目录、文件内容和修改时间。"""
    return {
        str(path.relative_to(root)): (
            path.stat().st_mtime_ns,
            path.read_bytes() if path.is_file() else None,
        )
        for path in sorted(root.rglob('*'))
    }


@contextmanager
def guarded_open(write_root=None):
    """拦截业务脚本的文件写入：只读检查禁写，写入测试不得越过临时目录。"""
    def wrap(original):
        def checked(file, mode='r', *args, **kwargs):
            if any(flag in mode for flag in 'wax+'):
                if write_root is None:
                    raise AssertionError('只读操作尝试写盘：%s' % file)
                try:
                    Path(file).resolve().relative_to(write_root.resolve())
                except (TypeError, ValueError):
                    raise AssertionError('写入越过临时目录：%s' % file) from None
            return original(file, mode, *args, **kwargs)
        return checked

    with patch('builtins.open', wrap(builtins.open)), \
            patch('io.open', wrap(io.open)):
        yield


def expected_section_meta(section, number):
    """独立描述发布字段契约，不用同步器生成输出作为自身的断言基准。"""
    meta = {
        'id': 'sec-%02d' % number,
        'title': section.get('title', ''),
        'lastUpdated': section.get('lastUpdated', ''),
        'chars': len(section.get('content') or ''),
    }
    for key in ('shortTitle', 'difficulty', 'estimatedMinutes', 'isFrontier', 'isBrief'):
        if section.get(key) not in (None, '', False):
            meta[key] = section[key]
    if section.get('tier') is not None:
        meta['tier'] = section['tier']
    meta.update(sync.reading_metadata(section.get('content') or ''))
    return meta


def string_values(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for child in value:
            yield from string_values(child)
    elif isinstance(value, dict):
        for child in value.values():
            yield from string_values(child)


class MapProseTests(unittest.TestCase):
    def assert_fence_unchanged(self, block, newline='\n'):
        before = '正文 `[入口](/learn/demo/1)`' + newline
        after = '末尾 `[返回](/learn/demo/2)`'
        visited = []

        def transform(text):
            visited.append(text)
            return normalize.BACKTICKED_LINK.sub(r'\1', text)

        result = normalize.map_prose(before + block + after, transform)
        expected = ('正文 [入口](/learn/demo/1)' + newline + block
                    + '末尾 [返回](/learn/demo/2)')
        self.assertEqual(result.encode('utf-8'), expected.encode('utf-8'))
        self.assertEqual(visited, [before, after], '代码不应传给正文变换函数')

    def test_backtick_fence_preserves_every_byte(self):
        self.assert_fence_unchanged(
            '```python\n# 中文注释  \n\tvalue = "`[示例](/learn/demo/0)`"\n'
            '## 假小节\n```\n'
        )

    def test_tilde_fence_preserves_every_byte(self):
        self.assert_fence_unchanged(
            '~~~markdown\n# 假标题\n`[示例](/learn/demo/0)`  \n~~~\n'
        )

    def test_quoted_fences_preserve_every_byte(self):
        for prefix in ('> ', '> > ', '   > '):
            for marker in ('```', '~~~'):
                with self.subTest(prefix=prefix, marker=marker):
                    block = '\n'.join(prefix + line for line in (
                        marker + 'markdown', '# 注释', '## 假标题',
                        '`[示例](/learn/demo/0)`  ', marker,
                    )) + '\n'
                    self.assert_fence_unchanged(block)

    def test_crlf_fence_preserves_line_endings_and_whitespace(self):
        self.assert_fence_unchanged(
            '   ```python\r\n\t# 注释  \r\n`[示例](/learn/demo/0)`\r\n'
            '   ```\r\n', newline='\r\n'
        )

    def test_short_wrong_or_suffixed_marker_does_not_close_fence(self):
        self.assert_fence_unchanged(
            '````markdown\n```\n~~~\n````仍在代码中\n'
            '`[示例](/learn/demo/0)`\n`````   \n'
        )

    def test_unclosed_fence_preserves_content_through_eof(self):
        for marker in ('```', '~~~', '> ```'):
            with self.subTest(marker=marker):
                block = marker + '\n# 假标题\n`[示例](/learn/demo/0)`'
                self.assertEqual(
                    normalize.map_prose('正文\n' + block, lambda text: text.upper().replace('正文', '已变换')),
                    '已变换\n' + block,
                )

    def test_only_backticked_markdown_links_are_unwrapped_in_prose(self):
        content = '正文 `[入口](/learn/demo/1)`、`[文档](https://docs.python.org/3/)`，保留 `x = 1`。'
        expected = '正文 [入口](/learn/demo/1)、[文档](https://docs.python.org/3/)，保留 `x = 1`。'
        self.assertEqual(
            normalize.map_prose(content, lambda text: normalize.BACKTICKED_LINK.sub(r'\1', text)),
            expected,
        )
        self.assertEqual(normalize.map_prose('', lambda text: '不应调用'), '')


class ReadingMetadataTests(unittest.TestCase):
    def test_code_comments_and_fake_headings_are_not_indexed(self):
        content = (
            '## 真实小节\n\n'
            '```python\n# Python 注释\n## 假 Markdown 标题\n```\n\n'
            '~~~markdown\n# 另一假标题\n### 代码示例标题\n~~~\n\n'
            '> ```python\n> # 引用中的注释\n> ## 引用中的假标题\n> ```\n\n'
            '### 最后小节\n'
        )
        self.assertEqual(sync.reading_metadata(content)['headings'], ['真实小节', '最后小节'])

    def test_chinese_headings_are_preserved_deduplicated_and_ordered(self):
        content = (
            '## 中文小节：坐标变换\n\n'
            '### **中文小节：坐标变换**\n\n'
            '## [矩阵与分解](/learn/demo/1)\n\n'
            '### 矩阵与分解 ###\n\n'
            '###### 四元数与 SO(3)\n'
        )
        self.assertEqual(sync.reading_metadata(content)['headings'], [
            '中文小节：坐标变换', '矩阵与分解', '四元数与 SO(3)',
        ])

    def test_summary_is_stable_plain_prose_not_code_or_heading(self):
        paragraph = '这是一段用于验证**中文摘要**的正文，包含 [矩阵课程](/learn/demo/1) 和 `NumPy` 示例。'
        expected = '这是一段用于验证中文摘要的正文，包含 矩阵课程 和 NumPy 示例。'
        prefix = (
            '## 课程标题\n\n简短说明。\n\n'
            '> 引用说明不能替代正文摘要，即使引用中的文本足够长。\n\n'
            '| 表格中的内容也不能替代正文摘要，即使这一行足够长 |\n\n'
            '```python\n# 假标题\n这是代码里的长文本，不能被当作正文摘要内容。\n```\n\n'
        )
        content = prefix + paragraph + '\n\n后续正文也不能替代第一段有效摘要。'
        metadata = sync.reading_metadata(content)
        self.assertEqual(metadata['summary'], expected)
        self.assertEqual(sync.reading_metadata(content), metadata)
        self.assertEqual(sync.reading_metadata(content.replace('\n', '\r\n'))['summary'], expected)
        self.assertEqual(sync.reading_metadata(content.replace('假标题', '改过的代码标题'))['summary'], expected)

    def test_summary_truncation_is_stable_at_180_characters(self):
        paragraph = '中文摘要保留顺序并且稳定截断。' * 20
        metadata = sync.reading_metadata('## 小节\n\n' + paragraph)
        self.assertEqual(metadata['summary'], paragraph[:180])
        self.assertEqual(len(metadata['summary']), 180)

    def test_code_only_has_no_headings_or_summary(self):
        for marker in ('```', '~~~', '> ```'):
            with self.subTest(marker=marker):
                content = marker + '\n# 不是真标题\n这不是正文摘要而是代码中的长文本内容。\n' + marker
                metadata = sync.reading_metadata(content)
                self.assertEqual(metadata['headings'], [])
                self.assertEqual(metadata['summary'], '')
                self.assertGreater(metadata['readingMinutes'], 0)


class EstimateMinutesTests(unittest.TestCase):
    def test_code_and_prose_estimates_are_positive_and_deterministic(self):
        for content in ('', '中文正文。', 'English prose.', '```python\nx = 1\n```',
                        '~~~\nx = 1\n~~~', '> ```\n> x = 1\n> ```'):
            with self.subTest(content=content):
                values = [normalize.est_minutes(content) for _ in range(3)]
                self.assertIs(type(values[0]), int)
                self.assertGreater(values[0], 0)
                self.assertEqual(values, [values[0]] * 3)

    def test_long_chinese_and_english_use_browsing_rates(self):
        self.assertEqual(normalize.est_minutes('中' * 4000), 10)
        self.assertEqual(normalize.est_minutes('word ' * 2200), 10)

    def test_long_code_and_mixed_content_contribute_to_estimate(self):
        code = '```\n' + 'x' * 9000 + '\n```\n'
        self.assertEqual(normalize.est_minutes(code), 10)
        self.assertEqual(normalize.est_minutes('中' * 4000 + '\nword ' * 2200 + '\n' + code), 30)


class TemporaryPipelineTests(unittest.TestCase):
    def setUp(self):
        stack = ExitStack()
        self.addCleanup(stack.close)
        self.root = Path(stack.enter_context(TemporaryDirectory(prefix='learn-pipeline-')))
        self.learn = self.root / 'data' / 'learn'
        self.split = self.root / 'data' / 'learn-split'
        self.learn.mkdir(parents=True)
        self.path = self.learn / 'demo.json'
        for module, values in (
            (normalize, {'ROOT': str(self.root), 'LEARN': str(self.learn)}),
            (sync, {'ROOT': str(self.root), 'SRC_DIR': str(self.learn), 'DST_DIR': str(self.split)}),
            (verify, {'ROOT': str(self.root), 'LEARN': str(self.learn), 'SPLIT': str(self.split)}),
        ):
            stack.enter_context(patch.multiple(module, **values))
        stack.enter_context(patch.object(verify, 'fails', []))
        stack.enter_context(patch.object(verify, 'warns', []))
        stack.enter_context(guarded_open(self.root))
        self.module = {
            'id': 'demo', 'name': '测试课程', 'lastUpdated': '2026-10-26',
            'prerequisites': ['基础阅读能力'], 'learningObjectives': ['完成回归练习'],
            'studyGuide': ['先读 [首章](/learn/demo/1)'], 'weeklyPlan': '依次完成两章。',
            'sections': [
                {'title': '扩散模型：训练与采样', 'shortTitle': '人工精选标题',
                 'content': '这是一段用于回归测试的中文正文，所有数据只存在临时目录。',
                 'difficulty': '入门', 'tier': 0, 'estimatedMinutes': 97, 'chars': -1},
                {'title': '生成模型基础', 'content': '第二节正文，用于验证字段补齐和章节顺序。',
                 'difficulty': '中级', 'tier': 1, 'isFrontier': True, 'isBrief': True},
            ],
        }
        self.save_module()
        self.catalog_path = self.root / 'data' / 'learning-path.json'
        self.catalog_path.write_text(json.dumps({
            'stages': [{'modules': [{'id': 'demo', 'name': '测试课程', 'importance': '保留人工字段'}]}],
        }, ensure_ascii=False), encoding='utf-8')

    def save_module(self):
        self.path.write_text(json.dumps(self.module, ensure_ascii=False, indent=2), encoding='utf-8')

    def run_normalize(self, *args):
        output = io.StringIO()
        with patch.object(sys, 'argv', ['normalize_learn.py', *args]), redirect_stdout(output):
            normalize.main()
        return output.getvalue()

    def run_sync(self):
        with patch.object(sys, 'argv', ['sync_learn_split.py']), redirect_stdout(io.StringIO()):
            sync.main()

    def run_verify(self):
        output = io.StringIO()
        with guarded_open(), redirect_stdout(output):
            code = verify.main()
        return code, output.getvalue()

    def test_normalize_preserves_manual_short_title_when_title_changes(self):
        self.module['sections'][0]['title'] = '1. 扩散模型：训练与采样'
        self.save_module()
        self.run_normalize()
        section = read_json(self.path)['sections'][0]
        self.assertEqual(section['title'], '扩散模型：训练与采样')
        self.assertEqual(section['shortTitle'], '人工精选标题')
        self.assertNotEqual(section['shortTitle'], normalize.short_of(section['title']))

    def test_normalize_fills_missing_fields_without_resyncing_existing_minutes(self):
        self.assertNotEqual(normalize.est_minutes(self.module['sections'][0]['content']), 97)
        self.run_normalize()
        sections = read_json(self.path)['sections']
        self.assertEqual(sections[0]['estimatedMinutes'], 97)
        self.assertEqual(sections[1]['estimatedMinutes'], normalize.est_minutes(sections[1]['content']))
        self.assertEqual(sections[1]['shortTitle'], '生成模型基础')
        self.assertEqual([s['chars'] for s in sections], [len(s['content']) for s in sections])
        self.assertEqual([s['title'] for s in sections], [s['title'] for s in self.module['sections']])

    def test_normalize_unwraps_prose_links_but_preserves_fenced_examples(self):
        block = '~~~markdown\n`[代码](/learn/demo/1)`\n~~~\n> ```\n> `[引用代码](/learn/demo/1)`\n> ```'
        self.module['sections'][0]['content'] = '`[正文](/learn/demo/1)`\n' + block
        self.save_module()
        self.run_normalize()
        self.assertEqual(read_json(self.path)['sections'][0]['content'], '[正文](/learn/demo/1)\n' + block)

    def test_zero_chapter_link_is_preserved_and_reported_not_silently_redirected(self):
        content = '无效入口 [零号章节](/learn/demo/0)，有效入口 [首章](/learn/demo/1)。'
        self.module['sections'][0]['content'] = content
        self.save_module()
        self.run_normalize()
        self.assertEqual(read_json(self.path)['sections'][0]['content'], content)
        self.run_sync()
        code, output = self.run_verify()
        self.assertEqual(code, 1, output)
        self.assertTrue(any('demo/0' in failure and '失效内链' in failure for failure in verify.fails), output)

    def test_dry_never_opens_files_for_writing_or_changes_disk(self):
        self.module['sections'][0]['title'] = '1. 扩散模型：训练与采样'
        self.module['sections'][0]['content'] = '`[正文](/learn/demo/1)`'
        self.save_module()
        before = tree_snapshot(self.root)
        for args in (('--dry',), ('--dry', '--resync-minutes')):
            with self.subTest(args=args):
                with guarded_open():
                    output = self.run_normalize(*args)
                self.assertIn('DRY RUN', output)
                self.assertIn('title_cleaned', output, '样本必须确实触发变更，避免空跑假通过')
                self.assertEqual(tree_snapshot(self.root), before)

    def test_normalize_is_idempotent_without_rewriting_files(self):
        self.run_normalize()
        before = tree_snapshot(self.root)
        with guarded_open():
            self.run_normalize()
        self.assertEqual(tree_snapshot(self.root), before)

    def test_sync_publishes_full_fields_and_is_idempotent(self):
        self.run_normalize()
        self.run_sync()
        source = read_json(self.path)
        index = read_json(self.split / 'demo' / '_index.json')
        metas = [expected_section_meta(s, i) for i, s in enumerate(source['sections'], 1)]
        expected = {key: value for key, value in source.items() if key != 'sections'}
        expected.update(sectionsMeta=metas, readingMinutes=sum(m['readingMinutes'] for m in metas),
                        chars=sum(m['chars'] for m in metas), readingEstimateMethod=ESTIMATE_METHOD)
        self.assertEqual(index, expected)
        for i, section in enumerate(source['sections'], 1):
            self.assertEqual(read_json(self.split / 'demo' / ('sec-%02d.json' % i)), section)
        entry = read_json(self.catalog_path)['stages'][0]['modules'][0]
        self.assertEqual(entry, {
            'id': 'demo', 'name': '测试课程', 'importance': '保留人工字段',
            'sectionCount': 2, 'readingMinutes': index['readingMinutes'], 'chars': index['chars'],
            'lastUpdated': source['lastUpdated'], 'weeklyPlan': source['weeklyPlan'],
        })
        self.assertEqual(index['sectionsMeta'][0]['estimatedMinutes'], 97)
        self.assertNotEqual(index['sectionsMeta'][0]['readingMinutes'], 97)
        before = tree_snapshot(self.root)
        with guarded_open():
            self.run_sync()
        self.assertEqual(tree_snapshot(self.root), before)

    def test_verifier_accepts_valid_fixture_and_rejects_invalid_guidance(self):
        self.run_normalize()
        self.run_sync()
        code, output = self.run_verify()
        self.assertEqual(code, 0, output)
        for link in ('/learn/missing/1', '/learn/demo/0', '/learn/demo/3'):
            with self.subTest(link=link):
                self.module = read_json(self.path)
                self.module['studyGuide'] = ['错误入口 [章节](%s)' % link]
                self.save_module()
                self.run_sync()
                code, output = self.run_verify()
                self.assertEqual(code, 1, output)
                self.assertTrue(any('invalid guidance link ' + link in failure for failure in verify.fails), output)


class RepositoryDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.modules = {path.stem: read_json(path) for path in sorted(LEARN.glob('*.json'))}
        cls.catalog = read_json(ROOT / 'data' / 'learning-path.json')
        cls.entries = [entry for stage in cls.catalog['stages'] for entry in stage['modules']]

    def test_catalog_matches_all_modules_and_sections(self):
        self.assertTrue(self.modules)
        self.assertEqual(len(self.modules), len(self.entries))
        self.assertEqual(sum(len(d['sections']) for d in self.modules.values()),
                         sum(m['sectionCount'] for m in self.entries))
        for mid, source in self.modules.items():
            with self.subTest(module=mid):
                self.assertEqual(source['id'], mid)
                self.assertTrue(source['sections'])

    def test_catalog_ids_cover_real_modules_exactly_once(self):
        ids = [entry.get('id') for entry in self.entries]
        self.assertEqual(len(ids), len(self.modules))
        self.assertEqual(len(ids), len(set(ids)), 'catalog.id 有重复')
        self.assertEqual(set(ids), set(self.modules))

    def test_catalog_counts_minutes_chars_names_and_dates_match_sources(self):
        for entry in self.entries:
            with self.subTest(module=entry.get('id')):
                source = self.modules[entry['id']]
                sections = source['sections']
                self.assertEqual(entry['name'], source['name'])
                self.assertEqual(entry['sectionCount'], len(sections))
                self.assertEqual(entry['readingMinutes'], sum(normalize.est_minutes(s['content']) for s in sections))
                self.assertEqual(entry['chars'], sum(len(s['content']) for s in sections))
                self.assertEqual(entry.get('lastUpdated'), source.get('lastUpdated'))
        self.assertEqual(sum(entry['sectionCount'] for entry in self.entries),
                         sum(len(d['sections']) for d in self.modules.values()))
        self.assertEqual(self.catalog['lastUpdated'], max(d.get('lastUpdated') or '' for d in self.modules.values()))

    def test_source_section_chars_match_actual_content(self):
        for mid, source in self.modules.items():
            for i, section in enumerate(source['sections'], 1):
                with self.subTest(module=mid, section=i, title=section.get('title')):
                    self.assertEqual(section.get('chars'), len(section['content']))

    def test_split_module_and_section_files_cover_exactly_the_sources(self):
        self.assertEqual({path.name for path in SPLIT.iterdir() if path.is_dir()}, set(self.modules))
        for mid, source in self.modules.items():
            with self.subTest(module=mid):
                expected = {'_index.json'} | {'sec-%02d.json' % i for i in range(1, len(source['sections']) + 1)}
                actual = {path.name for path in (SPLIT / mid).glob('*.json')}
                self.assertEqual(actual, expected, '缺失或多余的分片文件')

    def test_split_section_payloads_match_every_source_field(self):
        for mid, source in self.modules.items():
            for i, section in enumerate(source['sections'], 1):
                with self.subTest(module=mid, section=i, title=section.get('title')):
                    self.assertEqual(read_json(SPLIT / mid / ('sec-%02d.json' % i)), section)

    def test_split_index_fields_and_all_derived_metadata_match(self):
        for mid, source in self.modules.items():
            with self.subTest(module=mid):
                index = read_json(SPLIT / mid / '_index.json')
                metas = [expected_section_meta(s, i) for i, s in enumerate(source['sections'], 1)]
                expected = {key: value for key, value in source.items() if key != 'sections'}
                expected.update(sectionsMeta=metas, readingMinutes=sum(m['readingMinutes'] for m in metas),
                                chars=sum(m['chars'] for m in metas), readingEstimateMethod=ESTIMATE_METHOD)
                self.assertEqual(set(index), set(expected))
                for key, value in expected.items():
                    with self.subTest(field=key):
                        if key == 'sectionsMeta':
                            self.assertEqual(len(index[key]), len(value))
                            for i, (actual, meta) in enumerate(zip(index[key], value), 1):
                                with self.subTest(section=i):
                                    self.assertEqual(actual, meta)
                        else:
                            self.assertEqual(index[key], value)

    def test_five_new_module_guidance_fields_and_links_are_valid(self):
        guided = {mid for mid, d in self.modules.items() if d.get('studyGuide')}
        self.assertTrue(GUIDANCE_MODULES <= guided)
        catalog = {entry['id']: entry for entry in self.entries}
        for mid in sorted(guided):
            with self.subTest(module=mid):
                source = self.modules[mid]
                guidance = {key: source.get(key) for key in ('prerequisites', 'learningObjectives', 'studyGuide', 'weeklyPlan')}
                for key in ('prerequisites', 'learningObjectives', 'studyGuide'):
                    self.assertIsInstance(guidance[key], list)
                    self.assertTrue(guidance[key], key)
                    self.assertTrue(all(isinstance(text, str) and text.strip() for text in guidance[key]), key)
                self.assertIsInstance(guidance['weeklyPlan'], str)
                self.assertTrue(guidance['weeklyPlan'].strip())
                self.assertEqual(catalog[mid]['weeklyPlan'], guidance['weeklyPlan'])
                links = [link for text in string_values(guidance)
                         for link in re.findall(r'/learn/[^\s)\]<>"\x27`]+', text)]
                self.assertTrue(links, '不得删除全部导学链接让校验空跑')
                for link in links:
                    with self.subTest(link=link):
                        route = re.fullmatch(r'/learn/([a-z0-9-]+)(?:/([1-9][0-9]*))?/?', urlsplit(link).path)
                        self.assertIsNotNone(route, '链接格式非法（含零号、负数或非数字章节）：' + link)
                        target, number = route.groups()
                        self.assertIn(target, self.modules)
                        self.assertIn(target, catalog)
                        self.assertTrue((SPLIT / target / '_index.json').is_file())
                        if number is not None:
                            position = int(number)
                            self.assertLessEqual(position, len(self.modules[target]['sections']))
                            section = self.modules[target]['sections'][position - 1]
                            self.assertTrue(section['title'].strip())
                            self.assertTrue(section['content'].strip())
                            self.assertEqual(read_json(SPLIT / target / ('sec-%02d.json' % position)), section)

    def test_real_structure_verifier_is_read_only_and_passes(self):
        output = io.StringIO()
        with patch.multiple(verify, ROOT=str(ROOT), LEARN=str(LEARN), SPLIT=str(SPLIT), fails=[], warns=[]), \
                guarded_open(), redirect_stdout(output):
            result = verify.main()
            self.assertEqual(result, 0, output.getvalue())
            self.assertEqual(verify.fails, [], output.getvalue())


class HeadPreservationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        env = dict(os.environ, GIT_OPTIONAL_LOCKS='0', GIT_NO_LAZY_FETCH='1')

        def git(*args):
            result = subprocess.run(['git', *args], cwd=ROOT, env=env, capture_output=True, timeout=30)
            if result.returncode:
                raise AssertionError('本地 HEAD 对照失败，不允许跳过：' + result.stderr.decode('utf-8', errors='replace'))
            return result.stdout.decode('utf-8')

        names = git('ls-tree', '--name-only', 'HEAD:data/learn').splitlines()
        cls.baseline = {name[:-5]: json.loads(git('show', 'HEAD:data/learn/' + name))
                        for name in names if name.endswith('.json')}
        cls.current = {path.stem: read_json(path) for path in sorted(LEARN.glob('*.json'))}

    def test_original_titles_and_order_are_identical_to_git_head(self):
        self.assertTrue(set(self.baseline) <= set(self.current), '存量模块不得删除；允许新增模块')
        self.assertTrue(self.baseline, 'HEAD 基准不得空缺')
        for mid, old in self.baseline.items():
            with self.subTest(module=mid):
                self.assertEqual([section['title'] for section in self.current[mid]['sections'][:len(old['sections'])]],
                                 [section['title'] for section in old['sections']],
                                 '原标题或章节顺序发生改变：' + mid)

    def test_original_estimated_minutes_are_never_uniformly_overwritten(self):
        self.assertTrue(set(self.baseline) <= set(self.current), '存量模块不得删除；允许新增模块')
        checked = 0
        for mid, old in self.baseline.items():
            with self.subTest(module=mid):
                current = self.current[mid]['sections']
                original = old['sections']
                self.assertGreaterEqual(len(current), len(original), '允许尾部追加，不得删减存量章节')
                for i, (before, after) in enumerate(zip(original, current), 1):
                    if 'estimatedMinutes' in before:
                        checked += 1
                        with self.subTest(section=i, title=before['title']):
                            self.assertIn('estimatedMinutes', after)
                            self.assertEqual(after['estimatedMinutes'], before['estimatedMinutes'],
                                             '原学习时长被覆盖；浏览估算必须另存 readingMinutes')
        expected = sum('estimatedMinutes' in s for d in self.baseline.values() for s in d['sections'])
        self.assertEqual(checked, expected, '必须对照全部存量章节，不能只抽查或跳过条目')


if __name__ == '__main__':
    unittest.main(verbosity=2)
