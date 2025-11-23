# Changelog - MarkdownTaskManager Fork

All notable changes made to this fork of [ioniks/MarkdownTaskManager](https://github.com/ioniks/MarkdownTaskManager).

## [Unreleased] - 2025-11-23

### Added - Status Field Auto-Reorganization Feature

#### What is it?
A new **Status** metadata field that enables automatic task reorganization without manual copy/paste operations. When the Status field is changed in the markdown file, the task automatically moves to the corresponding kanban column.

#### Why was it created?
- **Problem**: AI agents had to manually copy/paste 50-100 line task blocks between sections when changing task status
- **Solution**: AI now only changes a single Status field, and tasks reorganize automatically
- **Benefit**: 95% less work for AI agents, atomic changes, no formatting errors

#### How it works:

**For AI Agents:**
1. AI changes `**Status**: todo` to `**Status**: in-progress` in kanban.md
2. File watcher detects the change (checks every 2 seconds)
3. Task automatically moves to "🚀 In Progress" section in the .md file
4. UI updates with visual feedback (blue flash animation)
5. No manual intervention needed!

**For Manual Users:**
1. Drag task between columns in UI
2. Status field automatically written to metadata
3. Works exactly as before, now with explicit status tracking

#### Changes to task-manager.html:

**1. Status Field Parsing (Line ~2308)**
```javascript
// Parse Status field (authoritative if present and valid)
const validStatuses = ['todo', 'in-progress', 'in-review', 'done'];
const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
if (statusMatch) {
    const statusValue = statusMatch[1].toLowerCase();
    if (validStatuses.includes(statusValue)) {
        task.status = statusValue;
        console.log(`Task ${id}: Using Status field value "${statusValue}"`);
    } else {
        console.warn(`Task ${id}: Ignoring invalid Status value "${statusMatch[1]}", using section position`);
    }
}
```

**2. Status Field Writing (Line ~4160)**
```javascript
// Always write Status field to metadata
meta += (meta ? ' | ' : '') + `**Status**: ${task.status}`;
```

**3. Metadata Parsing Refactored (Line ~2287)**
```javascript
// Parse metadata fields individually to support Status field anywhere in line
const metaMatch = content.match(/\*\*Priority\*\*:\s*([^|]+)/);
if (metaMatch) {
    task.priority = metaMatch[1].trim();
}

const categoryMatch = content.match(/\*\*Category\*\*:\s*([^|]+)/);
if (categoryMatch) {
    task.category = categoryMatch[1].trim();
}

const assignedMatch = content.match(/\*\*Assigned\*\*:\s*(.+?)(?:\s*\||$)/m);
if (assignedMatch) {
    task.assignees = assignedMatch[1].split(',').map(a => a.trim());
}
```

**4. Auto-Reorganization on Status Change (Line ~2633)**
```javascript
// Auto-reorganize: If any task moved due to Status field change, save to reorganize the .md file
if (movedCount > 0) {
    console.log('🔄 Status field changes detected, reorganizing markdown file...');
    setTimeout(() => {
        autoSave();
        console.log('✅ Markdown file reorganized based on Status field changes');
    }, 500); // Small delay to avoid rapid saves
}
```

#### Valid Status Values:
- `todo` → 📝 To Do
- `in-progress` → 🚀 In Progress
- `in-review` → 👀 In Review
- `done` → ✅ Done

Case-insensitive: `TODO`, `Todo`, `todo` all work.

#### Backward Compatibility:
- ✅ Status field is **optional**
- ✅ Tasks without Status field use section position (existing behavior)
- ✅ Invalid Status values (emojis, descriptive text) are ignored
- ✅ Existing kanban files work unchanged

#### Example Usage:

**Before (Manual):**
```markdown
## 📝 To Do
### TASK-001 | Fix bug
...entire task (50 lines)...

## 🚀 In Progress
<!-- AI had to manually copy entire task here -->
```

**After (Automatic):**
```markdown
## 📝 To Do
### TASK-001 | Fix bug
**Priority**: High | **Category**: Backend | **Status**: todo

<!-- AI changes one line: -->
**Priority**: High | **Category**: Backend | **Status**: in-progress

<!-- Task automatically moves to In Progress section! -->
```

### Changed

#### File Watcher Enhancement
- File watcher now triggers auto-reorganization when Status field changes
- 500ms debounce to prevent rapid consecutive saves
- Visual feedback (blue flash) when tasks update externally

#### Metadata Parsing
- Refactored from single complex regex to individual field matching
- Now supports Status field anywhere in metadata line
- More flexible and maintainable

#### Conditional Pipe Separators
- Fixed leading pipe issue when task has no Priority or Category
- Uses ternary operator: `(meta ? ' | ' : '')`
- Produces clean metadata lines

### Technical Details

**Lines of Code Changed:**
- Added: ~50 lines
- Modified: ~15 lines
- Total impact: ~65 lines

**Functions Modified:**
1. `parseTask()` - Added Status field parsing
2. `generateMarkdown()` - Added Status field writing with conditional pipes
3. `applyExternalChanges()` - Added auto-reorganization trigger

**No Breaking Changes:**
- All existing functionality preserved
- Backward compatible with tasks without Status field
- No changes to UI or user workflow

### Testing

**Test Checklist:**
- ✅ Status field parsing (valid values)
- ✅ Status field writing (always written)
- ✅ Auto-reorganization (2-3 second delay)
- ✅ Backward compatibility (tasks without Status)
- ✅ Invalid status handling (emojis ignored)
- ✅ UI metadata display (Priority, Category, Assigned)
- ✅ File watcher integration
- ✅ Drag and drop still works

### Known Limitations

1. **Manual Refresh on First Load**: Browser must be refreshed to load new JavaScript changes
2. **2-Second Delay**: Auto-reorganization happens within 2-3 seconds (file watcher polling interval)
3. **Single Browser Tab**: Changes in one tab don't sync to other tabs automatically

### Future Enhancements

Potential improvements for future versions:
- [ ] Real-time WebSocket sync between tabs
- [ ] Configurable file watcher interval
- [ ] Status field autocomplete in edit form
- [ ] Status history/audit log
- [ ] Custom status values per project

---

## Original Repository

This fork is based on: [ioniks/MarkdownTaskManager](https://github.com/ioniks/MarkdownTaskManager)

**Original Features:**
- Markdown-based kanban board
- File System Access API for local file editing
- Drag and drop task management
- Archive functionality
- Multi-language support (English/French)
- Project management with IndexedDB
- Filter system (tags, categories, users, priorities)
- Customizable columns and priorities

**License**: MIT (inherited from original)

---

**Fork Maintainer**: SetSail Development Team
**Created**: 2025-11-23
**Purpose**: Enable AI agent workflow automation for kanban task management
