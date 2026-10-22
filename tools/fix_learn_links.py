# -*- coding: utf-8 -*-
"""学习中心内链校验/修复：按「链接文字」核对「目标章节标题」

为什么需要：章节重排后，`[某章标题](/learn/mod/7)` 里的 7 可能已经指向别的章节。
这类错误 health_check 抓不到（索引没越界，只是指错了），只能靠文字与标题比对。
另外站内历史上有一批按 0-based 写的内链（`/mod/0` 指第一章），而 URL 是 1-based，
造成整组 off-by-one。

策略：
  - 链接文字与目标章节标题匹配 → OK
  - 不匹配 → 在目标模块内按标题相似度找最佳章节；足够像就修正，否则只报告
  - 链接文字形如「XX 模块」「XX 总览」→ 指向模块首页是合理的，跳过

用法：
    python tools/fix_learn_links.py --dry    # 报告（默认建议）
    python tools/fix_learn_links.py          # 执行修正（之后跑 sync_learn_split.py）
"""
import argparse
import difflib
import glob
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEARN = os.path.join(ROOT, 'data', 'learn')

# [文字](/learn/mod) 或 [文字](/learn/mod/N)
LINK = re.compile(r'\[([^\]\n]{1,60})\]\((/learn/([a-z0-9-]+)(?:/(\d+))?)\)')
# 指向整个模块是合理的（不该被改成具体章节）
MODULE_LEVEL = re.compile(r'(模块|总览|全景|专题|板块|学习中心|章节列表|大纲)\s*$')
# 链接文字里的噪声：方向箭头、"sec-N"、"本模块"、通用后缀
NOISE = re.compile(r'(^[→➔⇒\s]+|sec[-\s]?\d+|本模块|本站|本章|第\s*\d+\s*[节章]|'
                   r'完整解析|完整指南|完整教程|详解|诠释|全解析)')
# 括号补充说明：有时是模块/编号引用（该剥），有时是唯一的有效标题信息
# （如「ai-infra sec-24（双频异步推理）」），所以剥与不剥两种形态都要参与比对
PARENS = re.compile(r'[（(][^）)]*[）)]')

MATCH_OK = 0.62      # 文字与目标标题视为"指对了"
MATCH_FIX = 0.72     # 有章节号时，候选足够像才敢改
MATCH_MOD = 0.85     # 无章节号（指模块首页）时，要极像才改成具体章节

# 链接文字不像章节标题，而是论文引用/性能描述/纯编号 —— 这类指哪儿都不该机械改
NOT_A_TITLE = re.compile(
    r'(token/s|p\d{2,}|arxiv|\d+\s*[/／]\s*\d+|~?\d+\s*(ms|fps|hz|gb|b\b)|'
    r'^sec[-\s]?\d+$|^\d+$|^第?\s*\d+\s*[章节]$)', re.I)


def norm(s):
    s = NOISE.sub(' ', s or '')
    s = re.sub(r'[\s\u3000:：、，,。.·\-—_|/（）()「」【】]+', '', s)
    return s.lower()


def tokens(s):
    """词元化：Latin 单词 + CJK 二元组。
    比「字符级有序覆盖」可靠得多 —— 后者对短 Latin 串太宽松，
    能在长标题里凑出高分子序列（实测把「ai-infra 双频异步推理」
    错配到「3D-aware VLA 工程化」）。"""
    s = (s or '').lower()
    lat = re.findall(r'[a-z0-9+#]{2,}', s)
    cjk = re.findall(r'[\u4e00-\u9fa5]+', s)
    out = set(lat)
    for run in cjk:
        if len(run) == 1:
            out.add(run)
        else:
            out.update(run[i:i + 2] for i in range(len(run) - 1))
    return out


def variants(txt, mod_tokens=frozenset()):
    """链接文字的待比对形态：剥括号 / 保留括号。
    剥括号能去掉「（平台工程 sec-6）」这类引用噪声，
    保留括号能救回「（双频异步推理）」这类括号内才有真标题的情况。

    词元全部落在「目标模块名」范围内的形态要作废 —— 例如
    「数据工程 sec-13」去掉 sec-13 后只剩模块名「数据工程」，
    再去和章节标题比就是在赌运气（实测会靠子串凑出 0.82 的假阳性）。"""
    out, seen = [], set()
    for t in (PARENS.sub(' ', txt or ''), txt or ''):
        n = NOISE.sub(' ', t)
        tk = frozenset(tokens(n))
        if not tk or (mod_tokens and tk <= mod_tokens):
            continue
        # 模块名只是定位前缀（「ai-infra sec-24（双频异步推理）」里的 ai/infra），
        # 不该参与评分 —— 留着会稀释覆盖率，把真目标压到阈值之下
        tk = frozenset(tk - mod_tokens) or tk
        if tk in seen:
            continue
        seen.add(tk)
        out.append((norm(t), tk))
    return out


def sim(q_norm, q_tok, t_norm, t_tok):
    """以「查询词元被目标覆盖的比例」为主，严格子串关系给高分。"""
    if not q_norm or not t_norm:
        return 0.0
    if q_norm == t_norm:
        return 1.0
    if q_norm in t_norm or t_norm in q_norm:
        return max(0.82, min(len(q_norm), len(t_norm)) / max(len(q_norm), len(t_norm)))
    if not q_tok or not t_tok:
        return 0.0
    inter = len(q_tok & t_tok)
    cover = inter / len(q_tok)                      # 查询有多少被目标覆盖
    dice = 2 * inter / (len(q_tok) + len(t_tok))    # 双向相似，抑制"长标题吞一切"
    return max(cover * 0.92, dice)


def best_sim(txt_variants, alias_pairs):
    return max((sim(qn, qt, tn, tt)
                for qn, qt in txt_variants
                for tn, tt in alias_pairs), default=0.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    args = ap.parse_args()

    mods = {}
    for f in sorted(glob.glob(os.path.join(LEARN, '*.json'))):
        mods[os.path.basename(f)[:-5]] = json.load(io.open(f, encoding='utf-8'))
    titles = {m: [s.get('title', '') for s in d.get('sections', [])] for m, d in mods.items()}

    # 每个章节的"可匹配别名"：全名 / 主标题（副标题前）/ shortTitle。
    # 链接文字常用简称（「可观测性完整指南」），而标题带长副标题
    # （「可观测性（Observability）：日志、指标与追踪」），只比全名会漏判。
    def aliases(sec):
        t = sec.get('title', '')
        out = {t}
        head = re.split(r'[：:｜|—–]', t, maxsplit=1)[0].strip()
        if len(head) >= 4:
            out.add(head)
        if sec.get('shortTitle'):
            out.add(sec['shortTitle'].rstrip('…'))
        pairs, seen = [], set()
        for x in out:
            if not x:
                continue
            n = norm(x)
            if n and n not in seen:
                seen.add(n)
                pairs.append((n, tokens(NOISE.sub(' ', x))))
        return pairs

    alias_map = {m: [aliases(s) for s in d.get('sections', [])] for m, d in mods.items()}
    # 模块名词元：用于识别「链接文字只剩模块名」的无效形态
    mod_tokens = {m: tokens(m) | tokens(d.get('name', '')) for m, d in mods.items()}

    def best_match(txt_vars, tgt):
        """返回 (score, idx, title)"""
        res = [(best_sim(txt_vars, al), i, titles[tgt][i])
               for i, al in enumerate(alias_map[tgt])]
        return max(res) if res else (0.0, -1, '')

    fixed, flagged, lowconf = [], [], []
    skipped = 0

    for mid, d in mods.items():
        for si, sec in enumerate(d.get('sections', [])):
            c = sec.get('content') or ''
            if '/learn/' not in c:
                continue

            def repl(m):
                nonlocal skipped
                txt, full, tgt, num = m.group(1), m.group(2), m.group(3), m.group(4)
                if tgt not in titles:
                    return m.group(0)
                tl = titles[tgt]
                here = '%s#%d' % (mid, si)

                # 模块级链接（"XX模块""XX总览"）指向模块首页是合理的
                if MODULE_LEVEL.search(txt.strip()):
                    skipped += 1
                    return m.group(0)
                # 链接文字是论文引用/性能数字/纯编号 —— 无法据此判断该指哪儿
                if NOT_A_TITLE.search(txt.strip()) or len(norm(txt)) < 4:
                    lowconf.append('%s  [%s] → %s （文字非章节名，跳过）' % (here, txt[:40], full))
                    return m.group(0)

                tv = variants(txt, mod_tokens[tgt])
                if not tv:
                    lowconf.append('%s  [%s] → %s （文字只剩模块名，无法定位章节）' % (
                        here, txt[:40], full))
                    return m.group(0)
                cur = None
                cur_score = 0.0
                if num is not None:
                    n = int(num)
                    if 1 <= n <= len(tl):
                        cur = tl[n - 1]
                        cur_score = best_sim(tv, alias_map[tgt][n - 1])

                if cur is not None and cur_score >= MATCH_OK:
                    return m.group(0)       # 已经指对了

                best, bi, bt = best_match(tv, tgt)
                need = MATCH_FIX if num is not None else MATCH_MOD
                # 候选必须明显优于当前指向，否则不动（避免在两个相近章节间反复横跳）
                if best >= need and best >= cur_score + 0.12:
                    new = '/learn/%s/%d' % (tgt, bi + 1)
                    if new == full:
                        return m.group(0)
                    fixed.append('%s  [%s]\n    %s → %s\n    目标: %s  (%.2f%s)' % (
                        here, txt[:38], full, new, bt[:46], best,
                        '，原指向: ' + cur[:28] if cur else '，原指向模块首页'))
                    return '[%s](%s)' % (txt, new)

                if num is None:
                    skipped += 1        # 指模块首页且没有明确章节目标 —— 合法
                    return m.group(0)
                flagged.append('%s  [%s] → %s\n    原指向: %s (%.2f)\n    最佳候选: %s (%.2f)' % (
                    here, txt[:38], full, (cur or '?')[:40], cur_score, bt[:40], best))
                return m.group(0)

            nc = LINK.sub(repl, c)
            if nc != c:
                sec['content'] = nc
                sec['chars'] = len(nc)

    # 报告由脚本自己写 UTF-8 文件 —— 不要用 shell 管道转存，
    # PowerShell 会按 GBK 解码 Python 的 UTF-8 stdout，中文全乱码。
    rep = []
    rep.append('=== 可自动修正 %d 处 ===' % len(fixed))
    rep += fixed
    rep.append('')
    rep.append('=== 需人工确认 %d 处（有章节号但文字对不上任何章节）===' % len(flagged))
    rep += flagged
    rep.append('')
    rep.append('=== 低置信跳过 %d 处（链接文字不是章节名）===' % len(lowconf))
    rep += lowconf
    rep.append('')
    rep.append('模块级/合法首页链接跳过 %d 处' % skipped)
    rep_path = os.path.join(ROOT, 'tools', '_links_report.txt')
    io.open(rep_path, 'w', encoding='utf-8').write('\n'.join(rep))
    print('fixed=%d  flagged=%d  lowconf=%d  skipped=%d' % (
        len(fixed), len(flagged), len(lowconf), skipped))
    print('report -> tools/_links_report.txt')

    if args.dry:
        print('\nDRY RUN，未写盘')
        return
    if not fixed:
        print('\n无需改动')
        return
    for mid, d in mods.items():
        io.open(os.path.join(LEARN, mid + '.json'), 'w', encoding='utf-8').write(
            json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    print('\n已写入 —— 记得跑 tools/sync_learn_split.py')


if __name__ == '__main__':
    main()
