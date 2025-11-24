# Status Field Implementation for task-manager.html

## Code Changes Required

### Change 1: Parser Enhancement (parseTask function)

**Location:** `task-manager.html` line ~2108

**Find this code:**
```javascript
function parseTask(id, title, content, status) {
    const task = {
        id,
        title: title.trim(),
        status,
        priority: '',
        category: '',
        assignees: [],
        tags: [],
        created: '',
        started: '',
        due: '',
        completed: '',
        description: '',
        subtasks: [],
        notes: ''
    };

    // Parse metadata line
    const metaMatch = content.match(/\*\*Priority\*\*:\s*(\w+)\s*\|\s*\*\*Category\*\*:\s*([^|]+?)(?:\s*\|\s*\*\*Assigned\*\*:\s*(.+?))?$/m);
```

**Add after the metaMatch parsing (around line 2120):**
```javascript
    // ⭐ NEW: Parse Status field (authoritative if present)
    const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
    if (statusMatch) {
        task.status = statusMatch[1].toLowerCase();
    }
```

**That's it for Phase 1!** This makes Status field work immediately.

---

### Change 2: Auto-Organize Button (Optional UI Enhancement)

**Location:** `task-manager.html` header section (around line 400)

**Add button next to existing buttons:**
```html
<button id="organizeBtn" class="btn btn-secondary" title="Reorganize tasks by Status field">
    🔄 Organize by Status
</button>
```

**Location:** `task-manager.html` JavaScript section (around line 2500)

**Add organize function:**
```javascript
function organizeTasksByStatus() {
    if (!kanbanFileHandle) {
        alert('Please open a kanban file first');
        return;
    }
    
    // Count tasks with Status field
    const statusTasks = tasks.filter(t => {
        const content = t.fullText || '';
        return /\*\*Status\*\*:\s*\S+/i.test(content);
    });
    
    if (statusTasks.length === 0) {
        alert('No tasks with **Status** field found.\n\nAdd **Status**: todo|in-progress|in-review|done to tasks first.');
        return;
    }
    
    if (!confirm(`Reorganize ${statusTasks.length} tasks by Status field?\n\nThis will move tasks to sections matching their **Status** value.`)) {
        return;
    }
    
    // Group tasks by status
    const sections = {};
    config.columns.forEach(col => sections[col.id] = []);
    
    tasks.forEach(task => {
        const statusMatch = (task.fullText || '').match(/\*\*Status\*\*:\s*(\S+)/i);
        const targetStatus = statusMatch ? statusMatch[1].toLowerCase() : task.status;
        
        if (sections[targetStatus]) {
            sections[targetStatus].push(task);
        } else {
            // Unknown status → default to current section
            sections[task.status].push(task);
        }
    });
    
    // Regenerate markdown
    const newContent = generateMarkdownFromSections(sections);
    
    // Save and reload
    saveKanban(newContent);
    parseMarkdown(newContent);
    renderKanban();
    
    showNotification(`✅ Reorganized ${statusTasks.length} tasks by Status field`);
}

function generateMarkdownFromSections(sections) {
    // Extract header (everything before first section)
    const headerMatch = currentKanbanContent.match(/^([\s\S]+?)(?=\n## )/);
    let markdown = headerMatch ? headerMatch[1] : '';
    markdown += '\n';
    
    // Generate each section
    config.columns.forEach(column => {
        markdown += `## ${column.name}\n\n`;
        
        const sectionTasks = sections[column.id] || [];
        sectionTasks.forEach(task => {
            markdown += task.fullText + '\n\n---\n\n';
        });
    });
    
    return markdown;
}

// Wire up button
document.getElementById('organizeBtn').addEventListener('click', organizeTasksByStatus);
```

---

### Change 3: Task Editor Enhancement (Optional)

**Location:** Task creation/edit modal (around line 600)

**Add Status field to form:**
```html
<div class="form-group">
    <label for="taskStatusField">Status (Optional)</label>
    <select id="taskStatusField" class="form-control">
        <option value="">-- Auto (from section) --</option>
        <option value="todo">📝 To Do</option>
        <option value="in-progress">🚀 In Progress</option>
        <option value="in-review">👀 In Review</option>
        <option value="done">✅ Done</option>
    </select>
    <small class="form-text text-muted">
        If set, this overrides section location when using "Organize by Status"
    </small>
</div>
```

**Location:** Task generation code (around line 1200)

**Add Status to metadata line:**
```javascript
// Generate metadata line
let metadataLine = `**Priority**: ${priority} | **Category**: ${category}`;

// Add Status if specified
const statusField = document.getElementById('taskStatusField').value;
if (statusField) {
    metadataLine += ` | **Status**: ${statusField}`;
}

if (assignees.length > 0) {
    metadataLine += ` | **Assigned**: ${assignees}`;
}
```

---

## Testing the Changes

### Test 1: Status Field Parsing

1. Create a task:
```markdown
### TASK-001 | Test task
**Priority**: High | **Category**: Backend | **Status**: in-progress
**Created**: 2025-11-23
```

2. Place it in "📝 To Do" section
3. Reload task-manager.html
4. Task should display but status from field takes precedence

### Test 2: Auto-Organize Button

1. Create 3 tasks in wrong sections:
   - TASK-001 in "To Do" with `**Status**: done`
   - TASK-002 in "Done" with `**Status**: in-progress`
   - TASK-003 in "In Progress" with `**Status**: todo`

2. Click "🔄 Organize by Status" button
3. Tasks should move to match their Status field

### Test 3: Backward Compatibility

1. Open existing kanban.md (without Status fields)
2. Everything should work exactly as before
3. No errors, no data loss

---

## Valid Status Values

The status value must match column IDs from configuration:

```markdown
**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | 👀 In Review (in-review) | ✅ Done (done)
```

Valid values: `todo`, `in-progress`, `in-review`, `done`

---

## Example Usage

### Before (Section-based)
```markdown
## 📝 To Do

### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend
**Created**: 2025-11-23

[User must drag to "In Progress" section to change status]
```

### After (Status-based - Optional)
```markdown
## 📝 To Do

### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: in-progress
**Created**: 2025-11-23 | **Started**: 2025-11-23

[Click "Organize by Status" → Moves to "In Progress" automatically]
```

---

## Implementation Priority

**Phase 1: Parser (Must Have)**
- 5 lines of code
- Zero breaking changes
- Enables all automation

**Phase 2: Organize Button (Should Have)**
- Makes feature discoverable
- User-friendly
- Non-destructive

**Phase 3: Task Editor (Nice to Have)**
- UI for adding Status field
- Optional convenience feature
- Can add later

---

## Benefits Summary

✅ **Minimal code changes** (Parser: 5 lines)  
✅ **100% backward compatible** (Status field is optional)  
✅ **No breaking changes** (Existing workflow unchanged)  
✅ **Enables automation** (AI agents, scripts, CI/CD)  
✅ **User-friendly** (Optional organize button)  
✅ **Future-proof** (Opens integration possibilities)

Ready to implement! 🚀
