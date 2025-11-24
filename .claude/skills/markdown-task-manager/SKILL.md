---
name: markdown-task-manager
description: Use when managing tasks, the system is a Kanban task manager based on local Markdown files (`kanban.md` and `archive.md`). It follows a strict format compatible with the task-manager.html web application.
---

# 📋 Markdown Task Manager Skill

## When to Use This Skill

- Create tasks to document work to be done
- Plan complex features
- Track project progress
- Archive completed tasks
- Generate status reports

## 📋 STRICT Task Format

### Mandatory Template

```markdown
### TASK-XXX | Task title

**Priority**: [Critical|High|Medium|Low] | **Category**: [Value] | **Status**: [todo|in-progress|in-review|done]
**Assigned**: @user1, @user2
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

**🆕 IMPORTANT: Status Field**

The `**Status**:` field is now **highly recommended** for automatic task reorganization:
- Must match one of your column IDs (e.g., `todo`, `in-progress`, `in-review`, `done`)
- When the React app is open, changing this field automatically moves the task
- Saves AI tokens by eliminating manual section moves
- Column IDs are defined in the `**Columns**:` configuration (lowercase, hyphenated)

### ❌ FORBIDDEN

- `## Title` or `### Title` inside a task
- `**Subtasks**` or `**Notes**` without `:`
- Automatic archiving (only on user request)

**Why?** The HTML parser of the application does not recognize `##` inside tasks.

## 🔄 Workflow

### 1. New Request
1. Read `kanban.md` to get the last task ID
2. Create task in `kanban.md` → "📝 To Do" section
3. Unique ID (TASK-XXX) auto-incremented
4. Break down into subtasks if needed
5. Increment counter in `<!-- Config: Last Task ID: XXX -->`

### 2. Start Work
1. Update `**Status**: in-progress` (app will auto-move if open) OR move task → "🚀 In Progress" section
2. Add `**Started**: YYYY-MM-DD`
3. Check off subtasks progressively

### 3. Finish Work
1. Update `**Status**: done` (app will auto-move if open) OR move → "✅ Done" section
2. Add `**Finished**: YYYY-MM-DD`
3. Document in `**Notes**:`:
   - `**Result**:` - What was done
   - `**Modified files**:` - List with line numbers
   - `**Technical decisions**:` - Choices made
   - `**Tests performed**:` - Validated tests

### 4. Archiving

**⚠️ Tasks are NOT archived immediately!**

- Completed tasks remain in "✅ Done"
- **Only on user request** → move to `archive.md`
- **Never archive directly at end of work**

## 📁 File Structure

### kanban.md

```markdown
# Kanban Board

<!-- Config: Last Task ID: 42 -->

## ⚙️ Configuration

**Columns**: 📝 To Do | 🚀 In Progress | 👀 Review | ✅ Done
**Categories**: Frontend, Backend, DevOps
**Users**: @alice, @bob
**Tags**: #bug, #feature, #docs

---

## 📝 To Do

### TASK-001 | Title
[...]

## 🚀 In Progress

## 👀 Review

## ✅ Done

### TASK-003 | Completed task
[...]
```

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

## 🎯 Golden Rules

### ✅ ALWAYS

1. Create task BEFORE coding
2. Strict format (no `##` inside tasks)
3. Break down if complex (3+ steps)
4. Update in real-time
5. Document result in `**Notes**:`
6. Reference tasks in commits (`TASK-XXX`)
7. Leave in "Done" (archive only on user request)
8. **NEW**: Prefer updating `**Status**:` field instead of manually moving tasks (auto-reorganization!)

### ❌ NEVER

1. `## Title` inside a task
2. Code without creating task
3. Forget to check off subtasks
4. Archive immediately (stay in "Done")
5. Forget to document the result

## 🔧 User Commands

### Planning
- "Plan [feature]"
- "Create roadmap for 3 months"

### Execution
- "Do TASK-XXX"
- "Continue TASK-XXX"

### Tracking
- "Where are we?"
- "Weekly status"

### Modifications
- "Break down TASK-XXX"
- "Add subtask to TASK-XXX"

### Search
- "Search in archives: [keyword]"

### Maintenance
- "Archive completed tasks"

## 📝 Complete Examples

### Simple Task

```markdown
### TASK-001 | Fix login bug

**Priority**: Critical | **Category**: Backend | **Status**: todo
**Assigned**: @bob
**Created**: 2025-01-20 | **Due**: 2025-01-21
**Tags**: #bug #urgent

Users cannot log in. Error 500 in logs.

**Notes**:
Check Redis, related to yesterday's deployment.
```

### Complete Task with Result

```markdown
### TASK-042 | Notification system

**Priority**: High | **Category**: Backend | **Status**: done
**Assigned**: @alice
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

## 🛠️ Skill Functions

When using this skill, you must:

1. **Read kanban.md** to understand current state and get last ID
2. **Create tasks** following strict format
3. **Update tasks** by moving between sections
4. **Check off subtasks** progressively
5. **Document result** in Notes before marking Done
6. **Increment Last Task ID** in config comment
7. **Never archive** unless explicitly requested

## 📘 Git Integration

```bash
# Commits with reference
git commit -m "feat: Add feature (TASK-042 - 3/5)"
git commit -m "fix: Bug fix (TASK-001)"

# Branches
git checkout -b feature/TASK-042-notifications
```

## ⚠️ Critical Points of Attention

1. **Markdown Format**: Strictly respect format (no `##` inside tasks)
2. **ID Increment**: Always increment `<!-- Config: Last Task ID: XXX -->`
3. **Columns**: Use exact column names defined in Configuration
4. **Archiving**: NEVER archive automatically, only on request
5. **Documentation**: Always fill `**Notes**:` with Result, Modified files, etc.

## 🎓 Usage

### Initialization

Before using the skill, verify the project contains:
- `kanban.md` (required)
- `archive.md` (required)
- `AI_WORKFLOW.md` (optional but recommended)

### First Use

```
"Use the markdown-task-manager skill to create a task for [feature]"
```

### Invocation Examples

```
"Skill markdown-task-manager: create a task to implement authentication"
"Skill markdown-task-manager: update TASK-007 with results"
"Skill markdown-task-manager: list all tasks in progress"
"Skill markdown-task-manager: archive completed tasks"
```

## 🔍 Implementation Details

### Reading kanban.md

Always start by reading `kanban.md` to:
- Get the last task ID from `<!-- Config: Last Task ID: XXX -->`
- Understand existing columns structure
- Check current tasks in each column

### Creating a New Task

1. Calculate new ID: `last_id + 1`
2. Format as `TASK-XXX` (3 digits with leading zeros)
3. Add to "📝 To Do" section
4. Update `<!-- Config: Last Task ID: XXX -->` comment
5. Use today's date for `**Created**:`

### Moving Tasks Between Columns

**🎉 NEW: Automatic Reorganization!**

The React-based task manager now includes **automatic task reorganization**. This is a game-changer for AI workflows!

**How it works:**
- When you change the `**Status**:` field in a task, the app automatically moves it to the correct section
- This happens when the HTML file is open in the browser
- Uses the same drag-drop logic for consistency
- Saves AI tokens and context by avoiding manual task moves

**Two Ways to Move Tasks:**

**Option 1: Update Status Field (Recommended - Automatic)**
Simply change the `**Status**:` field value and let the app reorganize automatically:

```markdown
### TASK-042 | My task
**Priority**: High | **Category**: Backend | **Status**: in-progress
```

The app will detect that `**Status**: in-progress` doesn't match the "📝 To Do" section and automatically move it to "🚀 In Progress".

**Option 2: Manual Move (Traditional)**
When moving a task manually:
1. Copy entire task content (from `### TASK-XXX` to blank line before next task)
2. Paste in target column section
3. Delete from original location
4. Update dates accordingly (`**Started**:` or `**Finished**:`)

**⚡ Pro Tip for AI:** Just update the `**Status**:` field! If the user has the app open, it will reorganize automatically. This saves tokens and reduces the chance of formatting errors.

### Completing Tasks

Before moving to "✅ Done":
1. Ensure all subtasks are checked `[x]`
2. Add `**Finished**: YYYY-MM-DD`
3. Fill in `**Notes**:` section with:
   - `**Result**:` describing what was accomplished
   - `**Modified files**:` listing changed files with line ranges
   - `**Technical decisions**:` if any choices were made
   - `**Tests performed**:` if tests were run

### Archiving Tasks

Only when user explicitly requests archiving:
1. Read task from "✅ Done" section in `kanban.md`
2. Append task to "## ✅ Archives" section in `archive.md`
3. Add separator `---` between archived tasks
4. Remove task from `kanban.md`

---

## 🚀 React Migration Benefits

The task manager has been migrated to React (December 2025) with significant improvements:

- **Automatic Task Reorganization**: Tasks self-organize when `**Status**:` field changes
- **Live File Watching**: Detects external edits and syncs automatically (2-second polling)
- **Token Efficiency**: No need to manually move tasks - just update the Status field!
- **Single File Output**: Still builds to a single HTML file (~380KB) for portability
- **Better Security**: XSS protection with DOMPurify for markdown rendering
- **Modern Architecture**: React hooks, Vite build system, Lucide icons

**Key Advantage for AI**: You can now simply update the `**Status**:` field instead of manually copying and moving tasks between sections. The app handles reorganization automatically when it's open in the browser, saving tokens and reducing formatting errors.

---

**This skill ensures complete traceability and total transparency of work done by AI.**
