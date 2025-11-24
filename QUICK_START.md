# Quick Start Guide - Status Field Feature

## For AI Agents

### Old Way (Manual Task Moving)
```markdown
# Before - Task in To Do section
## 📝 To Do

### TASK-123 | Fix login bug
**Priority**: High | **Category**: Backend
...entire task content...

# After - Copy entire task to In Progress section
## 🚀 In Progress

### TASK-123 | Fix login bug
**Priority**: High | **Category**: Backend
...entire task content...  (50+ lines copied!)
```

### New Way (Status Field)
```markdown
# Just change this one field:
**Status**: todo  →  **Status**: in-progress

# That's it! The HTML will reorganize automatically.
```

## For You (Manual Testing)

### Test the Feature Now

1. **Open task-manager.html**
   ```bash
   cd /Users/gr/Documents/DevOps/MarkdownTaskManager
   open task-manager.html
   ```

2. **Load your kanban**
   - Click "Open Folder"
   - Select `/Users/gr/Documents/DevOps/SetSail/docs/todo/api/`

3. **Find TASK-128**
   - Should be in "📝 To Do" section
   - Has `**Status**: todo` in metadata

4. **Change the Status**
   - Open `docs/todo/api/kanban.md` in any text editor
   - Find TASK-128
   - Change `**Status**: todo` to `**Status**: in-progress`
   - Save the file

5. **Refresh Browser**
   - Press F5 or Cmd+R in task-manager.html
   - TASK-128 should now be in "🚀 In Progress" section!
   - Console should show: `Task TASK-128: Using Status field value "in-progress"`

6. **Verify it moved**
   - Look at the kanban.md file again
   - TASK-128 should now be physically under the "## 🚀 In Progress" heading

## Valid Status Values

Change `**Status**:` to one of these:
- `todo` - Moves to 📝 To Do
- `in-progress` - Moves to 🚀 In Progress
- `in-review` - Moves to 👀 In Review
- `done` - Moves to ✅ Done

**Case doesn't matter**: `TODO`, `Todo`, `todo` all work

## Troubleshooting

### Task Didn't Move
**Check**:
1. Did you refresh the browser? (Required after editing kanban.md)
2. Is the Status value valid? (`todo`, `in-progress`, `in-review`, `done`)
3. Check browser console for warnings (F12 → Console tab)

### Invalid Status Warning
If you see:
```
Task TASK-XXX: Ignoring invalid Status value "🟡", using section position
```

**Fix**: Use a valid keyword:
- ❌ `**Status**: 🟡 In Progress` 
- ✅ `**Status**: in-progress`

## AI Workflow Example

```bash
# AI receives instruction: "Move TASK-123 to in progress"

# AI does this (ONE EDIT):
sed -i 's/\*\*Status\*\*: todo/\*\*Status\*\*: in-progress/' kanban.md

# NOT this (50+ line copy/paste):
# ... copy entire task block ...
# ... delete from old section ...
# ... paste into new section ...
# ... hope formatting didn't break ...

# Result: Task automatically moves to correct section on next browser refresh
```

## Next Step: Try It!

```bash
cd /Users/gr/Documents/DevOps/SetSail/docs/todo/api
# Edit kanban.md and change TASK-128 Status field
# Then refresh task-manager.html in browser
```

**Success Indicator**: TASK-128 appears in "🚀 In Progress" section ✅
