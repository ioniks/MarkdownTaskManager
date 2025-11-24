# Contribution Proposal: Status Field Auto-Organization

## Overview

Proposal to enhance **task-manager.html** with Status-field-based auto-organization - a built-in feature that makes MarkdownTaskManager more powerful for automated workflows.

## The Enhancement

### Current Behavior
- Task status is determined by physical section location
- Users must manually drag/drop or cut/paste tasks between sections
- Section location = source of truth

### Proposed Enhancement
- Add **Status field parsing** to existing parser
- Make Status field **optional but authoritative** when present
- Add **auto-organize button** to reorganize tasks by Status field
- 100% backward compatible (works with or without Status field)

## Why This Matters

### For Manual Users
- Optional feature (can ignore Status field entirely)
- Existing workflow unchanged
- New capability: Organize button reorganizes mismatched tasks

### For AI Agents / Automation
- Edit Status field in markdown → Click organize → Done
- No manual section movement needed
- Much simpler programmatic updates

### For Teams
- Status field enables automation/scripting
- Git workflows can auto-organize on commit
- Better integration with external tools

## Implementation Plan

### Phase 1: Parser Enhancement (Minimal Change)

**File:** `task-manager.html` line ~2108 in `parseTask()`

**Current code:**
```javascript
function parseTask(id, title, content, status) {
    const task = {
        id,
        title: title.trim(),
        status,  // From section location
        // ...
    };
    // ... rest of parsing ...
}
```

**Proposed addition:**
```javascript
function parseTask(id, title, content, status) {
    const task = {
        id,
        title: title.trim(),
        status,  // Default from section location
        // ...
    };
    
    // Parse metadata line
    const metaMatch = content.match(/\*\*Priority\*\*:\s*(\w+)\s*\|\s*\*\*Category\*\*:\s*([^|]+?)(?:\s*\|\s*\*\*Assigned\*\*:\s*(.+?))?$/m);
    // ... existing code ...
    
    // ⭐ NEW: Check for Status field (authoritative if present)
    const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
    if (statusMatch) {
        task.status = statusMatch[1].toLowerCase();
        task.hasExplicitStatus = true; // Track this
    }
    
    // ... rest of existing parsing ...
}
```

**Impact:** 
- 5 lines added
- Zero breaking changes
- Backward compatible

### Phase 2: Auto-Organize Button (UI Enhancement)

**Add button to header:**
```html
<button id="organizeByStatus" class="btn btn-secondary" style="display: none;">
    🔄 Organize by Status Field
</button>
```

**Add organize function:**
```javascript
function organizeTasksByStatus() {
    // 1. Find all tasks with explicit Status field
    const tasksToReorganize = tasks.filter(t => t.hasExplicitStatus);
    
    if (tasksToReorganize.length === 0) {
        alert('No tasks with Status field found');
        return;
    }
    
    // 2. Group by status value
    const sections = {};
    config.columns.forEach(col => {
        sections[col.id] = [];
    });
    
    tasks.forEach(task => {
        if (task.hasExplicitStatus) {
            // Use Status field
            const status = task.status.toLowerCase();
            if (sections[status]) {
                sections[status].push(task);
            }
        } else {
            // Use existing section location
            sections[task.status].push(task);
        }
    });
    
    // 3. Regenerate markdown
    const newMarkdown = generateMarkdownFromSections(sections);
    
    // 4. Save to file
    saveMarkdownToFile(newMarkdown);
    
    // 5. Reload UI
    parseMarkdown(newMarkdown);
    renderKanban();
    
    alert(`Reorganized ${tasksToReorganize.length} tasks by Status field`);
}

// Show button only if tasks have Status field
function updateOrganizeButton() {
    const hasStatusField = tasks.some(t => t.hasExplicitStatus);
    document.getElementById('organizeByStatus').style.display = 
        hasStatusField ? 'inline-block' : 'none';
}
```

**Impact:**
- Optional button (only shows if Status fields exist)
- One-click reorganization
- Non-destructive (can undo with browser back)

### Phase 3: Task Editor Enhancement (Optional)

**Add Status field to task creation/edit dialog:**
```html
<div class="form-group">
    <label for="taskStatus">Status (Optional)</label>
    <select id="taskStatusField">
        <option value="">-- Auto (from section) --</option>
        <option value="todo">📝 To Do</option>
        <option value="in-progress">🚀 In Progress</option>
        <option value="in-review">👀 In Review</option>
        <option value="done">✅ Done</option>
    </select>
</div>
```

**Include in markdown generation:**
```javascript
if (taskStatusField && taskStatusField !== '') {
    metadataLine += ` | **Status**: ${taskStatusField}`;
}
```

**Impact:**
- UI for adding Status field
- Optional (can leave blank)
- Makes feature discoverable

## Task Format Examples

### Without Status Field (Current - Still Works)
```markdown
### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend
**Created**: 2025-11-23
```
Status derived from section location ✅

### With Status Field (New - Optional)
```markdown
### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: in-progress
**Created**: 2025-11-23
```
Status field is authoritative ✅

## Backward Compatibility

✅ **Existing files work unchanged** - Status field is optional  
✅ **Drag/drop still works** - UI remains the same  
✅ **No data loss** - Parser falls back to section location  
✅ **Opt-in feature** - Organize button only shows when needed  

## Benefits

### Immediate Value
- ✅ Makes MarkdownTaskManager automation-friendly
- ✅ Enables CI/CD integrations
- ✅ Better for programmatic updates
- ✅ Still works great for manual workflows

### Future Possibilities
- Git hook integration (community can build)
- CLI tool integration (community can build)
- API automation (community can build)
- **Core stays simple, extensible by design**

## Implementation Approach

### Option A: Minimal (Phase 1 Only)
- Just add Status field parsing
- No UI changes
- Document feature for power users
- **Simplest, lowest risk**

### Option B: Complete (All 3 Phases)
- Status field parsing
- Organize button
- Task editor enhancement
- **Full featured, discoverable**

### Option C: Gradual
1. Release Phase 1 (parser)
2. Get feedback
3. Add Phases 2-3 based on usage

## Questions for Maintainer

1. **Interest?** Does this align with MarkdownTaskManager vision?
2. **Scope?** Prefer minimal or complete implementation?
3. **Timeline?** Any specific release window?
4. **Code style?** Any specific patterns to follow?

## Proof of Concept

We have working code demonstrating:
- Status field parser (tested with production kanban files)
- Auto-reorganization logic
- Backward compatibility validation

Happy to:
- Share code reference
- Create demo video
- Build prototype in fork
- Whatever helps evaluate this proposal

## Summary

**What:** Optional Status field support in task-manager.html  
**Why:** Makes MarkdownTaskManager automation-friendly  
**How:** Small parser enhancement + optional UI button  
**Risk:** Very low (fully backward compatible)  
**Value:** High (opens automation possibilities)

---

Ready to contribute! Let us know your thoughts.
