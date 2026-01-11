# Manus 2-Action Rule: Inline Logging Pattern

**Version:** 1.0.0 | **Date:** 2026-01-11
**Status:** Production-tested in Setsail project

---

## Overview

This document describes the **inline logging pattern** for implementing the Manus 2-Action Rule with MarkdownTaskManager kanban files.

**Key Insight:** Visual operation logs are **task-specific work artifacts**, not time-based infrastructure logs. Therefore, they should live **inline with tasks** in kanban.md, not in separate log files.

---

## Why Inline Logging?

### ✅ Benefits

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | Logs live with task, not in separate files |
| **Survives Archiving** | Logs move with task when archived to archive.md |
| **No File Management** | No separate log files to maintain or clean up |
| **Human Readable** | Markdown format, easy to scan and understand |
| **Always in Context** | Logs linked to specific work being done |
| **Audit Trail** | Complete history of visual research operations per task |

### ❌ Problems with Separate Log Files

- Time-based logs (YYYY-MM-DD.jsonl) separate research from tasks
- Requires querying/filtering to find task-specific operations
- Lost when tasks are archived (unless manually linked)
- Extra file management overhead
- Not human-readable (JSONL format)

---

## Implementation Pattern

### 1. Hook: PreToolUse on WebFetch/WebSearch

```python
#!/usr/bin/env python3
"""
PreToolUse hook for Manus 2-Action Rule inline logging
Appends visual operations to task's Notes section in kanban.md
"""

import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime

PROJECT_DIR = os.getenv("CLAUDE_PROJECT_DIR", os.getcwd())
COUNTER_FILE = "/tmp/claude-visual-ops-session.txt"

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

def append_log_to_kanban(kanban_file, task_id, log_line):
    """Append log entry to task's Notes section"""
    try:
        with open(kanban_file, 'r') as f:
            content = f.read()

        # Find task block (from ### TASK-XXX until next ### or end)
        task_pattern = rf'(### {re.escape(task_id)} \|[^\n]*\n.*?)(\n### TASK-|\n<!-- Config:|\Z)'
        match = re.search(task_pattern, content, re.DOTALL)

        if not match:
            return False

        task_block = match.group(1)

        # Check if Notes section exists
        if '**Notes**:' in task_block:
            # Append to existing Notes
            notes_pattern = r'(\*\*Notes\*\*:\n)(.*?)(\n\*\*|$)'
            notes_match = re.search(notes_pattern, task_block, re.DOTALL)

            if notes_match:
                existing_notes = notes_match.group(2).rstrip()

                # Check if Visual Operations Log header exists
                if '**Visual Operations Log**:' in existing_notes:
                    # Append to existing log
                    log_header_pattern = r'(\*\*Visual Operations Log\*\*:\n)(.*?)(\n\*\*|$)'
                    log_match = re.search(log_header_pattern, existing_notes, re.DOTALL)

                    if log_match:
                        existing_log = log_match.group(2).rstrip()
                        new_log = f"{existing_log}\n{log_line}"
                        new_notes = existing_notes.replace(
                            f"**Visual Operations Log**:\n{existing_log}",
                            f"**Visual Operations Log**:\n{new_log}"
                        )
                    else:
                        new_notes = f"{existing_notes}\n{log_line}"
                else:
                    # Add log header and first entry
                    new_notes = f"{existing_notes}\n\n**Visual Operations Log**:\n{log_line}"

                new_task_block = task_block.replace(
                    f"**Notes**:\n{existing_notes}",
                    f"**Notes**:\n{new_notes}"
                )
            else:
                # Notes section exists but is empty
                new_task_block = task_block.replace(
                    "**Notes**:",
                    f"**Notes**:\n\n**Visual Operations Log**:\n{log_line}"
                )
        else:
            # Add Notes section with log
            insert_point = task_block.rfind('\n**')
            if insert_point > 0:
                new_task_block = (
                    task_block[:insert_point] +
                    f"\n\n**Notes**:\n\n**Visual Operations Log**:\n{log_line}" +
                    task_block[insert_point:]
                )
            else:
                new_task_block = task_block + f"\n\n**Notes**:\n\n**Visual Operations Log**:\n{log_line}"

        # Replace in full content
        new_content = content.replace(task_block, new_task_block)

        # Write back
        with open(kanban_file, 'w') as f:
            f.write(new_content)

        return True

    except Exception as e:
        print(f"Error appending log: {e}", file=sys.stderr)
        return False

def increment_counter():
    """Increment and return operation counter"""
    count = 0
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, 'r') as f:
            count = int(f.read().strip() or "0")

    count += 1
    with open(COUNTER_FILE, 'w') as f:
        f.write(str(count))

    return count

def main():
    try:
        # Read tool input
        tool_input = json.loads(sys.stdin.read())
        tool_name = tool_input.get("tool_name", "")
        tool_params = tool_input.get("tool_input", {})

        # Only track WebFetch and WebSearch
        if tool_name not in ["WebFetch", "WebSearch"]:
            sys.exit(0)

        # Increment counter
        count = increment_counter()
        task_id, kanban_file = get_current_task()

        # Format log entry
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if tool_name == "WebFetch":
            url = tool_params.get("url", "unknown")
            log_line = f"- {timestamp} - WebFetch: {url}"
        else:  # WebSearch
            query = tool_params.get("query", "unknown")
            log_line = f'- {timestamp} - WebSearch: "{query}"'

        # Append to kanban
        if task_id and kanban_file:
            success = append_log_to_kanban(kanban_file, task_id, log_line)
            if success:
                print(f"✅ Logged to {task_id} Notes: {log_line}", file=sys.stderr)

        # Reminder after every 2 operations
        if count % 2 == 0:
            print("\n" + "="*70, file=sys.stderr)
            print("🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH", file=sys.stderr)
            print("="*70, file=sys.stderr)
            print(f"\n📊 Visual operations count: {count}", file=sys.stderr)

            if task_id:
                print(f"📋 Current task: {task_id}", file=sys.stderr)
                print(f"📝 Logs appended to: kanban.md → {task_id} Notes", file=sys.stderr)

            print("\n✅ NEXT STEP: Create or update findings file", file=sys.stderr)
            print("="*70 + "\n", file=sys.stderr)

        # Always allow operation
        sys.exit(0)

    except Exception as e:
        print(f"Hook error (non-blocking): {e}", file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()
```

### 2. Hooks Configuration (hooks.json)

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

---

## Log Format

### In Kanban Task

```markdown
### TASK-XXX | Task Title
**Priority**: High | **Category**: Research | **Status**: in-progress
**Created**: 2026-01-11 | **Started**: 2026-01-11
**Tags**: #research #manus

Research visual content and create findings.

**Subtasks**:
- [ ] Browse documentation
- [ ] Analyze screenshots
- [ ] Create findings file

**Notes**:
Initial research findings show promising patterns.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://nextjs.org/docs
- 2026-01-11 10:31:22 - WebSearch: "Claude Code best practices"
- 2026-01-11 10:35:10 - WebFetch: https://anthropic.com/claude-code
- 2026-01-11 10:40:15 - WebSearch: "Manus philosophy Meta AI"
```

### When Archived

When task is archived (moved to archive.md), the **Visual Operations Log** moves with it - complete audit trail preserved!

---

## Workflow

1. **Start task** - Set status to `in-progress` in kanban.md
2. **Use WebFetch/WebSearch** - Hook automatically appends log line to Notes section
3. **Counter increments** - Stored in `/tmp/claude-visual-ops-session.txt`
4. **After 2 operations** - Hook shows reminder to create findings file
5. **Create findings** - Document insights in separate findings file
6. **Reset counter** (optional) - `rm /tmp/claude-visual-ops-session.txt`
7. **Complete task** - Logs stay with task, survive archiving

---

## Multi-Workspace Support

For projects with multiple kanban files (e.g., `docs/todo/admin/kanban.md`, `docs/todo/api/kanban.md`):

```python
def get_current_task():
    """Find in-progress task across multiple kanban files"""
    kanban_files = [
        Path(PROJECT_DIR) / "docs" / "todo" / "admin" / "kanban.md",
        Path(PROJECT_DIR) / "docs" / "todo" / "api" / "kanban.md",
        Path(PROJECT_DIR) / "docs" / "todo" / "public" / "kanban.md",
    ]

    for kanban_file in kanban_files:
        if kanban_file.exists():
            # ... search for in-progress task
            return task_id, kanban_file

    return None, None
```

---

## Testing

### Manual Test

1. Create test task in kanban.md with `**Status**: in-progress`
2. Run: `echo '{"tool_name":"WebFetch","tool_input":{"url":"https://example.com"}}' | python3 .claude/hooks/pre-tool-use-2-action-reminder.py`
3. Check kanban.md - should see log entry in task's Notes section
4. Run again with WebSearch
5. Should see reminder after 2nd operation

### Expected Output

```bash
✅ Logged to TASK-XXX Notes: - 2026-01-11 10:30:45 - WebFetch: https://example.com

======================================================================
🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH
======================================================================

📊 Visual operations count: 2
📋 Current task: TASK-XXX
📝 Logs appended to: kanban.md → TASK-XXX Notes

✅ NEXT STEP: Create or update findings file
======================================================================
```

---

## Portability

This pattern works with **any** MarkdownTaskManager-based kanban system that follows the task format:

```markdown
### TASK-XXX | Title
**Priority**: ... | **Status**: in-progress
...

**Notes**:
...
```

**Requirements:**
- Claude Code with hooks support
- Python 3.6+ (for hook script)
- MarkdownTaskManager kanban format

---

## Production Experience (Setsail Project)

**Implementation date:** 2026-01-11
**Status:** Production
**Tasks logged:** TASK-282 (Manus logging implementation itself)

**Key lessons:**
1. **Inline > Separate files** - Simpler, no file management overhead
2. **Archive-safe** - Logs survive task lifecycle (todo → done → archived)
3. **Human-readable** - Team can read logs without tools
4. **Task-specific** - Each task has complete audit trail
5. **Zero maintenance** - No log rotation, cleanup, or retention policies needed

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial inline logging pattern documentation |

---

## References

- **Manus Philosophy:** Meta AI's 2-Action Rule (company acquired for $2B)
- **MarkdownTaskManager:** https://github.com/[repo] (if open source)
- **Claude Code Hooks:** https://code.claude.com/docs/hooks

---

**Pattern Status:** ✅ Production-tested
**Recommended For:** All projects using MarkdownTaskManager + Claude Code
