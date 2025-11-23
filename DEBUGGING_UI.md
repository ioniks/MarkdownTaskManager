
# Alpine.js Migration - UI Debugging Guide

**Date**: 2025-11-23  
**Branch**: alpine-migration-v2  
**Status**: UI fixes applied, ready for testing

## What Was Fixed

### ✅ Fix #1: Global t() Function
**Problem**: HTML templates called `t('key')` but function was only available as `window.translationSystem.t()`  
**Solution**: Added `window.t = t;` to translations.js  
**File**: `js/utils/translations.js`  
**Impact**: All x-text="t(...)" calls should now work

### ✅ Fix #2: Filters Not Showing
**Problem**: Filter bar had condition requiring `showFilterBar` to be true, but it was always false  
**Solution**: Changed filter bar x-show to `$store.tasks.directoryHandle` (always show when project loaded)  
**File**: `task-manager.html:147`  
**Impact**: Filter bar now visible when project is loaded

### ✅ Fix #3: Subtasks Not Visible When Editing
**Problem**: Subtasks were not populated in edit mode; assignees/tags input fields were empty  
**Solution**: 
- Populate `formSubtasks` from task.subtasks with null checks
- Populate `taskFormAssigneesInput` and `taskFormTagsInput` when opening edit form
- Added missing `updateTaskFormAssignees()` and `updateTaskFormTags()` methods
**Files**: `js/stores/uiStore.js:123-125, 368-378`  
**Impact**: Edit form now shows subtasks, assignees, and tags correctly

### ✅ Fix #4: Project Selector Not Showing Selected Folder
**Problem**: Used `:selected="project.handle === $store.tasks.directoryHandle"` (object comparison, always false)  
**Solution**: 
- Use `:value="getCurrentProjectIndex()"` on select element
- Added `getCurrentProjectIndex()` method that compares by name
**Files**: `task-manager.html:60`, `js/app.js:141-150`  
**Impact**: Project selector dropdown now shows currently selected project

## How to Test the Application

### Step 1: Open in Browser
```bash
# Server is running on http://localhost:8080
open http://localhost:8080/task-manager.html

# Or in Chrome specifically:
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome http://localhost:8080/task-manager.html
```

### Step 2: Check Browser Console
Press `Cmd+Option+J` (Mac) or `F12` (Windows) to open Developer Tools

**Look for these errors:**
- ❌ `Alpine is not defined` - Alpine.js didn't load
- ❌ `t is not a function` - Translation function not available (should be fixed now)
- ❌ `Cannot read property of undefined` - Store access issues
- ❌ `[method] is not a function` - Missing methods

### Step 3: Test Each UI Component

#### 3.1 Welcome Screen
- [ ] **Page loads** - Welcome screen appears
- [ ] **Text displays** - Title and description show (uses t() function)
- [ ] **Button works** - "Get Started" button clickable
- [ ] Console shows: "Task Manager initialized"

#### 3.2 Language Selector
- [ ] **Dropdown works** - Can open language dropdown
- [ ] **Switch language** - Select Français
- [ ] **UI updates** - Text changes to French
- [ ] Console shows: "Language changed to: fr"

#### 3.3 File Selection
- [ ] **Button exists** - "Select Folder" button visible
- [ ] **Click works** - Button responds to click
- [ ] **File picker opens** - Browser file picker appears
- [ ] **Folder loads** - Select a folder with kanban.md
- [ ] **Tasks appear** - Kanban board renders

#### 3.4 Kanban Board
- [ ] **Columns render** - All configured columns appear
- [ ] **Tasks render** - Tasks appear in correct columns
- [ ] **Task counts** - Column counts show correctly
- [ ] **Task cards** - All task metadata displays (priority, category, etc.)

#### 3.5 Task Cards
- [ ] **Click task** - Task detail modal opens
- [ ] **Task details show** - All task information displays
- [ ] **Edit button** - Opens edit form
- [ ] **Archive button** - Prompts for confirmation
- [ ] **Delete button** - Prompts for confirmation

#### 3.6 Drag and Drop
- [ ] **Task draggable** - Can grab task card
- [ ] **Visual feedback** - Card shows dragging state
- [ ] **Drop works** - Can drop in different column
- [ ] **Task moves** - Task updates to new status
- [ ] **File saves** - kanban.md updates

#### 3.7 Filters
- [ ] **Filter bar** - Filter section visible
- [ ] **Add filter** - Can add tag/category/user filter
- [ ] **Filter pills** - Active filters show as pills
- [ ] **Tasks filter** - Task list filters correctly
- [ ] **Remove filter** - Can remove individual filters
- [ ] **Clear all** - Clear all button works
- [ ] **Search** - Global search filters tasks

#### 3.8 New Task
- [ ] **Button visible** - "New Task" button appears after loading project
- [ ] **Opens modal** - Click opens task form
- [ ] **Form fields** - All fields editable
- [ ] **Column dropdown** - Shows available columns
- [ ] **Priority dropdown** - Shows priority options
- [ ] **Subtasks** - Can add/remove subtasks
- [ ] **Submit works** - Creates new task
- [ ] **Modal closes** - Form closes after submit
- [ ] **Kanban updates** - New task appears

#### 3.9 Archive
- [ ] **Button visible** - "Archive" button appears
- [ ] **Opens modal** - Archive modal opens
- [ ] **Shows archived tasks** - Archived tasks list
- [ ] **Search works** - Can search archived tasks
- [ ] **Restore works** - Can restore to kanban
- [ ] **Delete works** - Can permanently delete

#### 3.10 Columns Management
- [ ] **Button visible** - "Manage Columns" button appears
- [ ] **Opens modal** - Columns modal opens
- [ ] **Shows columns** - Lists current columns
- [ ] **Add column** - Can add new column
- [ ] **Remove column** - Can remove column
- [ ] **Reorder** - Can reorder columns (if implemented)

## Common Issues and Fixes

### Issue 1: Alpine Not Initializing
**Symptoms**: White screen, no console logs
**Check**:
```javascript
// In console, type:
typeof Alpine
// Should return: "object"
```
**Fix**: Ensure Alpine.js CDN is loading (check Network tab)

### Issue 2: Stores Not Accessible
**Symptoms**: `Cannot read property 'tasks' of undefined`
**Check**:
```javascript
// In console, type:
Alpine.store('tasks')
Alpine.store('ui')
Alpine.store('filters')
// Each should return an object
```
**Fix**: Ensure stores/*.js files are loading before app.js

### Issue 3: Methods Not Found
**Symptoms**: `[method] is not a function`
**Check**: Look at the exact method name in error
**Common causes**:
- Method doesn't exist in app.js
- Method is in store but called without `$store.`
- Typo in method name

### Issue 4: Tasks Not Rendering
**Symptoms**: Kanban loads but no tasks appear
**Check**:
```javascript
// In console:
Alpine.store('tasks').tasks
// Should show array of tasks
```
**Debug**:
- Check if kanban.md was parsed correctly
- Look for markdown parsing errors in console
- Verify tasks have valid status field

### Issue 5: Drag and Drop Not Working
**Symptoms**: Can't drag tasks
**Check**:
- Are tasks marked as `draggable="true"`?
- Do drag event handlers exist in app.js?
- Check console for drag-related errors

### Issue 6: File Not Saving
**Symptoms**: Changes don't persist
**Check**:
```javascript
// In console:
Alpine.store('tasks').kanbanFileHandle
// Should return FileSystemFileHandle object
```
**Debug**:
- File System Access API may not be granted
- Check browser supports File System Access API
- Look for permission denied errors

## Debugging with Browser DevTools

### Console Commands

```javascript
// Check Alpine state
Alpine.store('tasks')
Alpine.store('ui')
Alpine.store('filters')

// Check if t() is available
typeof t
t('header.title')

// Check file handles
Alpine.store('tasks').directoryHandle
Alpine.store('tasks').kanbanFileHandle

// Check current tasks
Alpine.store('tasks').tasks
Alpine.store('tasks').config

// Force re-render
Alpine.store('tasks').tasks = [...Alpine.store('tasks').tasks]

// Check filtered tasks
Alpine.store('filters').getFilteredTasks(Alpine.store('tasks').tasks)
```

### Network Tab
Check that all files load:
- ✅ task-manager.html
- ✅ css/styles.css
- ✅ https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js
- ✅ js/utils/translations.js
- ✅ js/utils/fileSystem.js
- ✅ js/utils/markdown.js
- ✅ js/utils/fileWatcher.js
- ✅ js/stores/taskStore.js
- ✅ js/stores/uiStore.js
- ✅ js/stores/filterStore.js
- ✅ js/app.js

### Elements Tab
Check Alpine directives are applied:
- `<body>` should have `x-data` attribute
- Elements with `x-show` should toggle display
- Elements with `x-text` should show text
- `x-for` loops should render children

## Reporting Issues

If you find bugs, note:
1. **What you clicked/did**
2. **What you expected**
3. **What actually happened**
4. **Console errors** (exact error message)
5. **Which browser** (Chrome/Firefox/Edge/Safari)

## Next Steps if Issues Found

Based on what's broken, we can:
1. Fix missing methods
2. Fix store initialization order
3. Fix event handler bindings
4. Fix template syntax errors
5. Add missing computed properties

---

**Current Status**: Translation fix applied ✅  
**Ready for**: Browser testing  
**Expected**: Most UI should work, may need minor fixes
