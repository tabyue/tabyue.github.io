import json

with open('data/learn/physics-simulation.json', 'r', encoding='utf-8') as f:
    raw = f.read()

# Find the new section
idx = raw.find('"视频世界模型：从物理引擎到可学习仿真器"')
content_start = raw.find('"content": "', idx)
value_start = content_start + len('"content": "')

# Find end of content value
pos = value_start
while pos < len(raw):
    if raw[pos] == '"' and raw[pos-1] != '\\':
        rest = raw[pos+1:pos+20].strip()
        if rest.startswith('\n') or rest.startswith('}') or rest.startswith(','):
            break
    pos += 1
content_end = pos

# Extract content value
content_value = raw[value_start:content_end]

# Fix: escape all unescaped double quotes within the content
fixed = []
i = 0
while i < len(content_value):
    c = content_value[i]
    if c == '"':
        if i == 0 or content_value[i-1] != '\\':
            fixed.append('\\"')
        else:
            fixed.append(c)
    else:
        fixed.append(c)
    i += 1

fixed_content = ''.join(fixed)

# Reconstruct
new_raw = raw[:value_start] + fixed_content + raw[content_end:]

# Validate
try:
    json.loads(new_raw)
    print("JSON valid!")
    with open('data/learn/physics-simulation.json', 'w', encoding='utf-8') as f:
        f.write(new_raw)
    print("File saved.")
except json.JSONDecodeError as e:
    print(f"Still error: {e}")
