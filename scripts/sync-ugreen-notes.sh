#!/usr/bin/env bash
#
# sync-ugreen-notes.sh
# 从 macOS 备忘录智能文件夹「绿联工作记录」导出笔记原始文本到本地，
# 并与状态文件 .ugreen-notes-state.json 对比，打印「新增 / 已修改」清单。
#
# 用法：
#   ./scripts/sync-ugreen-notes.sh                       # 导出 + 报告
#   ./scripts/sync-ugreen-notes.sh mark <KEY> <POST_PATH> # 标记已整理
#
set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RAW_DIR="$REPO_ROOT/scripts/.ugreen-raw"
STATE_FILE="$REPO_ROOT/.ugreen-notes-state.json"

mkdir -p "$RAW_DIR"

DUMP_FILE="$RAW_DIR/.dump.applescript"
cat > "$DUMP_FILE" <<'APPLESCRIPT'
tell application "Notes"
  set theFolder to folder "绿联工作记录"
  set theNotes to notes of theFolder
  set out to ""
  repeat with nt in theNotes
    set nid to id of nt
    set t to name of nt
    set c to creation date of nt as string
    set m to modification date of nt as string
    set p to plaintext of nt
    set out to out & "UGREEN_REC_START" & linefeed & nid & linefeed & "UGREEN_FIELD" & linefeed & t & linefeed & "UGREEN_FIELD" & linefeed & c & linefeed & "UGREEN_FIELD" & linefeed & m & linefeed & "UGREEN_FIELD" & linefeed & p & linefeed & "UGREEN_REC_END" & linefeed
  end repeat
  return out
end tell
APPLESCRIPT

if [ $# -ge 1 ] && [ "$1" = "mark" ]; then
  KEY="$2"
  POST_PATH="$3"
  RAW_FILE="$RAW_DIR/$KEY.txt"
  if [ ! -f "$RAW_FILE" ]; then
    echo '找不到原始文件:' "$RAW_FILE"
    exit 1
  fi
  python3 - "$STATE_FILE" "$RAW_FILE" "$POST_PATH" <<'PY'
import sys, os, json, re
state_file, raw_file, post_path = sys.argv[1], sys.argv[2], sys.argv[3]
state = {"notes": {}}
if os.path.exists(state_file):
    try:
        state = json.load(open(state_file, encoding="utf-8"))
    except Exception:
        state = {"notes": {}}
state.setdefault("notes", {})
txt = open(raw_file, encoding="utf-8").read()
m_id = re.search("^UGREEN_ID:(.*)$", txt, re.M)
m_title = re.search("^UGREEN_TITLE:(.*)$", txt, re.M)
m_mod = re.search("^UGREEN_MODIFIED:(.*)$", txt, re.M)
key = os.path.splitext(os.path.basename(raw_file))[0]
state["notes"][key] = {
    "id": m_id.group(1).strip() if m_id else "",
    "title": m_title.group(1).strip() if m_title else "",
    "modified": m_mod.group(1).strip() if m_mod else "",
    "postPath": post_path,
    "status": "done",
}
json.dump(state, open(state_file, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("marked:", key, "->", post_path)
PY
  exit 0
fi

echo '导出备忘录智能文件夹「绿联工作记录」...'
TMP_DUMP="$RAW_DIR/.dump.txt"
osascript "$DUMP_FILE" > "$TMP_DUMP"
python3 - "$RAW_DIR" "$STATE_FILE" "$TMP_DUMP" <<'PY'
import sys, os, json, re, glob

raw_dir, state_file, dump_file = sys.argv[1], sys.argv[2], sys.argv[3]
REC_START = "UGREEN_REC_START"
REC_END = "UGREEN_REC_END"
FIELD = "UGREEN_FIELD"
NL = chr(10)

data = open(dump_file, encoding="utf-8").read()
records = data.split(REC_END)
written = 0
for rec in records:
    rec = rec.strip()
    if not rec.startswith(REC_START):
        continue
    body = rec[len(REC_START):].strip(NL)
    parts = body.split(FIELD)
    if len(parts) < 5:
        continue
    nid = parts[0].strip(NL)
    title = parts[1].strip(NL)
    created = parts[2].strip(NL)
    modified = parts[3].strip(NL)
    text = FIELD.join(parts[4:])
    safe = re.sub("[^A-Za-z0-9]", "_", nid)
    key = safe
    out_path = os.path.join(raw_dir, key + ".txt")
    content = ("UGREEN_ID: " + nid + NL + "UGREEN_TITLE: " + title + NL + "UGREEN_CREATED: " + created + NL + "UGREEN_MODIFIED: " + modified + NL + "=====BODY=====" + NL + text)
    open(out_path, "w", encoding="utf-8").write(content)
    written += 1

print("已导出 " + str(written) + " 篇到 " + raw_dir)

state = {"notes": {}}
if os.path.exists(state_file):
    try:
        state = json.load(open(state_file, encoding="utf-8"))
    except Exception:
        state = {"notes": {}}
notes_state = state.get("notes", {})

new_ids, changed_ids, uptodate = [], [], []
for f in sorted(glob.glob(os.path.join(raw_dir, "*.txt"))):
    if os.path.basename(f).startswith(".dump"):
        continue
    txt = open(f, encoding="utf-8").read()
    m_title = re.search("^UGREEN_TITLE:(.*)$", txt, re.M)
    m_mod = re.search("^UGREEN_MODIFIED:(.*)$", txt, re.M)
    if not (m_title and m_mod):
        continue
    title = m_title.group(1).strip()
    mod = m_mod.group(1).strip()
    key = os.path.splitext(os.path.basename(f))[0]
    prev = notes_state.get(key)
    if prev is None:
        new_ids.append((key, title, mod))
    elif prev.get("modified") != mod:
        changed_ids.append((key, title, mod))
    else:
        uptodate.append((key, title))

print("")
print("=== NEW (" + str(len(new_ids)) + ") 新增 ===")
for k, t, m in new_ids:
    print("  [" + k + "] " + t + "  (mod " + m + ")")
print("")
print("=== CHANGED (" + str(len(changed_ids)) + ") 已修改 ===")
for k, t, m in changed_ids:
    print("  [" + k + "] " + t + "  (mod " + m + ")")
print("")
print("=== UP-TO-DATE (" + str(len(uptodate)) + ") 已整理无变化 ===")
for k, t in uptodate:
    print("  [" + k + "] " + t)
print("")
PY
