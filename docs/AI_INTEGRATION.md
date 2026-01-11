# 🤖 AI Assistants Integration Guide

**Version:** 1.0 | **Updated:** January 2026 | **Status:** Full Support

This guide explains how to integrate Markdown Task Manager with AI assistants (Claude, ChatGPT, Copilot, Gemini, etc.) to achieve complete traceability of AI-assisted work.

---

## 📖 Table of Contents

- [Overview](#overview)
- [Supported AI Assistants](#supported-ai-assistants)
- [Quick Start](#quick-start)
- [Claude Code Integration (Advanced)](#claude-code-integration-advanced)
- [Generic AI Workflow](#generic-ai-workflow)
- [Configuration Files](#configuration-files)
- [Advanced Features](#advanced-features)
- [Real-World Examples](#real-world-examples)

---

## Overview

### What is AI Integration?

The Markdown Task Manager system is designed to work seamlessly with AI assistants to create a **complete audit trail** of all work performed. Instead of AI working in isolation, every action is documented in your task files with full traceability.

### Why Use It?

**Problems it solves:**
- ❌ AI work happens in isolation → ✅ Full visibility in kanban.md
- ❌ AI outputs disappear after session ends → ✅ Archived permanently
- ❌ No link between AI work and commits → ✅ Git integration with TASK-XXX references
- ❌ Hard to track what AI actually did → ✅ Documented Notes and Results
- ❌ Team doesn't know AI is working → ✅ Real-time kanban visibility

**What you gain:**
- 📝 **Complete history**: Every AI action is documented
- 🔍 **Easy search**: Grep in Markdown files
- 📊 **Statistics**: Velocity, time spent, progress
- 🔗 **Git links**: Commits reference tasks
- 👥 **Collaboration**: Entire team sees what AI does
- 📦 **Archives**: Nothing is lost, everything is archived

---

## Supported AI Assistants

The system works with **any AI assistant**, but has optimized configurations for:

| AI Assistant | Type | Configuration File | Location | Support |
|--------------|------|-------------------|----------|---------|
| **Claude** (Anthropic) | Conversational | `CLAUDE.md` | Project root | ✅ Full |
| **Claude Code** (CLI) | IDE Integration | `.claude/` hooks | Project root | ✅ **NEW!** Advanced |
| **GitHub Copilot** (Microsoft) | IDE Extension | `copilot-instructions.md` | `.github/` | ✅ Full |
| **ChatGPT** (OpenAI Web) | Conversational | `CHATGPT.md` | Project root | ✅ Full |
| **Gemini** (Google) | Conversational | `instructions.md` | `.gemini/` | ✅ Full |
| **OpenAI CLI** | Command Line | `OPENAI_CLI.md` | Project root | ✅ Full |
| **Qwen** (Alibaba) | Conversational | `QWEN.md` | Project root | ✅ Full |
| **Codeium / Windsurf** | IDE Extension | `instructions.md` | `.windsurf/` | ✅ Full |

**Universal Principle:** All AIs follow the same workflow principles documented in `AI_WORKFLOW.md`

---

## Quick Start

### 3-Step Installation

**Step 1: Copy base files to your project**

```bash
# Required for all AIs
cp AI_WORKFLOW.md your-project/
cp kanban.md your-project/
cp archive.md your-project/
```

**Step 2: Configure your preferred AI(s)**

Choose from the templates below based on which AI you'll use:

```bash
# For Claude (Anthropic)
cp CLAUDE.md.exemple your-project/CLAUDE.md

# For ChatGPT (OpenAI Web)
cp CHATGPT.md.exemple your-project/CHATGPT.md

# For Gemini (Google)
mkdir -p your-project/.gemini
cp GEMINI.md.exemple your-project/.gemini/instructions.md

# For Copilot (GitHub)
mkdir -p your-project/.github
cp COPILOT.md.exemple your-project/.github/copilot-instructions.md

# For Windsurf / Codeium
mkdir -p your-project/.windsurf
cp CODEIUM.md.exemple your-project/.windsurf/instructions.md

# For OpenAI CLI
cp OPENAI_CLI.md.exemple your-project/OPENAI_CLI.md

# For Qwen
cp QWEN.md.exemple your-project/QWEN.md
```

**Step 3: First use with your AI**

- **Claude**: "Read CLAUDE.md and use the task system"
- **ChatGPT**: Upload `CHATGPT.md` and `AI_WORKFLOW.md`, then: "Read these files and use the task system"
- **Gemini**: "@workspace Read AI_WORKFLOW.md and plan [feature]"
- **Copilot**: "@workspace Read AI_WORKFLOW.md and create a task for [feature]"

---

## Claude Code Integration (Advanced)

**NEW!** Claude Code (Anthropic's CLI) gets special support with the **Manus 2-Action Rule** for automated research logging.

### What is the Manus Rule?

The Manus 2-Action Rule automatically logs all visual research operations (WebFetch/WebSearch) directly to task Notes without manual intervention.

### Installation

```bash
# Copy Claude Code skill to your project
cp -r integrations/claude-code/ .claude/

# Make hook executable
chmod +x .claude/hooks/pre-tool-use-2-action-reminder.py

# Restart Claude Code to activate
```

### What You Get

✅ **Automatic logging** - WebFetch/WebSearch operations logged to task Notes
✅ **Periodic reminders** - After every 2 operations, prompt to create findings file
✅ **Archive-safe logs** - Everything inline in kanban.md (survives archival)
✅ **Zero log files** - No separate logs cluttering your project

### How It Works

1. You ask Claude Code to research something for a task
2. Claude Code uses WebFetch or WebSearch
3. The hook automatically logs: `[Research] WebFetch: URL - Key findings`
4. After 2 operations, you get a reminder: "Time to summarize findings?"
5. When you're done, findings go directly into task **Notes**

### Learn More

📖 **Detailed documentation:** See [integrations/claude-code/README.md](../integrations/claude-code/README.md)

---

## Generic AI Workflow

### Core Principles (Works with ANY AI)

**What AI can do automatically:**

1. ✅ **Create tasks** with strict format in `kanban.md`
   - Format: `### TASK-XXX | Title`
   - Metadata: Priority, Category, Assigned, Tags, Dates
   - Subtasks for breakdown

2. ✅ **Update progress in real time**
   - Move tasks between columns
   - Check off subtasks as completed
   - Update status field

3. ✅ **Document complete result**
   - Full description of what was done
   - Modified files and lines
   - Technical decisions made
   - Tests performed

4. ✅ **Reference tasks in Git commits**
   - Format: `feat: description (TASK-XXX)`
   - Links task to code changes
   - Full traceability

5. ✅ **Archive on demand only**
   - Never auto-archive (AI asks first)
   - Move to `archive.md` when confirmed
   - Permanent history

6. ✅ **Special: Claude Code research logging**
   - Automatic WebFetch/WebSearch logging
   - Inline in task Notes
   - No extra files needed

### Task Creation Format

**Strict format (required for all AIs):**

```markdown
### TASK-001 | Implement authentication
**Priority**: High | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-01-20 | **Due**: 2025-02-01
**Tags**: #feature #security

Implement user authentication with OAuth2.

**Subtasks**:
- [ ] Setup OAuth2 provider
- [ ] Create login endpoint
- [ ] Add token validation
- [ ] Implement refresh tokens
- [ ] Write tests
```

**Why strict format?**
- Parseable by the application
- Consistent across all AIs
- Supports all features (drag-drop, filters, etc.)
- Easy to migrate between systems

### Progress Tracking

**As AI works, it:**

1. Moves task column when status changes:
   ```markdown
   ## 🚀 In Progress
   ### TASK-001 | Implement authentication
   ```

2. Checks off subtasks as completed:
   ```markdown
   **Subtasks**:
   - [x] Setup OAuth2 provider
   - [x] Create login endpoint
   - [ ] Add token validation
   ```

3. Updates metadata (dates, notes):
   ```markdown
   **Started**: 2025-01-20 | **Finished**: 2025-01-25

   **Notes**:
   Used Auth0 for OAuth2 provider.
   ```

### Final Documentation (Notes)

When complete, AI documents everything in Notes section:

```markdown
**Notes**:
- Setup Auth0 OAuth2 with Google + Microsoft providers
- Created /api/auth/login endpoint returning JWT token
- Token expires after 1 hour, refresh every 30 minutes
- Added tests for 5 auth scenarios

**Modified files**:
- src/auth/oauth.js (lines 1-120)
- src/api/login.js (lines 1-80)
- src/middleware/auth.js (lines 1-50)

**Technical decisions**:
- Used Auth0 instead of Firebase (cheaper, more control)
- JWT tokens in httpOnly cookies (XSS protection)
- Refresh tokens in secure storage

**Tests performed**:
- ✅ Login with Google
- ✅ Login with Microsoft
- ✅ Token refresh after expiry
- ✅ Logout clears tokens
- ✅ Invalid tokens rejected
```

### Git Integration

**Reference tasks in commits:**

```bash
# Good format
git commit -m "feat: Add OAuth2 authentication (TASK-001)"
git commit -m "feat: Setup Auth0 provider (TASK-001 - 1/5)"
git commit -m "feat: Create login API (TASK-001 - 2/5)"

# Full traceback
git log | grep TASK-001
# Shows all commits related to TASK-001
```

### Archive Decision

**AI checks before archiving:**

```markdown
Task TASK-001 is complete!

Status check:
- [x] All subtasks done
- [x] Tests passing
- [x] Notes documented
- [x] Code merged to main

Should I archive this task to archive.md? (confirm to proceed)
```

**User confirms → AI archives with metadata:**

```markdown
## ✅ January 2025

### TASK-001 | Implement authentication
**Priority**: High | **Category**: Backend | **Assigned**: @alice
**Created**: 2025-01-20 | **Started**: 2025-01-20 | **Finished**: 2025-01-25
...
**Result**: ✅ OAuth2 authentication fully implemented with Auth0
```

---

## Configuration Files

### Universal Configuration: AI_WORKFLOW.md

**Location:** Project root

**Purpose:** Core guidelines for ALL AIs (required reference)

**What it contains:**
- Task format specification
- Workflow rules (creation, updates, archiving)
- Git commit conventions
- Progress tracking examples
- User commands and responses

**Usage:**
- Every AI configuration file references this
- Single source of truth for task management
- Used by all AI assistants regardless of type

### AI-Specific Configurations

Each AI has its own configuration template:

#### Claude (Anthropic)

**File:** `CLAUDE.md`
**Location:** Project root
**Setup:**
```bash
cp CLAUDE.md.exemple your-project/CLAUDE.md
```
**First use:**
```
Read CLAUDE.md and use the task system
```

**Features:**
- Full support for all task features
- Long context (200K tokens) = detailed documentation
- Perfect for complex task breakdown
- Excellent for research and documentation

---

#### GitHub Copilot

**File:** `copilot-instructions.md`
**Location:** `.github/copilot-instructions.md`
**Setup:**
```bash
mkdir -p your-project/.github
cp COPILOT.md.exemple your-project/.github/copilot-instructions.md
```
**First use:**
```
@workspace Read AI_WORKFLOW.md and create a task for [feature]
```

**Features:**
- IDE-integrated (VS Code)
- Great for code-focused tasks
- Real-time chat in editor
- Direct code access

---

#### ChatGPT (OpenAI)

**File:** `CHATGPT.md`
**Location:** Project root (or custom GPT)
**Setup:**
```bash
cp CHATGPT.md.exemple your-project/CHATGPT.md
```
**First use:**
```
1. Upload CHATGPT.md and AI_WORKFLOW.md
2. Say: "Read these files and use the task system"
```

**Features:**
- Web-based interface
- Easy file uploads
- Custom GPT support
- Good for exploration

---

#### Gemini (Google)

**File:** `instructions.md`
**Location:** `.gemini/instructions.md`
**Setup:**
```bash
mkdir -p your-project/.gemini
cp GEMINI.md.exemple your-project/.gemini/instructions.md
```
**First use:**
```
@workspace Read AI_WORKFLOW.md and plan [feature]
```

**Features:**
- Integration with Google tools
- Good context window
- Real-time collaboration

---

#### Windsurf / Codeium

**File:** `instructions.md`
**Location:** `.windsurf/instructions.md` or `.codeium/instructions.md`
**Setup:**
```bash
mkdir -p your-project/.windsurf
cp CODEIUM.md.exemple your-project/.windsurf/instructions.md
```
**First use:**
```
Read AI_WORKFLOW.md and create TASK-001 for [feature]
```

**Features:**
- IDE-native (VS Code, JetBrains)
- Fast local execution
- Direct file editing

---

#### OpenAI CLI

**File:** `OPENAI_CLI.md`
**Location:** Project root
**Setup:**
```bash
cp OPENAI_CLI.md.exemple your-project/OPENAI_CLI.md
```
**First use:**
```bash
openai --system-file OPENAI_CLI.md "Read AI_WORKFLOW.md and create a task"
```

**Features:**
- Command-line interface
- Scriptable
- Good for automation

---

#### Qwen (Alibaba)

**File:** `QWEN.md`
**Location:** Project root
**Setup:**
```bash
cp QWEN.md.exemple your-project/QWEN.md
```
**First use:**
```bash
qwen --system-file QWEN.md "Read AI_WORKFLOW.md and plan [feature]"
```

**Features:**
- Chinese-optimized
- Good multilingual support
- API integration

---

## Advanced Features

### 1. Auto-Task Reorganization

**Feature:** Tasks automatically move to correct section when Status field changes.

**How it works:**
1. AI updates `**Status**: in-progress` in markdown
2. Task manager detects the change
3. Task automatically moves to "🚀 In Progress" column
4. No manual drag-drop needed

**Benefits:**
- Saves AI tokens (no manual moves)
- Works with external markdown editors
- Consistent state between app and file
- Prevents out-of-sync issues

**Example:**
```markdown
# Before (in To Do column)
### TASK-001 | Feature
**Status**: todo

# AI updates it to:
### TASK-001 | Feature
**Status**: in-progress

# Result: Task automatically moves to In Progress column
```

### 2. Live File Sync

**Feature:** App watches for external file changes and syncs automatically.

**Use cases:**
- AI editing kanban.md directly
- Git pulling team updates
- Manual editing in text editor
- External scripts updating tasks

**Sync frequency:** Every 2 seconds

**How it works:**
```
┌─────────────┐
│ External    │  Edit kanban.md
│ Editor      │  (Git, AI, text editor)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ File System │  Change detected
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ App detects │  Polls every 2 seconds
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ UI updates  │  Instant refresh
└─────────────┘
```

### 3. Claude Code Manus 2-Action Rule (NEW!)

**What it is:** Hook that logs research operations automatically.

**When it activates:**
- Every WebFetch or WebSearch call in Claude Code
- Automatically logged to current task's Notes section
- After every 2 operations, creates reminder

**Setup:**
```bash
cp -r integrations/claude-code/ .claude/
chmod +x .claude/hooks/pre-tool-use-2-action-reminder.py
```

**Log format:**
```markdown
**Notes**:
[Research] WebFetch: https://example.com/api-docs - Found API endpoint specifications
[Research] WebSearch: authentication patterns - Found 3 best practices: OAuth2, JWT, mutual TLS
[Reminder] 2 research operations logged. Time to summarize findings?
```

**Full documentation:** [integrations/claude-code/README.md](../integrations/claude-code/README.md)

---

## Real-World Examples

### Example 1: Solo Developer Planning Feature

**Task:** "Plan a notification system"

**User asks Claude:**
```
"Read CLAUDE.md and create a task to plan a notification system
with subtasks for each component"
```

**Claude does:**
1. ✅ Creates TASK-001 in kanban.md
2. ✅ Adds subtasks: Backend API, Real-time Server, Email Service, UI Component
3. ✅ Sets Priority: High, Category: Backend
4. ✅ Creates detailed task description

**Result in app:**
```markdown
### TASK-001 | Notification System
**Priority**: High | **Category**: Backend
**Created**: 2025-01-20

Build real-time notification system with WebSockets.

**Subtasks**:
- [ ] Design API schema
- [ ] Setup WebSocket server
- [ ] Implement email service
- [ ] Build UI component
- [ ] Write tests
```

**User sees:** TASK-001 appears in Kanban board under "📝 To Do"

---

### Example 2: Team Feature Development with Git

**Scenario:** Team uses Git + Claude to implement a feature

**User:**
```
"Read CLAUDE.md and start working on TASK-042"
```

**Claude:**
1. ✅ Reads TASK-042 description
2. ✅ Breaks into subtasks
3. ✅ Starts implementing
4. ✅ Updates subtasks as it works
5. ✅ Commits with TASK-042 reference

**Git history:**
```
abc1234 feat: Setup WebSocket server (TASK-042 - 1/4)
def5678 feat: Create notification API (TASK-042 - 2/4)
ghi9012 feat: Add email integration (TASK-042 - 3/4)
jkl3456 feat: Build notification UI (TASK-042 - 4/4)
```

**Team workflow:**
```bash
git pull                    # Get Claude's commits
# Open task-manager.html
# See TASK-042 with progress bar: ▓▓▓▓░ 4/5 done
# View Notes section for implementation details
```

---

### Example 3: Research Task with Claude Code

**Scenario:** Using Claude Code (CLI) to research and document

**Setup:**
```bash
# Install Claude Code integration
cp -r integrations/claude-code/ .claude/
```

**Task:** "Research best practices for authentication"

**User in Claude Code:**
```
Do task TASK-001: Research OAuth2 best practices
```

**Claude Code:**
1. ✅ Reads TASK-001 from kanban.md
2. ✅ Searches for best practices (WebSearch)
3. ✅ Fetches IETF RFC documents (WebFetch)
4. ✅ Fetches Auth0 docs (WebFetch)
5. ✅ Manus hook logs operations to Notes
6. ✅ After 2 ops: "Time to summarize?"
7. ✅ Claude Code writes findings to Notes

**Result in Notes:**
```markdown
**Notes**:
[Research] WebSearch: OAuth2 best practices RFC - Found IETF RFC 6749
[Research] WebFetch: https://auth0.com/docs/get-started/auth-basics -
  Key points: Use PKCE for mobile, refresh tokens with 7-day expiry
[Research] WebFetch: https://tools.ietf.org/html/rfc8252 -
  Oauth2 for native apps: Use system browser, never embed web view
[Reminder] 3 research operations. Time to write summary?

**Summary**:
Best practices for OAuth2:
1. Always use PKCE flow for native/SPA apps (prevents auth code theft)
2. Refresh tokens: 7-day expiry, automatically rotated
3. Use system browser for mobile (never WebView)
4. Bearer tokens in Authorization header, never URL parameters
5. HTTPS only, no self-signed certs in production
```

---

### Example 4: Team Retrospective

**Scenario:** Searching archives for completed work

**Team lead asks Claude:**
```
"Search archives for all completed tasks from January
and summarize what the team accomplished"
```

**Claude:**
1. ✅ Searches archive.md for January entries
2. ✅ Groups by category
3. ✅ Generates report

**Report:**
```
## January 2025 Accomplishments

### Backend (5 tasks)
- TASK-042: Notification system (WebSocket + Email)
- TASK-043: User authentication (OAuth2)
- TASK-044: Payment integration (Stripe)
- TASK-045: Database optimization
- TASK-046: API rate limiting

### Frontend (3 tasks)
- TASK-047: Dashboard redesign
- TASK-048: Mobile responsiveness
- TASK-049: Dark mode theme

### DevOps (2 tasks)
- TASK-050: CI/CD pipeline
- TASK-051: Kubernetes deployment

Total: 10 tasks | 42 subtasks completed | 0 issues
```

---

## User Commands (Common Patterns)

Once configured, you can use natural language:

```bash
# Planning
"Plan [feature]"
"Create roadmap for 3 months"
"Break down TASK-XXX into subtasks"

# Execution
"Do TASK-XXX"
"Continue TASK-XXX"
"What's next?"

# Tracking
"Where are we?"
"Weekly status"
"Show completed tasks"

# Modifications
"Add subtask to TASK-XXX"
"Change TASK-XXX priority to critical"
"Assign TASK-XXX to @alice"

# Search
"Find tasks tagged #bug"
"Search in archives: authentication"

# Maintenance
"Archive completed tasks"
"Reorganize kanban columns"
"Create summary report"
```

---

## Best Practices

### ✅ DO

- ✅ Use strict format for all AI-created tasks
- ✅ Keep AI_WORKFLOW.md updated
- ✅ Reference TASK-XXX in all commits
- ✅ Document decisions in Notes section
- ✅ Archive only when complete
- ✅ Use subtasks to break work down
- ✅ Keep team informed via Git commits

### ❌ DON'T

- ❌ Let AI auto-archive (ask first)
- ❌ Create tasks outside proper format
- ❌ Skip Notes documentation
- ❌ Mix manual and AI work inconsistently
- ❌ Ignore external file changes
- ❌ Delete tasks instead of archiving
- ❌ Leave in-progress tasks undocumented

---

## Troubleshooting

### Issue: AI doesn't follow task format

**Solution:**
1. Ensure AI read `AI_WORKFLOW.md`
2. Provide example of correct format
3. Ask AI to validate format before saving

### Issue: Tasks don't appear in app

**Solution:**
1. Check markdown file exists and is readable
2. Verify strict format is used
3. Check file permissions
4. Try refreshing browser

### Issue: External changes not syncing

**Solution:**
1. Wait 2-3 seconds for file watcher
2. Check file wasn't locked during edit
3. Try refreshing browser
4. Verify file actually changed on disk

### Issue: AI doesn't understand markdown format

**Solution:**
1. Show AI current example from kanban.md
2. Ask AI to parse and understand existing tasks
3. Have AI create task in small steps
4. Review before saving to file

---

## Related Documentation

- 📖 **[AI_WORKFLOW.md](../AI_WORKFLOW.md)** - Complete workflow guidelines
- 📖 **[examples/README.md](../examples/README.md)** - Markdown format details
- 📖 **[integrations/claude-code/README.md](../integrations/claude-code/README.md)** - Claude Code setup
- 🎯 **[Main README.md](../README.md)** - Full application guide

---

**Ready to integrate AI? Start with [Quick Start](#quick-start) and choose your AI!**

---

**Version:** 1.0 | **Updated:** January 2026 | **Status:** Active & Maintained
