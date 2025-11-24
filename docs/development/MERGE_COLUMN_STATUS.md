# Merge Column and Status Field in task-manager.html

## The Insight

**Column dropdown = Status field** - They're the same thing!

When user selects column in UI:
- "📝 To Do" → `**Status**: todo`
- "🚀 In Progress" → `**Status**: in-progress`
- "👀 In Review" → `**Status**: in-review`
- "✅ Done" → `**Status**: done`

## Implementation

### Change 1: Add Status Field to generateMarkdown()

**Location:** `generateMarkdown()` function, line ~3360 (metadata generation)

**Current code:**
```javascript
columnTasks.forEach(task => {
    md += `### ${task.id} | ${task.title}\n`;

    let meta = '';
    if (task.priority) meta += `**Priority**: ${task.priority}`;
    if (task.category) meta += ` | **Category**: ${task.category}`;
    if (task.assignees.length > 0) meta += ` | **Assigned**: ${task.assignees.join(', ')}`;
    if (meta) md += meta + '\n';
    // ...
});
```

**Add Status field:**
```javascript
columnTasks.forEach(task => {
    md += `### ${task.id} | ${task.title}\n`;

    let meta = '';
    if (task.priority) meta += `**Priority**: ${task.priority}`;
    if (task.category) meta += ` | **Category**: ${task.category}`;
    
    // ⭐ NEW: Add Status field (maps to column)
    if (task.status) meta += ` | **Status**: ${task.status}`;
    
    if (task.assignees.length > 0) meta += ` | **Assigned**: ${task.assignees.join(', ')}`;
    if (meta) md += meta + '\n';
    // ...
});
```

### Change 2: Parse Status Field (already covered)

**Location:** `parseTask()` function, line ~2120

```javascript
// Parse Status field (authoritative)
const validStatuses = ['todo', 'in-progress', 'in-review', 'done'];
const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
if (statusMatch) {
    const statusValue = statusMatch[1].toLowerCase();
    if (validStatuses.includes(statusValue)) {
        task.status = statusValue;  // Override section-based status
    }
}
```

### Change 3: Update Status on Column Change

**Location:** Drag/drop handler or column change handler

**When task moves to new column (drag/drop or edit dialog):**
```javascript
// Existing code updates task.status
task.status = newColumnId;  // e.g., 'in-progress'

// ⭐ NEW: Also update Status field in task object
// This ensures generateMarkdown() writes correct Status field
// (task.status is already updated, so generateMarkdown() will use it)

// Save immediately
autoSave();
```

**The key:** We're already updating `task.status` when column changes. Now we just need to ensure `generateMarkdown()` writes this to the `**Status**` field!

## How It Works

### Scenario 1: User Drags Task in UI

**User action:**
- Drags TASK-001 from "To Do" to "In Progress"

**task-manager.html:**
1. Updates `task.status = 'in-progress'` (existing code)
2. Calls `autoSave()` → `generateMarkdown()`
3. **generateMarkdown() writes:** `**Status**: in-progress` (NEW!)
4. File saved with Status field updated

**Markdown result:**
```markdown
## 🚀 In Progress

### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: in-progress  ← Auto-added!
**Created**: 2025-11-23
```

### Scenario 2: AI Changes Status Field

**AI action:**
- Edits markdown: `**Status**: todo` → `**Status**: in-progress`
- Saves file

**task-manager.html:**
1. File watcher detects change
2. `parseTask()` reads: `**Status**: in-progress`
3. Sets `task.status = 'in-progress'` (overrides section location)
4. `autoReorganizeByStatus()` runs
5. Task moves to "In Progress" section in markdown
6. UI updates to show task in correct column

### Scenario 3: Task Without Status Field

**Markdown:**
```markdown
## 📝 To Do

### TASK-002 | Old task
**Priority**: High | **Category**: Backend
```

**task-manager.html:**
1. `parseTask()` finds no Status field
2. Uses section location: `task.status = 'todo'`
3. Works exactly as before (backward compatible)

**If user drags task:**
1. Updates `task.status = 'done'`
2. `generateMarkdown()` writes: `**Status**: done` (NEW!)
3. Now task has Status field for future edits

## Benefits

✅ **Column and Status are synced** - Always match  
✅ **UI changes write Status field** - Automatic  
✅ **AI can change Status field** - Task reorganizes automatically  
✅ **Backward compatible** - Old tasks without Status field still work  
✅ **Single source of truth** - Status field (when present) is authoritative  

## Implementation Summary

**Total changes needed:**

1. **generateMarkdown()** - Add 1 line to write Status field
   ```javascript
   if (task.status) meta += ` | **Status**: ${task.status}`;
   ```

2. **parseTask()** - Already done (parse Status field)
   
3. **autoReorganizeByStatus()** - Already done (reorganize on change)

**That's it!** The rest works automatically because `task.status` is already tracked.

## Result

**Column dropdown in UI = Status field in markdown**

When you change column → Status field updates  
When AI changes Status field → Column updates

**Perfect sync! ✅**
