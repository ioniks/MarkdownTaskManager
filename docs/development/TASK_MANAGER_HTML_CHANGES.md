# task-manager.html Changes for Status Field Auto-Reorganization

## The Problem

**Current behavior:**
- task-manager.html uses **section location** to determine task status
- Task in "## 📝 To Do" section → status = 'todo'
- Status field in markdown is ignored completely

**Conflict:**
- AI edits Status field to 'in-progress'
- Task stays in "To Do" section in .md file
- task-manager.html reads file → sees task in "To Do" section → displays as 'todo'
- **Status field is ignored!** ❌

## The Solution: Make Status Field Authoritative

### Change 1: Parse Status Field in parseTask()

**Location:** Line ~2120

**Current code:**
```javascript
function parseTask(id, title, content, status) {
    const task = {
        id,
        title: title.trim(),
        status,  // From section location
        // ...
    };
    
    // Parse metadata line
    const metaMatch = content.match(/\*\*Priority\*\*:\s*(\w+)\s*\|\s*\*\*Category\*\*:\s*([^|]+?)(?:\s*\|\s*\*\*Assigned\*\*:\s*(.+?))?$/m);
    // ...
}
```

**Add after metadata parsing:**
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
    // ... existing metadata parsing ...
    
    // ⭐ NEW: Parse Status field (authoritative if present)
    const validStatuses = ['todo', 'in-progress', 'in-review', 'done'];
    const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
    if (statusMatch) {
        const statusValue = statusMatch[1].toLowerCase();
        if (validStatuses.includes(statusValue)) {
            task.status = statusValue;  // Override section-based status
            task.hasExplicitStatus = true;  // Mark for auto-reorganization
        }
    }
    
    // ... rest of parsing ...
}
```

### Change 2: Auto-Reorganize on File Change

**Location:** After `applyExternalChanges()` function (~line 2600)

**Add new function:**
```javascript
// Auto-reorganize tasks when Status field doesn't match section
async function autoReorganizeByStatus() {
    if (!kanbanFileHandle) return;
    
    let needsReorganization = false;
    const validStatuses = ['todo', 'in-progress', 'in-review', 'done'];
    
    // Check each task for Status field
    tasks.forEach(task => {
        const statusMatch = (task.fullText || '').match(/\*\*Status\*\*:\s*(\S+)/i);
        
        if (statusMatch) {
            const explicitStatus = statusMatch[1].toLowerCase();
            
            // Only reorganize if valid status and doesn't match current position
            if (validStatuses.includes(explicitStatus) && explicitStatus !== task.status) {
                console.log(`Status mismatch: ${task.id} has **Status**: ${explicitStatus} but task.status is ${task.status}`);
                task.status = explicitStatus;
                needsReorganization = true;
            }
        }
    });
    
    if (needsReorganization) {
        console.log('Auto-reorganizing tasks by Status field...');
        
        const reorganized = generateMarkdown();
        
        try {
            const writable = await kanbanFileHandle.createWritable();
            await writable.write(reorganized);
            await writable.close();
            currentKanbanContent = reorganized;
            
            console.log('✅ Auto-reorganized and saved');
            showNotification('Tasks reorganized by Status field', 'success');
            
            // Reload UI to reflect changes
            parseMarkdown(reorganized);
            renderKanban();
        } catch (error) {
            console.error('Auto-reorganize save failed:', error);
        }
    }
}
```

### Change 3: Call Auto-Reorganize

**Location:** End of `applyExternalChanges()` function (~line 2570)

**Add at the end:**
```javascript
function applyExternalChanges(oldTasks, newTasks) {
    // ... all existing code ...
    
    // Update column counts
    config.columns.forEach(column => {
        updateColumnCount(column.id);
    });
    
    // ⭐ NEW: Auto-reorganize if Status fields present
    autoReorganizeByStatus();
}
```

## How It Works

### Before (Section-based)

**Markdown file:**
```markdown
## 📝 To Do

### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: in-progress  ← AI changes this
**Created**: 2025-11-23
```

**task-manager.html reads:**
- Task in "To Do" section → `task.status = 'todo'`
- Status field ignored
- **Displays in To Do column** ❌ (wrong!)

### After (Status-field-based)

**Markdown file:**
```markdown
## 📝 To Do

### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: in-progress  ← AI changes this
**Created**: 2025-11-23
```

**task-manager.html reads:**
1. Task in "To Do" section → `task.status = 'todo'` (initial)
2. **Parses Status field** → `**Status**: in-progress` found
3. **Overrides:** `task.status = 'in-progress'` ✅
4. **Auto-reorganizes .md file** → moves task to "In Progress" section
5. **Saves file automatically**
6. **Reloads UI** → task now in correct column ✅

## Benefits

✅ **Status field is authoritative** - Overrides section location  
✅ **Automatic file reorganization** - No manual task movement  
✅ **AI-friendly** - AI just changes Status field, done!  
✅ **Backward compatible** - Tasks without Status field use section location  
✅ **No breaking changes** - Existing workflows unchanged  

## Testing

### Test 1: Status Field Override
1. Edit kanban.md manually
2. Add `**Status**: done` to task in "To Do" section
3. Save file
4. Open in task-manager.html
5. **Expected:** Task displays in "Done" column (not "To Do")
6. **File auto-reorganizes:** Task moves to "Done" section in .md file

### Test 2: AI Workflow
1. AI edits kanban.md: changes `**Status**: todo` to `**Status**: in-progress`
2. AI saves file
3. task-manager.html file watcher detects change (2 seconds)
4. **Auto-reorganization runs**
5. Task moves to "In Progress" section in .md file
6. AI reads file next time → task already in correct section ✅

### Test 3: Backward Compatibility
1. Open kanban.md without Status fields
2. Everything works as before
3. Section location determines status
4. No errors, no changes

## Implementation Summary

**Total changes: ~35 lines**

1. Parse Status field (5 lines) - Make authoritative
2. Auto-reorganize function (25 lines) - Detect and reorganize
3. Call on file change (1 line) - Trigger automatically
4. UI reload (4 lines) - Refresh display

**Zero breaking changes, fully backward compatible** ✅
