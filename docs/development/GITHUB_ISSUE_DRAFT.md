# Feature Request: Auto-Reorganize Tasks by Status Field

## Summary

Add optional **Status field** support to MarkdownTaskManager with automatic section reorganization. This makes the tool automation-friendly while remaining 100% backward compatible.

## The Problem

**Current behavior:**
- Task status is determined by section location (To Do, In Progress, Done)
- Moving tasks requires manual drag/drop or cut/paste
- For automated workflows (AI agents, scripts), this means complex text manipulation

**Use case:**
AI agent needs to mark task as "in-progress":
- Currently: Must copy 50-100 line task block from "To Do" section to "In Progress" section
- Desired: Just change one field `**Status**: in-progress` and file reorganizes automatically

## Proposed Solution

Add **Status field** as optional metadata that becomes authoritative when present.

### Example Task Format

```markdown
### TASK-001 | Fix authentication bug

**Priority**: High | **Category**: Backend | **Status**: in-progress
**Created**: 2025-11-23 | **Started**: 2025-11-23
**Tags**: #bug #auth

Description here.
```

### How It Works

1. User/AI edits kanban.md and changes `**Status**: in-progress`
2. task-manager.html detects file change (existing file watcher)
3. JavaScript automatically reorganizes task to "🚀 In Progress" section
4. File is saved with task in correct section
5. No manual movement needed ✅

## Implementation

### Code Changes Required

**1. Parse Status field** (~5 lines)
```javascript
// In parseTask() function
const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
if (statusMatch) {
    task.status = statusMatch[1].toLowerCase();
}
```

**2. Auto-reorganize function** (~25 lines)
```javascript
async function autoReorganizeByStatus() {
    let needsReorganization = false;
    
    tasks.forEach(task => {
        const statusMatch = (task.fullText || '').match(/\*\*Status\*\*:\s*(\S+)/i);
        if (statusMatch && statusMatch[1].toLowerCase() !== task.status) {
            task.status = statusMatch[1].toLowerCase();
            needsReorganization = true;
        }
    });
    
    if (needsReorganization && kanbanFileHandle) {
        const reorganized = generateMarkdown();
        // Save to file...
    }
}
```

**3. Call on file change** (~1 line)
```javascript
// At end of applyExternalChanges()
autoReorganizeByStatus();
```

**Total: ~30 lines of code**

## Benefits

✅ **Backward compatible** - Status field is optional, existing workflows unchanged  
✅ **No breaking changes** - Drag/drop still works exactly as before  
✅ **Enables automation** - AI agents, scripts, CI/CD integrations  
✅ **Pure JavaScript** - No external dependencies, works everywhere  
✅ **Automatic** - Reorganizes on file change via existing file watcher  

## Use Cases

### AI Agent Workflow
- AI changes Status field in markdown
- task-manager.html auto-reorganizes
- AI never needs to manually move task blocks

### CI/CD Integration
- Script updates task Status in git repo
- Team members see reorganized tasks automatically
- No manual kanban maintenance

### Manual Users
- Optional feature (can ignore Status field entirely)
- Drag/drop still works as before
- Can use Status field if preferred

## Backward Compatibility

- ✅ Existing kanban.md files work unchanged
- ✅ Tasks without Status field follow section location
- ✅ Drag/drop behavior unchanged
- ✅ Zero breaking changes

## Proof of Concept

We have working code demonstrating this feature:
- Tested with production kanban files
- Validated backward compatibility
- Ready to contribute implementation

## Implementation Approach

Happy to:
1. Fork repository
2. Implement feature in feature branch
3. Write tests
4. Update documentation
5. Submit PR for review

Or if preferred:
- Share detailed implementation guide
- Let maintainer implement
- Provide testing and feedback

## Questions

1. Does this align with MarkdownTaskManager's vision?
2. Any concerns about the approach?
3. Prefer full implementation or detailed spec first?

Looking forward to your feedback!

---

**References:**
- Detailed implementation guide available
- Code examples prepared
- Test plan ready
