# Sample Kanban Board (with Manus Logging)

<!-- Config: Last Task ID: 3 -->

## ⚙️ Configuration

**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | ✅ Done (done)

**Categories**: Frontend, Backend, Design, Research, Documentation

**Users**: @user, @claude

**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Tags**: #bug #feature #research #docs #ui #api

---

## 📝 To Do

### TASK-1 | Build User Dashboard
**Priority**: High | **Category**: Frontend | **Status**: todo
**Created**: 2026-01-10
**Tags**: #feature #ui

Create user dashboard with activity feed and quick actions.

**Subtasks**:
- [ ] Design dashboard layout
- [ ] Implement activity feed component
- [ ] Add quick action buttons
- [ ] Connect to API endpoints

---

## 🚀 In Progress

### TASK-2 | Research Design System Patterns
**Priority**: High | **Category**: Research | **Status**: in-progress
**Created**: 2026-01-10 | **Started**: 2026-01-11
**Tags**: #research #design

Research modern design system patterns for component library.

**Subtasks**:
- [x] Review Material Design 3 documentation
- [x] Analyze shadcn/ui patterns
- [ ] Document findings in findings/TASK-2.md
- [ ] Create component architecture proposal

**Notes**:
Researching design systems for component library architecture.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://m3.material.io
- 2026-01-11 10:31:22 - WebSearch: "shadcn/ui design patterns"
- 2026-01-11 10:35:10 - WebFetch: https://ui.shadcn.com/docs

---

### TASK-3 | API Authentication Flow
**Priority**: Critical | **Category**: Backend | **Status**: in-progress
**Created**: 2026-01-09 | **Started**: 2026-01-10
**Tags**: #feature #api #security

Implement OAuth2 authentication flow for API.

**Subtasks**:
- [x] Design auth flow diagram
- [x] Research OAuth2 best practices
- [ ] Implement token generation
- [ ] Add refresh token rotation
- [ ] Write integration tests

**Notes**:
OAuth2 implementation using industry best practices.

**Visual Operations Log**:
- 2026-01-10 14:20:15 - WebFetch: https://oauth.net/2/
- 2026-01-10 14:21:30 - WebSearch: "OAuth2 security best practices 2026"

---

## ✅ Done

(Empty - no completed tasks yet)

---

## 📖 About This Sample

This is a sample kanban board demonstrating the **Manus 2-Action Rule** integration with MarkdownTaskManager.

**Key features shown:**
- ✅ Inline **Visual Operations Log** in task Notes sections
- ✅ Task-specific research logging (TASK-2, TASK-3)
- ✅ Proper MarkdownTaskManager format
- ✅ Multiple task statuses (todo, in-progress, done)

**Try it:**
1. Set up the Claude Code integration (see `SETUP.md`)
2. Copy this file to your project as `kanban.md`
3. Set TASK-2 or TASK-3 status to `in-progress`
4. Use WebFetch or WebSearch with Claude Code
5. Watch logs append automatically!

**After 2 operations:** You'll see a reminder to create findings files in `findings/TASK-X.md`
