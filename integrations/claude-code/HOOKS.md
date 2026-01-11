# Claude Code Hooks - Manus 2-Action Rule Implementation

**Purpose:** Understanding how the Manus inline logging hook works with Claude Code's lifecycle events.

---

## Hook System Overview

Claude Code hooks provide deterministic control over behavior without relying on LLM decisions. The Manus 2-Action Rule uses **PreToolUse** hooks to intercept visual operations.

### Hook Selection

| Lifecycle Event | Purpose | Manus Usage |
|-----------------|---------|-------------|
| **PreToolUse** | Trigger before tool execution | ✅ Log WebFetch/WebSearch operations |
| **PostToolUse** | Validate after execution | Not used (non-blocking logging) |
| **UserPromptSubmit** | Inject context before prompts | Not used |
| **Stop** | Validate before session end | Not used |

---

## Exit Code Strategy

```
Exit 0: Approve/pass (operation continues) ← Manus hook always uses this
Exit 2: Block with feedback (operation rejected, message shown)
Other:  Non-blocking error (shown to user, operation continues)
```

**Manus Philosophy:** Never block operations. Log and remind only.

---

## Inline Kanban Logging Pattern

### Where Logs Go

```
docs/todo/{admin|api|public}/kanban.md → **Notes** section  ← Manus 2-Action Rule logging
```

**NOT separate files** - logs live inline with tasks in kanban.md.

### Manus 2-Action Rule Logging

- **Location:** Inline in task's **Notes** section in kanban.md
- **Format:** Human-readable markdown list
- **Tracked operations:** WebFetch, WebSearch (visual/browser tools)
- **Counter:** `/tmp/claude-visual-ops-session.txt`
- **Trigger:** Reminder after every 2 operations to create findings file
- **Archive-safe:** Logs move with task when archived to archive.md

### Log Entry Format

```markdown
**Notes**:
Implementation progress documented in findings.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://nextjs.org/docs
- 2026-01-11 10:31:22 - WebSearch: "Claude Code best practices"
```

### Workflow

1. WebFetch/WebSearch triggers hook
2. Operation logged inline to task's **Notes** section
3. Counter incremented
4. After 2 operations: Reminder to create findings file
5. Manual reset of counter after findings created (optional)

---

## Hook Configuration

### File: `.claude/hooks.json`

```json
{
  "preToolUse": [
    {
      "matcher": "WebFetch|WebSearch",
      "hooks": [
        {
          "command": "python3 $CLAUDE_PROJECT_DIR/.claude/hooks/pre-tool-use-2-action-reminder.py"
        }
      ]
    }
  ]
}
```

**Matcher:** Regular expression matching tool names
**Command:** Shell command to execute (receives JSON via stdin)

---

## Hook Implementation Pattern

### Non-Blocking by Default

```python
try:
    # Hook logic
    if should_remind:
        print("Reminder message", file=sys.stderr)

    # ALWAYS allow operation
    sys.exit(0)

except Exception as e:
    # Log error but don't block operation
    print(f"Hook error (non-blocking): {e}", file=sys.stderr)
    sys.exit(0)
```

**Critical:** Exit 0 in all cases. Never block user's workflow.

### Tool Input Format

Hook receives JSON via stdin:

```json
{
  "tool_name": "WebFetch",
  "tool_input": {
    "url": "https://example.com",
    "prompt": "What is on this page?"
  }
}
```

### Session Counter Pattern

```python
COUNTER_FILE = "/tmp/claude-visual-ops-session.txt"

def increment_visual_ops():
    """Increment and return operation counter"""
    count = 0
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, 'r') as f:
            count = int(f.read().strip() or "0")

    count += 1
    with open(COUNTER_FILE, 'w') as f:
        f.write(str(count))

    return count
```

**Reset:** `rm /tmp/claude-visual-ops-session.txt`

### Kanban Task Detection

```python
def get_current_task():
    """Find in-progress task in kanban.md"""
    kanban_file = Path(PROJECT_DIR) / "kanban.md"

    if not kanban_file.exists():
        return None, None

    with open(kanban_file, 'r') as f:
        content = f.read()

    # Look for in-progress tasks
    if "**Status**: in-progress" in content:
        for line in content.split('\n'):
            if "**Status**: in-progress" in line:
                # Look backwards for TASK-XXX header
                idx = content.index(line)
                before = content[:idx]
                for prev_line in reversed(before.split('\n')):
                    if prev_line.startswith('### TASK-'):
                        task_id = prev_line.split('|')[0].strip().replace('### ', '')
                        return task_id, kanban_file

    return None, None
```

### Markdown Parsing and Injection

See `pre-tool-use-2-action-reminder.py` for full implementation of:
- Finding task blocks with regex
- Locating or creating **Notes** section
- Locating or creating **Visual Operations Log** header
- Appending new log lines
- Writing back to kanban file

---

## Why Inline Logging?

### Benefits

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | Logs live with task, not in separate files |
| **Survives Archiving** | Logs move with task when archived to archive.md |
| **No File Management** | No separate log files to maintain or clean up |
| **Human Readable** | Markdown format, easy to scan and understand |
| **Always in Context** | Logs linked to specific work being done |
| **Audit Trail** | Complete history of visual research operations per task |

### Problems with Separate Log Files

- Time-based logs (YYYY-MM-DD.jsonl) separate research from tasks
- Requires querying/filtering to find task-specific operations
- Lost when tasks are archived (unless manually linked)
- Extra file management overhead
- Not human-readable (JSONL format)

---

## Testing

### Manual Hook Test

```bash
# Test WebFetch
echo '{"tool_name":"WebFetch","tool_input":{"url":"https://example.com"}}' | \
  python3 .claude/hooks/pre-tool-use-2-action-reminder.py

# Check kanban.md - should see log entry in in-progress task Notes section
```

### Expected Output

```
✅ Logged to TASK-XXX Notes section: - 2026-01-11 14:30:45 - WebFetch: https://example.com

======================================================================
🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH
======================================================================

📊 Visual operations count: 2
📋 Current task: TASK-XXX
📝 Logs appended to: kanban.md → TASK-XXX Notes

✅ NEXT STEP: Create or update findings file
   Location: findings/TASK-XXX.md
======================================================================
```

---

## Troubleshooting

### Hook Not Running

**Symptom:** No logs appearing in kanban

**Fix:**
1. Check hooks.json is in `.claude/hooks.json`
2. Verify hook path is correct
3. Test hook manually (see Testing section)
4. Check Python path: `which python3`

### Task Not Found

**Symptom:** "Warning: Could not find task TASK-XXX"

**Fix:**
1. Ensure task exists in kanban.md
2. Verify task has `**Status**: in-progress`
3. Check KANBAN_FILES paths in hook script

### Logs Not Appending

**Symptom:** Hook runs but logs don't appear

**Fix:**
1. Check task has proper MarkdownTaskManager format
2. Verify Notes section exists (or will be created)
3. Check file permissions on kanban.md

### Counter Stuck

**Symptom:** Always shows same count

**Fix:**
```bash
rm /tmp/claude-visual-ops-session.txt
```

---

## Production Experience

**Implemented:** Setsail project (2026-01-11)
**Status:** Production
**Tasks logged:** TASK-282 (Manus logging implementation itself)

**Key lessons:**
1. **Inline > Separate files** - Simpler, no file management overhead
2. **Archive-safe** - Logs survive task lifecycle (todo → done → archived)
3. **Human-readable** - Team can read logs without tools
4. **Task-specific** - Each task has complete audit trail
5. **Zero maintenance** - No log rotation, cleanup, or retention policies needed

---

## References

- **Manus Philosophy:** Meta AI's 2-Action Rule (company acquired for $2B)
- **Claude Code Hooks:** https://code.claude.com/docs/hooks
- **MarkdownTaskManager:** https://github.com/kepptic/MarkdownTaskManager

---

**Version:** 1.0.0 | **Status:** Production Pattern
