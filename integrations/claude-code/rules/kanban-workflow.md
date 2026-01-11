# Kanban Task Management Rules

**Purpose:** Enforce task-driven workflow with MarkdownTaskManager for complete traceability.

---

## Core Principle

**No work without a kanban task.**

Before writing code, editing files, implementing features, or starting any work:
1. Create a task in `kanban.md`
2. Set `**Status**: in-progress`
3. Do the work
4. Set `**Status**: done`
5. Reference task in commit: `feat: Add feature (TASK-XXX)`

---

## Critical Rules

### Rule 1: Task First, Always

Every piece of work must have a corresponding task. This ensures:
- Complete audit trail
- Git commits traceable to requests
- Progress visible in real-time
- Context preserved across sessions

### Rule 2: Never Move Task Blocks

**The kanban system auto-reorganizes tasks based on the `Status:` field.**

To change task status:
- ✅ Change `**Status**: todo` → `**Status**: in-progress` → `**Status**: done`
- ✅ Add `**Started**: YYYY-MM-DD` when starting
- ✅ Add `**Finished**: YYYY-MM-DD` when completing
- ❌ NEVER cut/paste task blocks between sections
- ❌ NEVER manually move `### TASK-XXX` blocks

The React app detects status changes and moves tasks automatically.

### Rule 3: Increment Task Counter

When creating new tasks:
1. Check `<!-- Config: Last Task ID: XXX -->` in kanban.md
2. Use next number: `TASK-XXX+1`
3. Update the config comment

---

## Task Workflow

### Creating a Task

```markdown
### TASK-042 | Short descriptive title

**Priority**: High | **Category**: Backend | **Status**: todo
**Assigned**: @username
**Created**: 2026-01-11
**Tags**: #feature #api

Description of what needs to be done.

**Subtasks**:
- [ ] First step
- [ ] Second step
- [ ] Third step
```

### Starting Work

1. Change `**Status**: todo` → `**Status**: in-progress`
2. Add `**Started**: YYYY-MM-DD`
3. Begin implementation

### Completing Work

1. Check off all subtasks `[x]`
2. Add `**Finished**: YYYY-MM-DD`
3. Document results in `**Notes**:` section
4. Change `**Status**: in-progress` → `**Status**: done`
5. Commit with task reference: `git commit -m "feat: Description (TASK-042)"`

### Archiving (Manual Only)

Tasks stay in "Done" until explicitly archived:
- User requests: "Archive completed tasks"
- Move task content to `archive.md`
- Never auto-archive

---

## Research Preservation (Manus 2-Action Rule)

When doing visual research (WebFetch, WebSearch, screenshots):

1. Operations are auto-logged to task's **Notes** section
2. After every 2 operations, create a findings file:
   - Location: `findings/TASK-XXX.md`
   - Link from task: `**Research Log**: See findings/TASK-XXX.md`

This prevents context loss when visual content disappears.

See: [research-preservation.md](../skills/research-preservation.md)

---

## Git Commit Format

Always reference task ID in commits:

```bash
# Feature
git commit -m "feat: Add user authentication (TASK-042)"

# Bug fix
git commit -m "fix: Resolve login error (TASK-043)"

# Progress update
git commit -m "feat: Add API endpoint (TASK-042 - 3/5)"
```

---

## Why This Matters

| Benefit | Description |
|---------|-------------|
| **Traceability** | Every commit links to a user request |
| **Persistence** | Tasks survive session restarts |
| **Visibility** | Progress tracked in real-time |
| **Audit Trail** | Complete history of all work |
| **Context** | No lost work across sessions |

---

## Quick Reference

```
1. Check kanban.md for existing task or create new one
2. Set Status: in-progress + Started date
3. Do the work, check off subtasks
4. Document results in Notes section
5. Set Status: done + Finished date
6. Commit with TASK-XXX reference
7. Never archive unless user requests it
```

---

**Version:** 1.0.0 | **Status:** Recommended Practice
