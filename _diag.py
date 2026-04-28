import json

# Check what escaped characters remain in the first section of calculus
with open("data/learn/calculus-optimization.json", "r", encoding="utf-8") as f:
    data = json.load(f)

sec = data["sections"][0]
content = sec["content"]

# After JSON parsing, the content string should NOT contain literal backslash-quote
# Let's find all occurrences of backslash followed by quote
issues = []
for i, ch in enumerate(content):
    if ch == '\\':
        ctx_start = max(0, i-15)
        ctx_end = min(len(content), i+20)
        snippet = content[ctx_start:ctx_end].replace('\n', '\\n')
        issues.append(f"  pos {i}: ...{snippet}...")

print(f"Section: {sec['title']}")
print(f"Content length: {len(content)} chars")
print(f"Backslash occurrences: {content.count(chr(92))}")
print(f"Literal backslash-quote occurrences: {content.count(chr(92) + chr(34))}")

if issues:
    print(f"\nAll backslash positions ({len(issues)}):")
    for iss in issues[:30]:
        print(iss)
else:
    print("No backslashes found in parsed content - problem is in JSON encoding")

# Now check the RAW file for double-escaped quotes
print("\n\n=== RAW FILE CHECK ===")
with open("data/learn/calculus-optimization.json", "r", encoding="utf-8") as f:
    raw = f.read()

# In JSON source, \" is normal (string delimiter), \\" is escaped quote in string
# \\\" means literal backslash + quote in string value
count = raw.count('\\\\\\"')
print(f'Occurrences of \\\\\\" (double-escaped quote) in raw file: {count}')

# Also check for \\" which would be escaped backslash + end of string  
# The pattern we're looking for in the rendered output is \"
# In JSON string value, this is encoded as \\"
# Let's look at the first 2000 chars of content field in raw JSON
import re
# Find content value
matches = list(re.finditer(r'\\\\\\?"', raw[:5000]))
print(f"Regex matches for backslash patterns near quotes in first 5000 chars: {len(matches)}")

# Simpler: just show lines with \\" pattern
lines = raw.split('\n')
for i, line in enumerate(lines[:20]):
    if '\\\\"' in line or "\\\\\\\"" in line:
        # Show just a small part
        idx = line.find('\\\\"')
        if idx == -1:
            idx = line.find("\\\\\\\"")
        start = max(0, idx-30)
        end = min(len(line), idx+50)
        print(f"  Line {i+1}: ...{line[start:end]}...")
