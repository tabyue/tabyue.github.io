"""
第二轮修复：精确处理代码块外的所有残留 \" 
上一轮遗漏了部分引号对（前后字符被误判为"代码场景"）。

策略：
1. 将 content 按 ``` 分割为 代码块/非代码块
2. 非代码块中：所有 " → 中文引号 "..."（配对替换）
3. 代码块中：不动
"""
import json, os, re, glob

LEARN_DIR = "data/learn"

def fix_quotes_outside_code(content):
    """将代码块外的所有ASCII双引号替换为中文引号"""
    parts = content.split('```')
    changed = False
    
    for i in range(len(parts)):
        if i % 2 == 0:  # 非代码块（偶数索引）
            text = parts[i]
            if '"' not in text:
                continue
            
            # 配对替换：每两个连续的 " 变为 "..."
            new_text = []
            quote_open = False
            for ch in text:
                if ch == '"':
                    if not quote_open:
                        new_text.append('\u201c')  # "
                        quote_open = True
                    else:
                        new_text.append('\u201d')  # "
                        quote_open = False
                    changed = True
                else:
                    new_text.append(ch)
            
            # 如果有未配对的开引号，回退为ASCII
            if quote_open:
                # 找最后一个中文左引号，换回ASCII
                for j in range(len(new_text)-1, -1, -1):
                    if new_text[j] == '\u201c':
                        new_text[j] = '"'
                        break
                changed = True  # 其他已替换的还是生效
            
            parts[i] = ''.join(new_text)
    
    return '```'.join(parts), changed


def process_all():
    files = sorted(glob.glob(os.path.join(LEARN_DIR, "*.json")))
    total_fixed = 0
    
    for fpath in files:
        fname = os.path.basename(fpath)
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        file_changed = False
        for sec in data.get('sections', []):
            if 'content' not in sec or not isinstance(sec['content'], str):
                continue
            old = sec['content']
            if '"' not in old:
                continue
            
            new, changed = fix_quotes_outside_code(old)
            if changed and new != old:
                sec['content'] = new
                file_changed = True
                # Count remaining quotes
                remaining = sum(1 for i in range(len(new)) if new[i] == '"' and (i == 0 or True))
                # Count outside code blocks
                parts = new.split('```')
                outside_quotes = sum(p.count('"') for i, p in enumerate(parts) if i % 2 == 0)
                code_quotes = sum(p.count('"') for i, p in enumerate(parts) if i % 2 == 1)
                print(f"  {sec.get('title','?')}: outside_code \" remaining={outside_quotes}, in_code \"={code_quotes}")
        
        if file_changed:
            with open(fpath, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            total_fixed += 1
            print(f"  -> Saved {fname}")
    
    print(f"\nFixed {total_fixed} files")
    
    # Validate
    print("\nValidating...")
    for fpath in files:
        try:
            json.load(open(fpath, encoding='utf-8'))
        except Exception as e:
            print(f"  INVALID: {os.path.basename(fpath)}: {e}")
            return
    print("  All JSON valid!")

if __name__ == '__main__':
    process_all()
