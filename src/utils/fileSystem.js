// File System Access API module
// Handles all directory and file operations

// IndexedDB configuration for storing recent projects
const DB_NAME = "TaskManagerDB";
const DB_VERSION = 2;
const STORE_NAME = "settings";
const PROJECTS_KEY = "recentProjects";
const MAX_RECENT_PROJECTS = 10;

// File handles
let directoryHandle = null;
let kanbanFileHandle = null;
let archiveFileHandle = null;

// Open IndexedDB
async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Save directory handle to IndexedDB
async function saveDirectoryHandle(handle, customName = null) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Get existing projects
    const getRequest = store.get(PROJECTS_KEY);
    const projects = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    });

    // Get project name (directory name)
    const projectName = handle.name;

    // Check if project already exists
    const existingIndex = projects.findIndex((p) => p.name === projectName);

    // Ask for custom name for new projects if not provided
    const projectDisplayName = customName || projectName;

    if (existingIndex >= 0) {
      // Move existing project to top and update handle
      const project = projects.splice(existingIndex, 1)[0];
      project.handle = handle;
      project.lastAccessed = Date.now();
      projects.unshift(project);
    } else {
      // Add new project at the beginning
      projects.unshift({
        name: projectName,
        displayName: projectDisplayName,
        handle: handle,
        lastAccessed: Date.now(),
      });
    }

    // Keep only the most recent projects
    if (projects.length > MAX_RECENT_PROJECTS) {
      projects.length = MAX_RECENT_PROJECTS;
    }

    // Save back to IndexedDB
    const putRequest = store.put(projects, PROJECTS_KEY);
    await new Promise((resolve, reject) => {
      putRequest.onsuccess = resolve;
      putRequest.onerror = () => reject(putRequest.error);
    });

    console.log(`Project "${projectDisplayName}" saved to recent projects`);
  } catch (error) {
    console.error("Failed to save directory handle:", error);
  }
}

// Load recent projects from IndexedDB
async function loadRecentProjects() {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(PROJECTS_KEY);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Failed to load recent projects:", error);
    return [];
  }
}

// Load the most recent directory handle
async function loadDirectoryHandle() {
  try {
    const projects = await loadRecentProjects();
    // Return the most recent project (first in list)
    return projects.length > 0 ? projects[0].handle : null;
  } catch (error) {
    console.error("Failed to load directory handle:", error);
    return null;
  }
}

// Verify permission for a file handle
async function verifyPermission(handle) {
  const options = { mode: "readwrite" };
  if ((await handle.queryPermission(options)) === "granted") {
    return true;
  }
  if ((await handle.requestPermission(options)) === "granted") {
    return true;
  }
  return false;
}

// Request directory access from user
async function requestDirectoryAccess(startInHandle = null) {
  try {
    const options = {};
    if (startInHandle) {
      options.startIn = startInHandle;
    }

    const handle = await window.showDirectoryPicker(options);
    return handle;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error("Error requesting directory access:", error);
      throw error;
    }
    return null;
  }
}

// Load kanban.md file
async function loadKanbanFile(dirHandle) {
  try {
    kanbanFileHandle = await dirHandle.getFileHandle("kanban.md");
    const file = await kanbanFileHandle.getFile();
    const content = await file.text();

    console.log("Kanban file loaded, size:", content.length);
    return { fileHandle: kanbanFileHandle, content };
  } catch (error) {
    if (error.name === "NotFoundError") {
      console.log("kanban.md not found, will create it");
      // Create initial kanban.md
      const initialContent = `# Kanban Board

<!-- Config: Last Task ID: 0 -->

## ⚙️ Configuration

**Columns**:
- **To Do** (todo)
- **In Progress** (in-progress)
- **Done** (done)

**Categories**: Frontend, Backend, Design, Documentation
**Users**: @alice, @bob, @charlie
**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low
**Tags**: #bug, #feature, #enhancement, #documentation

## 📝 To Do

## 🚧 In Progress

## ✅ Done
`;
      kanbanFileHandle = await dirHandle.getFileHandle("kanban.md", {
        create: true,
      });
      await saveToFile(kanbanFileHandle, initialContent);
      return { fileHandle: kanbanFileHandle, content: initialContent };
    }
    throw error;
  }
}

// Load archive.md file
async function loadArchiveFile(dirHandle) {
  try {
    archiveFileHandle = await dirHandle.getFileHandle("archive.md");
    const file = await archiveFileHandle.getFile();
    const content = await file.text();

    console.log("Archive file loaded");
    return { fileHandle: archiveFileHandle, content };
  } catch (error) {
    if (error.name === "NotFoundError") {
      console.log("archive.md not found, will create it");
      // Create initial archive.md
      const initialContent = `# Task Archive

> Archived tasks

## ✅ Archives
`;
      archiveFileHandle = await dirHandle.getFileHandle("archive.md", {
        create: true,
      });
      await saveToFile(archiveFileHandle, initialContent);
      return { fileHandle: archiveFileHandle, content: initialContent };
    }
    throw error;
  }
}

// Save content to a file
async function saveToFile(fileHandle, content) {
  try {
    // Request permission if needed
    if (!(await verifyPermission(fileHandle))) {
      throw new Error("Permission denied");
    }

    const writable = await fileHandle.createWritable();
    await writable.write(content);
    await writable.close();

    console.log("File saved successfully");
    return true;
  } catch (error) {
    console.error("Error saving file:", error);
    throw error;
  }
}

// Save kanban file
async function saveKanbanFile(content) {
  if (!kanbanFileHandle) {
    throw new Error("No kanban file handle available");
  }
  return await saveToFile(kanbanFileHandle, content);
}

// Save archive file
async function saveArchiveFile(content) {
  if (!archiveFileHandle) {
    throw new Error("No archive file handle available");
  }
  return await saveToFile(archiveFileHandle, content);
}

// Delete a project from recent projects
async function deleteProjectFromRecents(projectIndex) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(PROJECTS_KEY);
    const projects = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (projectIndex >= 0 && projectIndex < projects.length) {
      projects.splice(projectIndex, 1);

      const putRequest = store.put(projects, PROJECTS_KEY);
      await new Promise((resolve, reject) => {
        putRequest.onsuccess = resolve;
        putRequest.onerror = () => reject(putRequest.error);
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to delete project:", error);
    return false;
  }
}

// Rename a project in recent projects
async function renameProject(projectIndex, newName) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(PROJECTS_KEY);
    const projects = await new Promise((resolve, reject) => {
      getRequest.onsuccess = () => resolve(getRequest.result || []);
      getRequest.onerror = () => reject(getRequest.error);
    });

    if (projectIndex >= 0 && projectIndex < projects.length) {
      projects[projectIndex].displayName = newName;

      const putRequest = store.put(projects, PROJECTS_KEY);
      await new Promise((resolve, reject) => {
        putRequest.onsuccess = resolve;
        putRequest.onerror = () => reject(putRequest.error);
      });

      return true;
    }
    return false;
  } catch (error) {
    console.error("Failed to rename project:", error);
    return false;
  }
}

// Export for use in other modules
export const fileSystem = {
  // Getters for handles
  getDirectoryHandle: () => directoryHandle,
  setDirectoryHandle: (handle) => {
    directoryHandle = handle;
  },
  getKanbanFileHandle: () => kanbanFileHandle,
  getArchiveFileHandle: () => archiveFileHandle,

  // Main functions
  requestDirectoryAccess,
  verifyPermission,
  saveDirectoryHandle,
  loadDirectoryHandle,
  loadRecentProjects,
  loadKanbanFile,
  loadArchiveFile,
  saveKanbanFile,
  saveArchiveFile,
  deleteProjectFromRecents,
  renameProject,
};

export {
  requestDirectoryAccess,
  verifyPermission,
  saveDirectoryHandle,
  loadDirectoryHandle,
  loadRecentProjects,
  loadKanbanFile,
  loadArchiveFile,
  saveKanbanFile,
  saveArchiveFile,
  deleteProjectFromRecents,
  renameProject,
};
