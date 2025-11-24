// File watcher module
// Handles auto-save and external change detection

// Debounce timer for auto-save
let autoSaveTimer = null;

// Track when we last saved (to ignore our own changes)
let lastSaveTimestamp = 0;

// Flag to prevent saving during external updates
let isApplyingExternalChanges = false;

// File watcher interval
let fileWatcherInterval = null;
let lastCheckedModified = 0;

// Current content for comparison
let currentKanbanContent = "";

// Actual save function (called by debounced autoSave)
async function performSave(fileHandle, content) {
  if (!fileHandle) return;

  try {
    // Mark that we're saving (for dev server reload detection)
    sessionStorage.setItem("justSaved", Date.now().toString());

    const writable = await fileHandle.createWritable();

    await writable.write(content);

    await writable.close();

    currentKanbanContent = content;

    // Update last save timestamp to ignore this change in file watcher
    lastSaveTimestamp = Date.now();

    // Clear the flag after a short delay
    setTimeout(() => {
      sessionStorage.removeItem("justSaved");
    }, 500);

    return true;
  } catch (error) {
    console.error("❌ Save failed:", error);
    sessionStorage.removeItem("justSaved");
    return false;
  }
}

// Debounced auto-save function
// Waits 500ms after last change before actually saving
function autoSave(fileHandle, generateContent) {
  if (!fileHandle) return;

  // Don't save while applying external changes
  if (isApplyingExternalChanges) {
    return;
  }

  // Clear any existing timer
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  } else {
    console.log("🔵 AutoSave scheduled...");
  }

  // Schedule save for 500ms from now
  autoSaveTimer = setTimeout(async () => {
    autoSaveTimer = null;
    const content = generateContent();
    await performSave(fileHandle, content);
  }, 500);
}

// Smart update function that only modifies changed tasks
function applyExternalChanges(oldTasks, newTasks, callbacks) {
  // Create maps for quick lookup
  const oldTasksMap = new Map(oldTasks.map((t) => [t.id, t]));
  const newTasksMap = new Map(newTasks.map((t) => [t.id, t]));

  let addedCount = 0;
  let removedCount = 0;
  let movedCount = 0;
  let updatedCount = 0;

  // Find tasks that were removed (in old but not in new)
  for (const oldTask of oldTasks) {
    if (!newTasksMap.has(oldTask.id)) {
      if (callbacks.onTaskRemoved) {
        callbacks.onTaskRemoved(oldTask);
      }
      removedCount++;
    }
  }

  // Find tasks that were added or modified (in new)
  for (const newTask of newTasks) {
    const oldTask = oldTasksMap.get(newTask.id);

    if (!oldTask) {
      // Task was added
      if (callbacks.onTaskAdded) {
        callbacks.onTaskAdded(newTask);
      }
      addedCount++;
    } else {
      // Task exists, check if it changed
      const statusChanged = oldTask.status !== newTask.status;
      const contentChanged =
        JSON.stringify(oldTask) !== JSON.stringify(newTask);

      if (statusChanged) {
        if (callbacks.onTaskMoved) {
          callbacks.onTaskMoved(newTask, oldTask.status);
        }
        movedCount++;
      } else if (contentChanged) {
        if (callbacks.onTaskUpdated) {
          callbacks.onTaskUpdated(newTask);
        }
        updatedCount++;
      }
    }
  }

  // Auto-reorganize: If any task moved due to Status field change, save to reorganize the .md file
  if (movedCount > 0 && callbacks.onReorganizeNeeded) {
    setTimeout(() => {
      callbacks.onReorganizeNeeded();
    }, 500); // Small delay to avoid rapid saves
  }

  return { addedCount, removedCount, movedCount, updatedCount };
}

// Check for external changes to the file
async function checkForExternalChanges(fileHandle, callbacks) {
  if (!fileHandle) return;

  try {
    // Get the current file
    const file = await fileHandle.getFile();
    const fileModified = file.lastModified;

    // Initialize on first check
    if (lastCheckedModified === 0) {
      lastCheckedModified = fileModified;
      return;
    }

    // Check if file was modified since last check
    if (fileModified > lastCheckedModified) {
      // File was modified! But was it us or external?
      const timeSinceOurSave = Date.now() - lastSaveTimestamp;

      // If we saved within the last 2 seconds, ignore (it's our change)
      if (timeSinceOurSave < 2000) {
        lastCheckedModified = fileModified;
        return;
      }

      // External change detected!
      const newContent = await file.text();

      // Check if content actually changed
      if (newContent !== currentKanbanContent) {
        console.log("📥 Loading external changes...");

        // Set flag to prevent saving during updates
        isApplyingExternalChanges = true;

        try {
          currentKanbanContent = newContent;

          if (callbacks.onExternalChange) {
            callbacks.onExternalChange(newContent);
          }
        } finally {
          // Clear flag after updates complete
          isApplyingExternalChanges = false;
        }
      }

      lastCheckedModified = fileModified;
    }
  } catch (error) {
    console.error("❌ Error checking for file changes:", error);
  }
}

// Start file watcher
function startFileWatcher(fileHandle, callbacks) {
  if (fileWatcherInterval) return; // Already running

  console.log("👁️ Starting file watcher (checking every 2 seconds)...");
  fileWatcherInterval = setInterval(() => {
    checkForExternalChanges(fileHandle, callbacks);
  }, 2000);
}

// Stop file watcher
function stopFileWatcher() {
  if (fileWatcherInterval) {
    clearInterval(fileWatcherInterval);
    fileWatcherInterval = null;
  }
}

// Set current content (for comparison)
function setCurrentContent(content) {
  currentKanbanContent = content;
}

// Get current content
function getCurrentContent() {
  return currentKanbanContent;
}

// Check if currently applying external changes
function isApplyingChanges() {
  return isApplyingExternalChanges;
}

// Export for use in other modules
export const fileWatcher = {
  performSave,
  autoSave,
  applyExternalChanges,
  startFileWatcher,
  stopFileWatcher,
  setCurrentContent,
  getCurrentContent,
  isApplyingChanges,
};

export {
  performSave,
  autoSave,
  applyExternalChanges,
  startFileWatcher,
  stopFileWatcher,
  setCurrentContent,
  getCurrentContent,
  isApplyingChanges,
};
