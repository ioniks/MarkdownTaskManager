# 🤖 Guidelines for AI Assistants

This file contains general guidelines for all AI assistants (Claude, ChatGPT, Copilot, Gemini, etc.) using this Markdown task management system.

---

## 📋 Strict Task Format

### Mandatory Template

```markdown
### TASK-XXX | Task title

**Status**: <column-id>
**Priority**: [Value] | **Category**: [Value] | **Assigned**: @user1, @user2
**Created**: YYYY-MM-DD | **Started**: YYYY-MM-DD | **Due**: YYYY-MM-DD | **Finished**: YYYY-MM-DD
**Tags**: #tag1 #tag2 #tag3

Free text description. **NO `##` or `###` headings allowed**.

**Subtasks**:
- [ ] First subtask
- [x] Completed subtask

**Notes**:
Additional notes with subsections `**Title**:`.

**Result**:
What was done.

**Modified files**:
- file.js (lines 42-58)
```

### Fields

**REQUIRED**: `### TASK-XXX |`, `**Status**:` (the column id — this is what places the task in a column), `**Priority**:`, `**Category**:`, `**Created**:`

**OPTIONAL**: `**Assigned**:`, `**Started**:`, `**Due**:`, `**Finished**:`, `**Tags**:`, Description, `**Subtasks**:`, `**Notes**:`

### ❌ FORBIDDEN

- `## Title` or `### Title` inside a task
- `**Subtasks**` or `**Notes**` without `:`

**Why?** All tasks live in a single `## Tasks` section, so a stray `##`/`###`
heading inside a task can break parsing. Keep notes/description heading-free.

---

## 🔄 Workflow

> **V2 — status is a field, not a position.** A task's column is its `**Status**:`
> value, not the section it sits in. All tasks live in a single `## Tasks` section,
> and a task's position within the file = its order within its column.
> **To move a task between columns, edit its one `**Status**:` line — never cut and
> re-paste the whole block.** (Cheap: ~1 line instead of moving 20+.)

### 1. New request
1. Add the task to the `## Tasks` section of `kanban.md`
2. Set `**Status**:` to the first column id (e.g. `todo`)
3. Unique ID (TASK-XXX) auto-incremented; break into subtasks if needed

### 2. Start work
1. Edit one line: `**Status**: todo` → `**Status**: in-progress`
2. Add `**Started**: YYYY-MM-DD`
3. Check off subtasks progressively

### 3. Finish work
1. Edit one line: `**Status**: in-progress` → `**Status**: done`
2. Add `**Finished**: YYYY-MM-DD`
3. Document in `**Notes**:`:
   - `**Result**:` - What was done
   - `**Modified files**:` - List with lines
   - `**Technical decisions**:` - Choices made
   - `**Tests performed**:` - Validated tests

### 4. Archiving

**⚠️ Tasks are NOT archived immediately!**

- Completed tasks remain in "✅ Done"
- **Only on user request** → move to `archive.md` section `## ✅ Archives`
- **Never archive directly at the end of work**

---

## ⚡ Token-economical operations (for AI)

The board is **one `## Tasks` section**; each task carries its own `**Status**:`.
There is **no stored index** — rebuild it on the fly with `grep`, and read/edit a
**single task** instead of loading the whole file.

```bash
# Board overview (id + status) — rebuilds the "index" on demand, very cheap
grep -nE "^### TASK-|^\*\*Status\*\*:" kanban.md

# Select one task by id → its line number
grep -n "^### TASK-042 " kanban.md

# Read just that task (its header up to the next header)
sed -n '/^### TASK-042 /,/^### TASK-/p' kanban.md

# MOVE a task between columns = edit ONE line (the block never moves):
#   **Status**: todo   →   **Status**: in-progress

# Next task in a column = first block with that status (file order = column order)
grep -n "^\*\*Status\*\*: in-progress" kanban.md | head -1

# List a column, already in order
grep -n "^\*\*Status\*\*: todo" kanban.md

# Search
grep -n "\*\*Priority\*\*: High" kanban.md     # by priority
grep -n "\*\*Tags\*\*:.*#bug" kanban.md          # by tag
```

**Rule of thumb:** a targeted `grep` + a one-line `Edit` beats reading/rewriting the
whole file. Moving a task is a single `**Status**:` edit — do **not** move the block.

---

## 📝 Examples

### Simple Task

```markdown
### TASK-001 | Fix login bug

**Priority**: Critical | **Category**: Backend | **Assigned**: @bob
**Created**: 2025-01-20 | **Due**: 2025-01-21
**Tags**: #bug #urgent

Users cannot log in. Error 500 in logs.

**Notes**:
Check Redis, related to yesterday's deployment.
```

### Complete Task

```markdown
### TASK-042 | Notification system

**Priority**: High | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-01-15 | **Started**: 2025-01-18 | **Finished**: 2025-01-22
**Tags**: #feature

Real-time notifications with WebSockets.

**Subtasks**:
- [x] Setup WebSocket server
- [x] REST API
- [x] Email sending
- [x] Notifications UI
- [x] E2E tests

**Notes**:

**Result**:
✅ Functional system with WebSocket, REST API and emails.

**Modified files**:
- src/websocket/server.js (lines 1-150)
- src/api/notifications.js (lines 20-85)

**Technical decisions**:
- Socket.io for WebSockets
- SendGrid for emails
- 30-day history in MongoDB

**Tests performed**:
- ✅ 100 simultaneous connections
- ✅ Auto-reconnection
- ✅ Emails < 2s
```

---

## 🎯 Golden Rules

### ✅ ALWAYS
1. Create task BEFORE coding
2. Strict format (no `##` in tasks)
3. Break down if complex
4. Real-time progress
5. Document result in `**Notes**:`
6. Reference tasks in commits (`TASK-XXX`)
7. Leave in "Done" (archive only on user request)

### ❌ NEVER
1. `## Title` in a task
2. Code without creating task
3. Forget to check off subtasks
4. Archive immediately (stay in "Done")
5. Forget to document the result

---

## 📦 File Structure

### kanban.md

**⚠️ ID comment format**: `<!-- Config: Last Task ID: XXX -->` (auto-incremented by application)

```markdown
# Kanban Board

<!-- Config: Last Task ID: 42 -->
<!-- Format: v2 -->

## ⚙️ Configuration

**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | 👀 Review (in-review) | ✅ Done (done)
**Categories**: Frontend, Backend, DevOps
**Users**: @alice, @bob
**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Tags**: #bug, #feature, #docs

---

## Tasks

### TASK-001 | Title
**Status**: todo
[...]

### TASK-003 | Completed task
**Status**: done
[...]
```

> **Columns** require the `(id)` suffix — the `id` is what each task's `**Status**:`
> points to. All tasks live in the single `## Tasks` section; the column is read from
> `**Status**:`, and order within the file = order within the column.

### archive.md

```markdown
# Task Archive

> Archived tasks

## ✅ Archives

### TASK-001 | Archived task
[... full content ...]

---

### TASK-002 | Another archived task
[... full content ...]
```

---

## 🔧 User Commands

```bash
# Planning
"Plan [feature]"
"Create roadmap for 3 months"

# Execution
"Do TASK-XXX"
"Continue TASK-XXX"

# Tracking
"Where are we?"
"Weekly status"

# Modifications
"Break down TASK-XXX"
"Add subtask to TASK-XXX"

# Search
"Search in archives: [keyword]"

# Maintenance
"Archive completed tasks"
```

---

## 📘 Git Integration

```bash
# Commits with reference
git commit -m "feat: Add feature (TASK-042 - 3/5)"
git commit -m "fix: Bug fix (TASK-001)"

# Branches
git checkout -b feature/TASK-042-notifications
```

---

## 📁 AI-Specific Configuration

Each AI has its own configuration file:

| AI Assistant | Configuration File | Location |
|--------------|-------------------|----------|
| **Claude** | `CLAUDE.md` | Project root |
| **GitHub Copilot** | `copilot-instructions.md` | `.github/` |
| **OpenAI CLI** | `OPENAI_CLI.md` | Project root |
| **ChatGPT** | `CHATGPT.md` or Custom GPT | Root or Web |
| **Gemini** | `GEMINI.md` or `instructions.md` | Root or `.gemini/` |
| **Qwen** | `QWEN.md` or `.qwenrc` | Project root |
| **Codeium / Windsurf** | `instructions.md` | `.windsurf/` or `.codeium/` |

**These files must:**
1. Reference this file `AI_WORKFLOW.md`
2. Be adapted to each AI's specifics
3. Remain minimalist (only a few lines)

### Minimal Template for AI Configuration File

```markdown
# 🤖 Instructions for [AI NAME]

## 📋 Task Management System

**Every action = One documented task in kanban.md**

## 📚 Complete Documentation

**⚠️ READ IMMEDIATELY**: `AI_WORKFLOW.md`

This file contains everything: format, workflow, commands, examples.

## ⚙️ Critical Rule #1

**NO `##` or `###` headings inside a task**
- Use `**Subtasks**:` and `**Notes**:` with colons
- Subsections: `**Result**:`, `**Modified files**:`

**Why?** The HTML parser does not recognize `##` inside tasks.

---

**Read `AI_WORKFLOW.md` now.**
```

---

## 🎓 First Use

### Initialization

On your first interaction with the AI:

```
"Read AI_WORKFLOW.md and use the task system"
```

The AI will automatically:
1. Read `AI_WORKFLOW.md`
2. Understand the complete format and workflow
3. Be ready to manage tasks according to defined rules

### Usage Examples

**Create a task:**
```
"Plan adding a real-time notification system"
```

**Work on a task:**
```
"Do TASK-007"
```

**Status update:**
```
"Where are we?"
```

**Archive:**
```
"Archive completed tasks"
```

---

**This guide ensures complete transparency and traceability of AI work.**
