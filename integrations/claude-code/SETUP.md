# Claude Code Integration - Setup Guide

**Version:** 1.0.0 | **Status:** Production-Ready
**For:** MarkdownTaskManager + Claude Code users

---

## Overview

This integration adds **Manus 2-Action Rule** automated research preservation to your MarkdownTaskManager workflow using Claude Code hooks.

**What you get:**
- ✅ Automatic logging of visual operations (WebFetch, WebSearch) to task Notes
- ✅ Reminder after every 2 operations to create findings file
- ✅ Archive-safe logs that survive task lifecycle
- ✅ Zero separate log files - everything inline in kanban.md

---

## Prerequisites

1. **MarkdownTaskManager** - You're already using kanban.md for task tracking
2. **Claude Code** - Claude Code CLI or extension installed
3. **Python 3.6+** - For the hook script

### Verify Prerequisites

```bash
# Check Claude Code
claude --version

# Check Python
python3 --version
```

---

## Installation

### Option 1: Use Provided Files (Recommended)

1. **Copy integration files to your project:**

```bash
# From your project root
cp -r /path/to/MarkdownTaskManager/integrations/claude-code/ .claude/
```

2. **Or manually create `.claude/` directory:**

```bash
mkdir -p .claude/hooks
mkdir -p .claude/skills
```

3. **Copy hook script:**

```bash
cp integrations/claude-code/hooks/pre-tool-use-2-action-reminder.py .claude/hooks/
chmod +x .claude/hooks/pre-tool-use-2-action-reminder.py
```

4. **Copy hooks configuration:**

```bash
cp integrations/claude-code/hooks.json .claude/hooks.json
```

5. **Copy skill file:**

```bash
cp integrations/claude-code/skills/research-preservation.md .claude/skills/
```

### Option 2: Manual Setup

If you prefer to set up from scratch, see [Manual Setup](#manual-setup) section below.

---

## Configuration

### 1. Customize Kanban File Paths

Edit `.claude/hooks/pre-tool-use-2-action-reminder.py`:

```python
# Single kanban file at project root (default)
KANBAN_FILES = [
    Path(PROJECT_DIR) / "kanban.md",
]

# OR multiple kanban files (multi-workspace projects)
KANBAN_FILES = [
    Path(PROJECT_DIR) / "docs" / "admin" / "kanban.md",
    Path(PROJECT_DIR) / "docs" / "api" / "kanban.md",
    Path(PROJECT_DIR) / "docs" / "public" / "kanban.md",
]
```

### 2. Customize Findings Directory (Optional)

```python
# Default: Same directory as kanban file
FINDINGS_DIR = None

# OR custom directory
FINDINGS_DIR = "docs/findings"
# OR
FINDINGS_DIR = "research/findings"
```

### 3. Update hooks.json Path (if needed)

If you placed the hook in a different location:

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

## Testing

### 1. Create Test Task

Add to your `kanban.md`:

```markdown
### TASK-999 | Test Manus Logging
**Priority**: High | **Category**: Test | **Status**: in-progress
**Created**: 2026-01-11 | **Started**: 2026-01-11
**Tags**: #test #manus

Test the Manus 2-Action Rule logging system.

**Subtasks**:
- [ ] Test WebFetch logging
- [ ] Test WebSearch logging
- [ ] Verify findings reminder

**Notes**:
Testing inline logging system.
```

### 2. Test Hook Manually

```bash
# Test WebFetch
echo '{"tool_name":"WebFetch","tool_input":{"url":"https://example.com"}}' | \
  python3 .claude/hooks/pre-tool-use-2-action-reminder.py

# Check kanban.md - should see log entry in TASK-999 Notes section
```

**Expected output:**
```
✅ Logged to TASK-999 Notes section: - 2026-01-11 14:30:45 - WebFetch: https://example.com
```

### 3. Test Counter and Reminder

```bash
# Test WebSearch (should trigger reminder after 2nd operation)
echo '{"tool_name":"WebSearch","tool_input":{"query":"test query"}}' | \
  python3 .claude/hooks/pre-tool-use-2-action-reminder.py
```

**Expected output:**
```
======================================================================
🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH
======================================================================

📊 Visual operations count: 2
📋 Current task: TASK-999
📝 Logs appended to: kanban.md → TASK-999 Notes

✅ NEXT STEP: Create or update findings file
   Location: findings/TASK-999.md
...
======================================================================
```

### 4. Verify Logs in Kanban

Open `kanban.md` and check TASK-999:

```markdown
**Notes**:
Testing inline logging system.

**Visual Operations Log**:
- 2026-01-11 14:30:45 - WebFetch: https://example.com
- 2026-01-11 14:31:22 - WebSearch: "test query"
```

---

## Usage

### 1. Start Task

Set task to `**Status**: in-progress` in kanban.md

### 2. Use Claude Code Normally

When you use WebFetch or WebSearch, logs append automatically:

```bash
# Example: Research Next.js docs
claude "Fetch the Next.js 15 migration guide"
# → WebFetch triggered → logged to task Notes
```

### 3. Create Findings After 2 Operations

When you see the reminder:

```bash
# Create findings file
touch findings/TASK-XXX.md
```

Use the template from `.claude/skills/research-preservation.md`

### 4. Reset Counter (Optional)

```bash
rm /tmp/claude-visual-ops-session.txt
```

---

## Workflow Example

### Before Manus Integration

```
User: "Research form builder patterns"
Claude: [Uses WebFetch, reads docs]
[Context reset]
Claude: "I don't remember what I researched"
User: [Frustrated, has to repeat research]
```

### After Manus Integration

```
User: "Research form builder patterns"
Claude: [Uses WebFetch, logs appear in kanban]
Claude: [Uses WebSearch, gets reminder after 2 ops]
Claude: [Creates findings/TASK-280.md with insights]
[Context reset]
Claude: [Reads findings file, continues from saved insights]
User: [Happy, seamless continuation]
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

## Uninstallation

To remove the integration:

```bash
# Remove hooks
rm -rf .claude/hooks/pre-tool-use-2-action-reminder.py
rm .claude/hooks.json

# Remove skill
rm -rf .claude/skills/research-preservation.md

# Clean up counter
rm /tmp/claude-visual-ops-session.txt
```

---

## Manual Setup

If you prefer to create files from scratch:

### 1. Create Hook Script

Create `.claude/hooks/pre-tool-use-2-action-reminder.py` with content from:
`integrations/claude-code/hooks/pre-tool-use-2-action-reminder.py`

```bash
mkdir -p .claude/hooks
curl -o .claude/hooks/pre-tool-use-2-action-reminder.py \
  https://raw.githubusercontent.com/kepptic/MarkdownTaskManager/master/integrations/claude-code/hooks/pre-tool-use-2-action-reminder.py
chmod +x .claude/hooks/pre-tool-use-2-action-reminder.py
```

### 2. Create hooks.json

Create `.claude/hooks.json`:

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

### 3. Add Skill File

Create `.claude/skills/research-preservation.md` with content from:
`integrations/claude-code/skills/research-preservation.md`

```bash
mkdir -p .claude/skills
curl -o .claude/skills/research-preservation.md \
  https://raw.githubusercontent.com/kepptic/MarkdownTaskManager/master/integrations/claude-code/skills/research-preservation.md
```

---

## Advanced Configuration

### Custom Log Format

Edit the hook to change log line format:

```python
# Default format
log_line = f"- {timestamp} - WebFetch: {url}"

# Custom format (add emojis, different timestamp, etc.)
log_line = f"🔍 {timestamp[:10]} - Fetched: {url}"
```

### Multi-Project Setup

For projects with multiple kanban files:

```python
KANBAN_FILES = [
    Path(PROJECT_DIR) / "team-a" / "kanban.md",
    Path(PROJECT_DIR) / "team-b" / "kanban.md",
    Path(PROJECT_DIR) / "team-c" / "kanban.md",
]
```

### Change Reminder Frequency

Edit the hook to change reminder threshold:

```python
# Remind every 2 operations (default)
if count % 2 == 0:

# OR remind every 3 operations
if count % 3 == 0:

# OR remind every operation
if count % 1 == 0:
```

---

## Support

**Issues:** https://github.com/kepptic/MarkdownTaskManager/issues
**Documentation:** See `docs/MANUS_INLINE_LOGGING.md`
**License:** MIT

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial portable integration release |

---

**Happy researching! 🔍📝**
