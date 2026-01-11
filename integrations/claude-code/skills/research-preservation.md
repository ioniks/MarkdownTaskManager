---
name: research-preservation
version: "3.0.0"
description: Preserve multimodal research (screenshots, PDFs, browser results) as text using Manus 2-Action Rule. Prevents context loss when visual content disappears. Includes automated inline logging.
allowed-tools: Read, Write, Edit, WebFetch, WebSearch
---

# Research Preservation (Manus 2-Action Rule)

**Priority:** Best Practice | **Based on:** Manus Philosophy (Meta AI - $2B acquisition value)
**Logging:** Automated Inline Logging | **Version:** 3.0.0

---

## The 2-Action Rule

**After every 2 visual/browser/search operations, IMMEDIATELY save findings to markdown:**

```
Action 1: View screenshot of admin dashboard
Action 2: Read PDF specification document
→ STOP: Create/update findings/TASK-XXX.md NOW

Result: Visual insights preserved as text before context reset
```

**Why critical:** Multimodal content (screenshots, PDFs, browser results) doesn't persist in context. Text in markdown persists forever.

**Automated Tracking:**
- WebFetch and WebSearch operations are automatically logged inline to task's **Notes** section in kanban.md
- Counter tracks operations in `/tmp/claude-visual-ops-session.txt`
- After every 2 operations, you'll receive a reminder to create findings file
- Logs include timestamp, tool name, and URL/query for audit trail
- Logs survive task archiving (moved with task to archive.md)

---

## When to Preserve Research

**Trigger after 2 of these actions:**
- Viewing screenshots (Claude in Chrome, browser automation)
- Reading PDFs or images
- Analyzing search results
- Browsing documentation
- Watching GIF recordings
- Any multimodal content consumption

---

## Where to Save

**Create findings files linked from kanban tasks:**

```markdown
# In kanban task (kanban.md)
### TASK-280 | Form Builder
**Status**: in-progress
**Notes**:
Research findings documented in findings/TASK-280.md

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://docs.example.com
- 2026-01-11 10:31:22 - WebSearch: "design patterns"

# Create corresponding findings file
findings/TASK-280.md
```

---

## Findings File Template

```markdown
# Findings: TASK-XXX | [Task Title]

## Visual Analysis

### Screenshot 1: [Description] (YYYY-MM-DD HH:MM)
- Observation 1
- Observation 2
- Key insight

### PDF Analysis: [Document Name] (YYYY-MM-DD HH:MM)
- Finding 1
- Finding 2
- Important requirement

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Use Component X | Matches existing patterns |
| Library Y | Production-tested, accessible |

## Issues Discovered

| Issue | Impact | Resolution |
|-------|--------|------------|
| Legacy uses jQuery | Migration required | Rewrite in modern framework |

## Resources

- Design spec: `/path/to/spec.pdf`
- Screenshot: `/path/to/screenshot.png`
- Reference: https://example.com/demo
- API docs: https://docs.example.com

## Notes

- Accessibility: WCAG 2.1 AA compliance required
- Must support keyboard navigation
- Follow project design system
```

---

## Integration with Kanban

### Step 1: Link Research Log in Task

When creating kanban task, logs appear automatically:

```markdown
### TASK-280 | Form Builder UI Implementation
**Priority**: High | **Category**: Frontend | **Status**: in-progress
**Created**: 2026-01-10 | **Started**: 2026-01-10
**Tags**: #forms #ui #research

Build form builder UI based on design specs.

**Subtasks**:
- [x] Review legacy screenshots
- [x] Analyze specification docs
- [ ] Design 3-panel layout mockup
- [ ] Implement drag-drop canvas

**Notes**:
Initial research complete. Findings documented in findings/TASK-280.md

**Visual Operations Log**:
- 2026-01-10 14:30:45 - WebFetch: https://legacy-app.com/screenshots
- 2026-01-10 14:31:22 - WebSearch: "form builder UI patterns"
```

### Step 2: Create Findings File

After 2 visual operations, create `findings/TASK-XXX.md` using the template above.

---

## Workflow Example: Implementing Form Builder

**10:00 - Action 1:** View screenshot of legacy form builder
```
Claude in Chrome screenshot shows:
- 3-panel layout (palette, canvas, properties)
- Drag-drop field placement
- Visual inheritance indicators
```

**10:05 - Action 2:** Read PDF specification
```
PDF requirements:
- Inheritance: base → org-specific → role-specific
- Visual distinction for overridden fields
- Compliance: WCAG 2.1 AA
```

**10:06 - STOP: Create findings/TASK-280.md**
```markdown
# Findings: TASK-280 | Form Builder

## Visual Analysis

### Screenshot: Legacy Form Builder (2026-01-10 10:00)
- 3-panel layout: Left (field palette), Center (canvas), Right (properties)
- Fields have drag handles for reordering
- Inheritance shown with colored badges (blue=base, green=org, purple=role)
- Canvas uses grid snapping for alignment

### PDF Specification (2026-01-10 10:05)
- Inheritance model: base template → org override → role override
- Visual indicators: Badge color coding + tooltip on hover
- Required: Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Compliance: WCAG 2.1 AA (4.5:1 contrast, focus states)

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Modal for properties panel | Consistent with app patterns |
| react-dnd library | Accessible drag-drop, keyboard support |
| Badge variants | Match existing design system |

## Resources

- Legacy screenshot: `/tmp/screenshots/legacy-builder.png`
- PDF spec: `docs/design/form-builder-spec.pdf`
- React DnD: https://react-dnd.github.io/react-dnd/
```

**Result:** Even if context resets, findings preserved as text.

---

## Automated Logging System

**Since:** Version 3.0.0 | **Date:** 2026-01-11

### What's Logged

Every WebFetch and WebSearch operation is automatically appended to the task's **Notes** section in kanban.md:

```markdown
**Notes**:
Current implementation progress documented.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://nextjs.org/docs
- 2026-01-11 10:31:22 - WebSearch: "Claude Code best practices"
- 2026-01-11 10:35:10 - WebFetch: https://anthropic.com/claude-code
```

**Log Location:** Inline in `kanban.md` → task's **Notes** section

### How It Works

1. **PreToolUse Hook Triggers** - When you use WebFetch or WebSearch
2. **Operation Logged** - Formatted line appended to task's **Notes** section in kanban.md
3. **Counter Incremented** - Stored in `/tmp/claude-visual-ops-session.txt`
4. **Reminder After 2** - You'll see this message:

```
======================================================================
🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH
======================================================================

📊 Visual operations count: 2
📋 Current task: TASK-280
📝 Logs appended to: kanban.md → TASK-280 Notes

✅ NEXT STEP: Create or update findings file
   Location: findings/TASK-280.md
...
======================================================================
```

### Viewing Logs

**Logs are stored inline in kanban tasks:**

1. **Open kanban file:** `kanban.md`
2. **Navigate to task:** Find `### TASK-XXX` heading
3. **Scroll to Notes:** Look for `**Notes**:` section
4. **Find log header:** `**Visual Operations Log**:`

**Example:**
```markdown
### TASK-280 | Implement Feature
**Priority**: High | **Category**: Dev | **Status**: in-progress
...

**Notes**:
Implementation complete, logs appended inline.

**Visual Operations Log**:
- 2026-01-11 10:30:45 - WebFetch: https://docs.example.com
- 2026-01-11 10:31:22 - WebSearch: "best practices"
```

### Resetting Counter

After creating findings file, optionally reset counter:

```bash
rm /tmp/claude-visual-ops-session.txt
```

### Benefits

- **Single Source of Truth:** Logs live with task, not in separate files
- **Survives Archiving:** Logs move with task to archive.md when archived
- **No File Management:** No separate log files to maintain or clean up
- **Human Readable:** Markdown format, easy to scan and understand
- **Audit Trail:** Complete history of visual research operations per task
- **Task Context:** Logs always linked to specific work being done

---

## Directory Structure

```
project/
├── kanban.md                 ← Main task board
├── archive.md               ← Archived tasks (with logs preserved)
├── findings/                ← Research logs (on-demand creation)
│   ├── TASK-280.md         ← Form builder research
│   ├── TASK-199.md         ← Calculated fields research
│   └── TASK-198.md         ← Skip logic research
└── integrations/
    └── claude-code/         ← Claude Code integration
        ├── hooks/           ← PreToolUse hook for logging
        └── skills/          ← This skill file
```

**Key principle:** Findings files created on-demand, not upfront. Only create when you have visual research to preserve.

---

## Anti-Patterns

### ❌ Wrong: Skip logging because "I remember"

```
10:00 - View screenshot
10:05 - Read PDF
10:10 - Start coding
[Context reset]
Result: Lost all visual insights
```

### ✅ Correct: Log immediately after 2 actions

```
10:00 - View screenshot
10:05 - Read PDF
10:06 - Create findings/TASK-XXX.md
10:10 - Start coding
[Context reset]
Result: Findings preserved, can resume work
```

### ❌ Wrong: Vague descriptions

```markdown
## Visual Analysis
- Looked at screenshot, it has some panels
- PDF said something about requirements
```

### ✅ Correct: Detailed observations

```markdown
## Visual Analysis

### Screenshot: Form Builder (2026-01-10 10:00)
- 3-panel layout: 250px left palette, fluid center canvas, 300px right properties
- Fields: 12 default types (text, email, phone, date, select, checkbox, etc.)
- Drag handles: 6-dot vertical icon, appears on hover
- Grid: 8px snap-to-grid for alignment
```

---

## When NOT to Use

**Skip research preservation for:**
- Reading code files (already persisted)
- Viewing git diffs (available via git)
- Checking logs (ephemeral, not research)
- Quick lookups (no insights to preserve)

**Use research preservation for:**
- Screenshots of UIs, designs, wireframes
- PDFs, images, diagrams
- Browser results with visual content
- Documentation with code examples
- Competitive analysis (visual comparisons)

---

**Skill Version:** 3.0.0
**Created:** 2026-01-10 | **Updated:** 2026-01-11 (Inline logging, portable version)
**Status:** Production | Optional enhancement to MarkdownTaskManager workflow
**License:** MIT
**Portability:** Can be used in any project with MarkdownTaskManager
