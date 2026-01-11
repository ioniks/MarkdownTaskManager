# Claude Code Integration for MarkdownTaskManager

**Version:** 1.0.0 | **Status:** ✅ Production-Ready
**License:** MIT

---

## Overview

Automated research preservation using the **Manus 2-Action Rule** (Meta AI - $2B acquisition value) integrated with MarkdownTaskManager.

**What it does:**
- 📝 Automatically logs visual operations (WebFetch, WebSearch) to task Notes
- 🔔 Reminds you to create findings files after every 2 operations
- 🗄️ Archive-safe - logs survive task lifecycle (kanban.md → archive.md)
- 🎯 Zero separate log files - everything inline in your kanban

---

## Quick Start

### 1. Install

```bash
# Copy integration files to your project
cp -r integrations/claude-code/ .claude/

# Make hook executable
chmod +x .claude/hooks/pre-tool-use-2-action-reminder.py
```

### 2. Configure

Edit `.claude/hooks/pre-tool-use-2-action-reminder.py`:

```python
# Set your kanban file location(s)
KANBAN_FILES = [
    Path(PROJECT_DIR) / "kanban.md",  # Single file
    # OR
    # Path(PROJECT_DIR) / "docs" / "admin" / "kanban.md",  # Multi-workspace
]
```

### 3. Test

```bash
# Add test task to kanban.md with Status: in-progress
# Then test the hook:
echo '{"tool_name":"WebFetch","tool_input":{"url":"https://example.com"}}' | \
  python3 .claude/hooks/pre-tool-use-2-action-reminder.py

# Check kanban.md - should see log entry in task Notes
```

### 4. Use

Start working with Claude Code - logs append automatically!

---

## Files Included

```
integrations/claude-code/
├── README.md                              ← You are here
├── SETUP.md                               ← Detailed setup guide
├── hooks/
│   └── pre-tool-use-2-action-reminder.py  ← Main hook script
├── hooks.json                             ← Hook configuration
├── skills/
│   └── research-preservation.md           ← Skill documentation
└── examples/
    └── sample-kanban.md                   ← Example with logs
```

---

## Features

### ✅ Inline Logging

Logs appear directly in task Notes section:

```markdown
### TASK-123 | Research API Patterns
**Status**: in-progress
...

**Notes**:
Research findings documented.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://docs.example.com
- 2026-01-11 10:31:22 - WebSearch: "API design patterns"
```

### ✅ 2-Action Reminder

After every 2 operations, you get a reminder:

```
======================================================================
🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH
======================================================================

📊 Visual operations count: 2
📋 Current task: TASK-123
📝 Logs appended to: kanban.md → TASK-123 Notes

✅ NEXT STEP: Create or update findings file
   Location: findings/TASK-123.md
======================================================================
```

### ✅ Archive-Safe

When you archive a task (move to archive.md), logs move with it:

```markdown
# archive.md
### TASK-123 | Research API Patterns
**Status**: done
...

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://docs.example.com
- 2026-01-11 10:31:22 - WebSearch: "API design patterns"
```

Complete audit trail preserved forever!

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SETUP.md](./SETUP.md) | Complete installation and configuration guide |
| [skills/research-preservation.md](./skills/research-preservation.md) | Manus 2-Action Rule workflow documentation |
| [examples/sample-kanban.md](./examples/sample-kanban.md) | Example kanban with inline logs |

**Also see:**
- [Manus Inline Logging Pattern](../../docs/MANUS_INLINE_LOGGING.md) - Technical deep-dive

---

## Requirements

- **MarkdownTaskManager** - Using kanban.md for task tracking
- **Claude Code** - CLI or extension
- **Python 3.6+** - For hook script

---

## Benefits

| Benefit | Description |
|---------|-------------|
| **Single Source of Truth** | Logs live with task, not separate files |
| **Zero File Management** | No log rotation, cleanup, or retention policies |
| **Human Readable** | Markdown format, not JSONL or binary |
| **Archive-Safe** | Logs survive full task lifecycle |
| **Audit Trail** | Complete research history per task |
| **Portable** | Works with any MarkdownTaskManager setup |

---

## Customization

### Change Kanban Location

```python
# In pre-tool-use-2-action-reminder.py
KANBAN_FILES = [
    Path(PROJECT_DIR) / "your" / "custom" / "path" / "kanban.md",
]
```

### Change Findings Directory

```python
# Default: Same directory as kanban file
FINDINGS_DIR = None

# Custom directory
FINDINGS_DIR = "docs/research/findings"
```

### Change Reminder Frequency

```python
# Remind every 2 operations (default)
if count % 2 == 0:

# OR every 3 operations
if count % 3 == 0:
```

---

## Production Experience

**Deployed in:** Setsail project (Enterprise SaaS)
**Since:** 2026-01-11
**Tasks logged:** 10+ with complete visual operation audit trails
**Issues:** None - rock solid

**Testimonial:**
> "Logs are task-specific work artifacts - should live with task, not in time-based infrastructure logs. Inline approach is simpler, survives archiving, and follows existing kanban → findings pattern."
> — Setsail Engineering Team

---

## Troubleshooting

**Hook not running?**
- Check `.claude/hooks.json` exists
- Verify hook path in hooks.json
- Test manually (see SETUP.md)

**Logs not appearing?**
- Ensure task has `**Status**: in-progress`
- Check KANBAN_FILES paths
- Verify MarkdownTaskManager format

**Counter stuck?**
```bash
rm /tmp/claude-visual-ops-session.txt
```

**More help:** See [SETUP.md](./SETUP.md) Troubleshooting section

---

## Support

- **Issues:** https://github.com/kepptic/MarkdownTaskManager/issues
- **Discussions:** https://github.com/kepptic/MarkdownTaskManager/discussions
- **License:** MIT
- **Version:** 1.0.0

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-11 | Initial portable release |

---

**🎯 Start preserving your research today!**
