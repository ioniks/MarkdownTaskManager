import { useState, useEffect, useCallback } from "react";
import { translationSystem } from "./utils/translations";
import { fileSystem } from "./utils/fileSystem";
import { markdownParser } from "./utils/markdown";
import { fileWatcher } from "./utils/fileWatcher";

function App() {
  // Language state
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Main data state
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [kanbanFileHandle, setKanbanFileHandle] = useState(null);
  const [archiveFileHandle, setArchiveFileHandle] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [config, setConfig] = useState({
    lastTaskId: 0,
    columns: [
      { name: "📝 To Do", id: "todo" },
      { name: "🚀 In Progress", id: "in-progress" },
      { name: "👀 In Review", id: "in-review" },
      { name: "✅ Done", id: "done" },
    ],
    categories: [],
    users: [],
    priorities: [],
    tags: [],
  });

  // UI state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTaskFormModal, setShowTaskFormModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [currentDetailTask, setCurrentDetailTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Project management
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [recentProjects, setRecentProjects] = useState([]);

  // Filter state
  const [activeFilters, setActiveFilters] = useState([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [archiveSearchTerm, setArchiveSearchTerm] = useState("");

  // Notification state
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Form state
  const [taskForm, setTaskForm] = useState({
    title: "",
    status: "todo",
    priority: "",
    category: "",
    assignees: [],
    tags: [],
    created: "",
    started: "",
    due: "",
    completed: "",
    description: "",
    subtasks: [],
    notes: "",
  });
  const [formSubtasks, setFormSubtasks] = useState([]);
  const [taskFormAssigneesInput, setTaskFormAssigneesInput] = useState("");
  const [taskFormTagsInput, setTaskFormTagsInput] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");
  const [newSubtaskInput, setNewSubtaskInput] = useState("");

  // Drag state
  const [draggedTask, setDraggedTask] = useState(null);

  // Translation helper
  const t = (key, params) => translationSystem.t(key, params);

  // Initialize
  useEffect(() => {
    translationSystem.initLanguage();
    setCurrentLanguage(translationSystem.getCurrentLanguage());
    loadRecentProjects();
    tryRestorePreviousDirectory();

    // Setup keyboard shortcuts
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (showTaskModal) closeTaskDetail();
        if (showTaskFormModal) closeTaskForm();
        if (showArchiveModal) setShowArchiveModal(false);
        if (showColumnsModal) setShowColumnsModal(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault();
        openTaskForm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load recent projects
  const loadRecentProjects = async () => {
    const projects = await fileSystem.loadRecentProjects();
    setRecentProjects(projects);
    setShowProjectSelector(projects.length > 0);
  };

  // Try to restore previous directory
  const tryRestorePreviousDirectory = async () => {
    const lastSelectedProjectName = localStorage.getItem("lastSelectedProject");
    const projects = await fileSystem.loadRecentProjects();
    let projectToRestore = null;

    if (lastSelectedProjectName) {
      projectToRestore = projects.find(
        (p) => p.name === lastSelectedProjectName,
      );
    }

    if (!projectToRestore && projects.length > 0) {
      projectToRestore = projects[0];
    }

    if (projectToRestore) {
      try {
        if (await fileSystem.verifyPermission(projectToRestore.handle)) {
          await loadFile(projectToRestore.handle);
          localStorage.setItem("lastSelectedProject", projectToRestore.name);
          showNotification(t("notif.projectRestored"), "success");
          return true;
        }
      } catch (error) {
        console.error("Could not restore previous directory:", error);
      }
    }

    return false;
  };

  // Select folder
  const selectFolder = async () => {
    try {
      const handle = await fileSystem.requestDirectoryAccess(directoryHandle);
      if (!handle) return;

      await fileSystem.saveDirectoryHandle(handle);
      localStorage.setItem("lastSelectedProject", handle.name);

      await loadFile(handle);
      updateAvailableFilters();

      showNotification(t("notif.folderLoaded"), "success");
    } catch (error) {
      if (error.name !== "AbortError") {
        showNotification(t("notif.folderError"), "error");
        console.error(error);
      }
    }
  };

  // Load file
  const loadFile = async (dirHandle) => {
    try {
      setDirectoryHandle(dirHandle);

      // Load kanban.md
      const kanbanResult = await fileSystem.loadKanbanFile(dirHandle);
      setKanbanFileHandle(kanbanResult.fileHandle);

      // Parse content
      const parsed = markdownParser.parseMarkdown(kanbanResult.content);
      setTasks(parsed.tasks);
      setConfig(parsed.config);

      // Set current content for file watcher
      fileWatcher.setCurrentContent(kanbanResult.content);

      // Load archive.md
      const archiveResult = await fileSystem.loadArchiveFile(dirHandle);
      setArchiveFileHandle(archiveResult.fileHandle);
      setArchivedTasks(markdownParser.parseArchive(archiveResult.content));

      // Start file watcher
      startWatching(kanbanResult.fileHandle);

      return true;
    } catch (error) {
      console.error("Error loading files:", error);
      return false;
    }
  };

  // Start file watching
  const startWatching = (fileHandle) => {
    fileWatcher.startFileWatcher(fileHandle, {
      onExternalChange: (newContent) => {
        const parsed = markdownParser.parseMarkdown(newContent);
        setTasks(parsed.tasks);
        setConfig(parsed.config);
        showNotification("File updated from external source", "info");
      },
    });
  };

  // Save file
  const saveFile = useCallback(() => {
    if (!kanbanFileHandle) return false;

    fileWatcher.autoSave(kanbanFileHandle, () => {
      return markdownParser.generateMarkdown(tasks, config);
    });
    return true;
  }, [kanbanFileHandle, tasks, config]);

  // Save archive
  const saveArchive = useCallback(() => {
    if (!archiveFileHandle) return false;

    const content = markdownParser.generateArchiveMarkdown(archivedTasks);
    fileWatcher.performSave(archiveFileHandle, content);
    return true;
  }, [archiveFileHandle, archivedTasks]);

  // Show notification
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  // Create task
  const createTask = () => {
    openTaskForm();
  };

  // Add task
  const addTask = (taskData) => {
    const newConfig = { ...config, lastTaskId: config.lastTaskId + 1 };
    const taskId = "TASK-" + String(newConfig.lastTaskId).padStart(3, "0");

    const newTask = {
      id: taskId,
      title: taskData.title || "",
      status: taskData.status || "todo",
      priority: taskData.priority || "",
      category: taskData.category || "",
      assignees: taskData.assignees || [],
      tags: taskData.tags || [],
      created: taskData.created || new Date().toISOString().split("T")[0],
      started: taskData.started || "",
      due: taskData.due || "",
      completed: taskData.completed || "",
      description: taskData.description || "",
      subtasks: taskData.subtasks || [],
      notes: taskData.notes || "",
    };

    setTasks((prev) => [...prev, newTask]);
    setConfig(newConfig);

    // Save will happen in useEffect
    setTimeout(() => saveFile(), 0);

    return newTask;
  };

  // Update task
  const updateTask = (taskId, updates) => {
    setTasks((prev) => {
      const taskIndex = prev.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return prev;

      const oldStatus = prev[taskIndex].status;
      const newTasks = [...prev];
      newTasks[taskIndex] = { ...newTasks[taskIndex], ...updates };

      // Save will happen after state update
      setTimeout(() => {
        if (oldStatus !== updates.status && updates.status) {
          markdownParser.scheduleStatusReorganization(newTasks, config, () =>
            saveFile(),
          );
        } else {
          saveFile();
        }
      }, 0);

      return newTasks;
    });
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks((prev) => {
      const newTasks = prev.filter((t) => t.id !== taskId);
      setTimeout(() => saveFile(), 0);
      return newTasks;
    });
  };

  // Archive task
  const archiveTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    setArchivedTasks((prev) => [...prev, { ...task, status: "archived" }]);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    setTimeout(() => {
      saveFile();
      saveArchive();
    }, 0);

    return true;
  };

  // Restore task
  const restoreTask = (taskId, targetStatus = "todo") => {
    const task = archivedTasks.find((t) => t.id === taskId);
    if (!task) return false;

    setTasks((prev) => [...prev, { ...task, status: targetStatus }]);
    setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));

    setTimeout(() => {
      saveFile();
      saveArchive();
    }, 0);

    return true;
  };

  // Delete archived task
  const deleteArchivedTask = (taskId) => {
    setArchivedTasks((prev) => {
      const newTasks = prev.filter((t) => t.id !== taskId);
      setTimeout(() => saveArchive(), 0);
      return newTasks;
    });
  };

  // Open task detail
  const showTaskDetail = (task) => {
    setCurrentDetailTask(task);
    setShowTaskModal(true);
  };

  // Close task detail
  const closeTaskDetail = () => {
    setShowTaskModal(false);
    setCurrentDetailTask(null);
  };

  // Open task form
  const openTaskForm = (task = null) => {
    if (task) {
      setIsEditMode(true);
      setEditingTaskId(task.id);

      const subtasksCopy =
        task.subtasks && Array.isArray(task.subtasks)
          ? task.subtasks.map((st) => ({
              completed: st.completed,
              text: st.text,
            }))
          : [];

      setTaskForm({
        title: task.title,
        status: task.status,
        priority: task.priority,
        category: task.category,
        assignees: [...(task.assignees || [])],
        tags: [...(task.tags || [])],
        created: task.created,
        started: task.started,
        due: task.due,
        completed: task.completed,
        description: task.description,
        subtasks: subtasksCopy,
        notes: task.notes,
      });

      setFormSubtasks(subtasksCopy);
      setTaskFormAssigneesInput(formatAssignees(task.assignees || []));
      setTaskFormTagsInput(formatTags(task.tags || []));
    } else {
      setIsEditMode(false);
      setEditingTaskId(null);
      resetTaskForm();
    }

    setShowTaskFormModal(true);
  };

  // Close task form
  const closeTaskForm = () => {
    setShowTaskFormModal(false);
    resetTaskForm();
  };

  // Reset task form
  const resetTaskForm = () => {
    setTaskForm({
      title: "",
      status: "todo",
      priority: "",
      category: "",
      assignees: [],
      tags: [],
      created: new Date().toISOString().split("T")[0],
      started: "",
      due: "",
      completed: "",
      description: "",
      subtasks: [],
      notes: "",
    });
    setFormSubtasks([]);
    setTaskFormAssigneesInput("");
    setTaskFormTagsInput("");
    setNewSubtaskText("");
  };

  // Submit task form
  const submitTaskForm = (e) => {
    e.preventDefault();

    if (!taskForm.title.trim()) {
      showNotification("Task title is required", "error");
      return;
    }

    const taskData = {
      ...taskForm,
      assignees: taskForm.assignees.filter((a) => a.trim()),
      tags: taskForm.tags.filter((t) => t.trim()),
      subtasks: formSubtasks,
    };

    if (isEditMode) {
      updateTask(editingTaskId, taskData);
      showNotification(t("notif.taskEdited", { id: editingTaskId }), "success");
    } else {
      const newTask = addTask(taskData);
      showNotification(t("notif.taskCreated", { id: newTask.id }), "success");
    }

    closeTaskForm();
  };

  // Archive current detail task
  const archiveCurrentTask = () => {
    if (!currentDetailTask) return;

    const confirmed = window.confirm(
      t("confirm.archiveTask", { title: currentDetailTask.title }),
    );

    if (confirmed) {
      archiveTask(currentDetailTask.id);
      closeTaskDetail();
      showNotification(t("notif.taskArchived"), "success");
    }
  };

  // Delete current detail task
  const deleteCurrentTask = () => {
    if (!currentDetailTask) return;

    const isArchived = currentDetailTask.status === "archived";
    const confirmKey = isArchived
      ? "confirm.deleteTaskFromArchive"
      : "confirm.deleteTask";

    const confirmed = window.confirm(
      t(confirmKey, { title: currentDetailTask.title }),
    );

    if (confirmed) {
      if (isArchived) {
        deleteArchivedTask(currentDetailTask.id);
      } else {
        deleteTask(currentDetailTask.id);
      }

      closeTaskDetail();
      showNotification(t("notif.taskDeleted"), "success");
    }
  };

  // Edit current detail task
  const editCurrentTask = () => {
    if (!currentDetailTask) return;
    closeTaskDetail();
    openTaskForm(currentDetailTask);
  };

  // Restore archived task
  const restoreArchivedTask = (taskId, targetStatus = "todo") => {
    restoreTask(taskId, targetStatus);
    showNotification(t("notif.taskRestored"), "success");
  };

  // Toggle subtask
  const toggleSubtask = (taskId, subtaskIndex) => {
    const task = getTaskById(taskId);
    if (!task || !task.subtasks[subtaskIndex]) return;

    const newSubtasks = [...task.subtasks];
    newSubtasks[subtaskIndex] = {
      ...newSubtasks[subtaskIndex],
      completed: !newSubtasks[subtaskIndex].completed,
    };

    if (archivedTasks.find((t) => t.id === taskId)) {
      setArchivedTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: newSubtasks } : t,
        );
        setTimeout(() => saveArchive(), 0);
        return newTasks;
      });
    } else {
      updateTask(taskId, { subtasks: newSubtasks });
    }

    // Update detail view if open
    if (currentDetailTask && currentDetailTask.id === taskId) {
      setCurrentDetailTask((prev) => ({ ...prev, subtasks: newSubtasks }));
    }
  };

  // Add subtask from detail view
  const addSubtask = (taskId) => {
    if (!newSubtaskInput || !newSubtaskInput.trim()) return;

    const task = getTaskById(taskId);
    if (!task) return;

    const newSubtasks = [
      ...(task.subtasks || []),
      {
        completed: false,
        text: newSubtaskInput.trim(),
      },
    ];

    if (archivedTasks.find((t) => t.id === taskId)) {
      setArchivedTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: newSubtasks } : t,
        );
        setTimeout(() => saveArchive(), 0);
        return newTasks;
      });
    } else {
      updateTask(taskId, { subtasks: newSubtasks });
    }

    setNewSubtaskInput("");

    // Update detail view if open
    if (currentDetailTask && currentDetailTask.id === taskId) {
      setCurrentDetailTask((prev) => ({ ...prev, subtasks: newSubtasks }));
    }
  };

  // Delete subtask from detail view
  const deleteSubtask = (taskId, subtaskIndex) => {
    const task = getTaskById(taskId);
    if (!task || !task.subtasks[subtaskIndex]) return;

    if (
      !window.confirm(
        t("confirm.deleteSubtask", { text: task.subtasks[subtaskIndex].text }),
      )
    ) {
      return;
    }

    const newSubtasks = task.subtasks.filter((_, idx) => idx !== subtaskIndex);

    if (archivedTasks.find((t) => t.id === taskId)) {
      setArchivedTasks((prev) => {
        const newTasks = prev.map((t) =>
          t.id === taskId ? { ...t, subtasks: newSubtasks } : t,
        );
        setTimeout(() => saveArchive(), 0);
        return newTasks;
      });
    } else {
      updateTask(taskId, { subtasks: newSubtasks });
    }

    // Update detail view if open
    if (currentDetailTask && currentDetailTask.id === taskId) {
      setCurrentDetailTask((prev) => ({ ...prev, subtasks: newSubtasks }));
    }
  };

  // Add subtask to form
  const addFormSubtask = () => {
    if (!newSubtaskText || !newSubtaskText.trim()) return;

    setFormSubtasks((prev) => [
      ...prev,
      {
        completed: false,
        text: newSubtaskText.trim(),
      },
    ]);
    setNewSubtaskText("");
  };

  // Remove subtask from form
  const removeFormSubtask = (index) => {
    setFormSubtasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Toggle subtask in form
  const toggleFormSubtask = (index) => {
    setFormSubtasks((prev) =>
      prev.map((st, idx) =>
        idx === index ? { ...st, completed: !st.completed } : st,
      ),
    );
  };

  // Get task by ID
  const getTaskById = (taskId) => {
    return (
      tasks.find((t) => t.id === taskId) ||
      archivedTasks.find((t) => t.id === taskId)
    );
  };

  // Parse assignees
  const parseAssignees = (assigneeString) => {
    if (!assigneeString) return [];
    return assigneeString
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);
  };

  // Parse tags
  const parseTags = (tagString) => {
    if (!tagString) return [];
    return tagString
      .split(/\s+/)
      .filter((tag) => tag.startsWith("#"))
      .map((tag) => tag.substring(1));
  };

  // Format assignees
  const formatAssignees = (assignees) => {
    return assignees.join(", ");
  };

  // Format tags
  const formatTags = (tags) => {
    return tags.map((tag) => "#" + tag).join(" ");
  };

  // Update task form assignees
  const updateTaskFormAssignees = () => {
    setTaskForm((prev) => ({
      ...prev,
      assignees: parseAssignees(taskFormAssigneesInput),
    }));
  };

  // Update task form tags
  const updateTaskFormTags = () => {
    setTaskForm((prev) => ({
      ...prev,
      tags: parseTags(taskFormTagsInput),
    }));
  };

  // Switch project
  const switchProject = async (projectIndex) => {
    const project = recentProjects[projectIndex];
    if (!project) return;

    try {
      if (await fileSystem.verifyPermission(project.handle)) {
        await loadFile(project.handle);
        localStorage.setItem("lastSelectedProject", project.name);
        showNotification(
          t("notif.projectLoaded", {
            name: project.displayName || project.name,
          }),
          "success",
        );
      } else {
        showNotification(t("notif.permissionDenied"), "error");
      }
    } catch (error) {
      console.error("Error switching project:", error);
      showNotification(t("notif.projectError"), "error");
    }
  };

  // Rename current project
  const renameCurrentProject = async () => {
    const currentProject = recentProjects.find(
      (p) => p.handle === directoryHandle,
    );
    if (!currentProject) return;

    const newName = window.prompt(
      t("prompt.renameProject"),
      currentProject.displayName || currentProject.name,
    );

    if (newName && newName.trim()) {
      const projectIndex = recentProjects.indexOf(currentProject);
      if (await fileSystem.renameProject(projectIndex, newName.trim())) {
        showNotification(t("notif.projectRenamed"), "success");
        await loadRecentProjects();
      }
    }
  };

  // Delete current project
  const deleteCurrentProject = async () => {
    const currentProject = recentProjects.find(
      (p) => p.handle === directoryHandle,
    );
    if (!currentProject) return;

    const confirmed = window.confirm(
      t("confirm.deleteProject", {
        name: currentProject.displayName || currentProject.name,
      }),
    );

    if (confirmed) {
      const projectIndex = recentProjects.indexOf(currentProject);
      if (await fileSystem.deleteProjectFromRecents(projectIndex)) {
        showNotification(t("notif.projectDeleted"), "success");
        setDirectoryHandle(null);
        localStorage.removeItem("lastSelectedProject");
        await loadRecentProjects();
      }
    }
  };

  // Get current project index
  const getCurrentProjectIndex = () => {
    if (!directoryHandle) return "";
    const currentProjectName = directoryHandle.name;
    const index = recentProjects.findIndex(
      (p) => p.name === currentProjectName,
    );
    return index >= 0 ? index : "";
  };

  // Add column
  const addColumn = () => {
    const name = window.prompt(t("prompt.columnName"));
    if (!name || !name.trim()) return;

    const id = window.prompt(t("prompt.columnId"));
    if (!id || !id.trim()) return;

    setConfig((prev) => ({
      ...prev,
      columns: [...prev.columns, { name: name.trim(), id: id.trim() }],
    }));

    setTimeout(() => saveFile(), 0);
  };

  // Remove column
  const removeColumn = (columnId) => {
    const confirmed = window.confirm(t("confirm.deleteColumn"));
    if (!confirmed) return;

    // Move tasks from this column to first column
    const firstColumnId = config.columns[0]?.id || "todo";
    setTasks((prev) =>
      prev.map((task) =>
        task.status === columnId ? { ...task, status: firstColumnId } : task,
      ),
    );

    setConfig((prev) => ({
      ...prev,
      columns: prev.columns.filter((c) => c.id !== columnId),
    }));

    setTimeout(() => saveFile(), 0);
  };

  // Drag handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("dragging");
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    updateTask(draggedTask.id, { status: columnId });
    showNotification(t("notif.taskMoved"), "info");
    setDraggedTask(null);
  };

  // Filter management
  const updateAvailableFilters = () => {
    // This will be computed from tasks
  };

  const addFilter = (type, value) => {
    if (!value || !value.trim()) return;

    const exists = activeFilters.some(
      (f) => f.type === type && f.value === value,
    );
    if (!exists) {
      setActiveFilters((prev) => [...prev, { type, value }]);
    }
  };

  const removeFilter = (type, value) => {
    setActiveFilters((prev) =>
      prev.filter((f) => !(f.type === type && f.value === value)),
    );
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setGlobalSearchTerm("");
  };

  // Get filtered tasks
  const getFilteredTasks = (taskList) => {
    let filtered = [...taskList];

    // Apply active filters
    activeFilters.forEach((filter) => {
      filtered = filtered.filter((task) => {
        switch (filter.type) {
          case "tag":
            return task.tags.some(
              (tag) => tag.replace("#", "") === filter.value,
            );
          case "category":
            return task.category === filter.value;
          case "user":
            return task.assignees.includes(filter.value);
          case "priority":
            return task.priority === filter.value;
          default:
            return true;
        }
      });
    });

    // Apply global search
    if (globalSearchTerm) {
      const searchLower = globalSearchTerm.toLowerCase();
      filtered = filtered.filter((task) => {
        return (
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower) ||
          task.notes.toLowerCase().includes(searchLower) ||
          task.id.toLowerCase().includes(searchLower) ||
          task.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          task.category?.toLowerCase().includes(searchLower) ||
          task.assignees.some((user) =>
            user.toLowerCase().includes(searchLower),
          )
        );
      });
    }

    return filtered;
  };

  // Get filtered archived tasks
  const getFilteredArchivedTasks = (taskList) => {
    if (!archiveSearchTerm) return taskList;

    const searchLower = archiveSearchTerm.toLowerCase();
    return taskList.filter((task) => {
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.notes.toLowerCase().includes(searchLower) ||
        task.id.toLowerCase().includes(searchLower) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        task.category?.toLowerCase().includes(searchLower) ||
        task.assignees.some((user) => user.toLowerCase().includes(searchLower))
      );
    });
  };

  // Get column tasks
  const getColumnTasks = (columnId) => {
    const columnTasks = tasks.filter((t) => t.status === columnId);
    return getFilteredTasks(columnTasks);
  };

  // Get column count
  const getColumnCount = (columnId) => {
    return getColumnTasks(columnId).length;
  };

  // Get available filter values
  const availableTags = [
    ...new Set(
      [...tasks, ...archivedTasks].flatMap((t) =>
        t.tags.map((tag) => tag.replace("#", "")),
      ),
    ),
  ].sort();

  const availableCategories = [
    ...new Set(
      [...tasks, ...archivedTasks].map((t) => t.category).filter(Boolean),
    ),
  ].sort();

  const availableUsers = [
    ...new Set([...tasks, ...archivedTasks].flatMap((t) => t.assignees)),
  ].sort();

  const availablePriorities = [
    ...new Set(
      [...tasks, ...archivedTasks].map((t) => t.priority).filter(Boolean),
    ),
  ];

  // Get filter label
  const getFilterLabel = (type, value) => {
    switch (type) {
      case "tag":
        return `#${value}`;
      case "category":
        return `📁 ${value}`;
      case "user":
        return `👤 ${value}`;
      case "priority":
        return `⚡ ${value}`;
      default:
        return value;
    }
  };

  // Get priority class
  const getPriorityClass = (priority) => {
    if (!priority) return "Default";

    const iconClasses = translationSystem.priorityIconClasses;
    const emoji = priority.match(/^(.)/)?.["1"] || "";
    if (iconClasses[emoji]) {
      return iconClasses[emoji];
    }

    const textPriorityMap = {
      Critical: "Red",
      Critique: "Red",
      High: "Orange",
      Haute: "Orange",
      Medium: "Yellow",
      Moyenne: "Yellow",
      Low: "Green",
      Basse: "Green",
    };

    for (const [key, color] of Object.entries(textPriorityMap)) {
      if (priority.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }

    return "Default";
  };

  // Get subtask progress
  const getSubtaskProgress = (subtasks) => {
    if (!subtasks || subtasks.length === 0) {
      return { completed: 0, total: 0, percentage: 0 };
    }

    const completed = subtasks.filter((st) => st.completed).length;
    const total = subtasks.length;
    const percentage = Math.round((completed / total) * 100);

    return { completed, total, percentage };
  };

  const showWelcome = !directoryHandle;
  const hasActiveTasks = tasks.length > 0;

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1>{t("header.title")}</h1>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            {/* Language Selector */}
            <select
              onChange={(e) => {
                translationSystem.setLanguage(e.target.value);
                setCurrentLanguage(e.target.value);
              }}
              value={currentLanguage}
              style={{
                padding: "0.6rem 1rem",
                border: "1px solid var(--border-color)",
                borderRadius: "6px",
                fontSize: "0.9rem",
                background: "white",
                cursor: "pointer",
              }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>

            {/* Project Selector */}
            {showProjectSelector && (
              <select
                onChange={(e) => switchProject(e.target.value)}
                value={getCurrentProjectIndex()}
                style={{
                  padding: "0.6rem 1rem",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  background: "white",
                  cursor: "pointer",
                  minWidth: "180px",
                }}
              >
                <option value="">{t("projects.select")}</option>
                {recentProjects.map((project, index) => (
                  <option key={index} value={index}>
                    {project.displayName || project.name}
                  </option>
                ))}
              </select>
            )}

            {/* Project Actions */}
            {directoryHandle && (
              <>
                <button
                  onClick={renameCurrentProject}
                  className="btn btn-secondary"
                  style={{ padding: "0.6rem" }}
                  title={t("header.renameProject")}
                >
                  ✏️
                </button>

                <button
                  onClick={deleteCurrentProject}
                  className="btn btn-secondary"
                  style={{ padding: "0.6rem" }}
                  title={t("header.deleteProject")}
                >
                  🗑️
                </button>
              </>
            )}

            {/* Folder Button */}
            <button onClick={selectFolder} className="btn btn-primary">
              {t("header.folder")}
            </button>

            {/* Action Buttons */}
            {directoryHandle && (
              <>
                <button onClick={createTask} className="btn btn-secondary">
                  {t("header.newTask")}
                </button>

                <button
                  onClick={() => setShowArchiveModal(true)}
                  className="btn btn-secondary"
                >
                  {t("header.archives")}
                </button>

                <button
                  onClick={() => setShowColumnsModal(true)}
                  className="btn btn-secondary"
                >
                  {t("header.columns")}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      {directoryHandle && (
        <div
          style={{
            background: "white",
            borderBottom: "1px solid var(--border-color)",
            padding: "1rem 0",
          }}
        >
          <div
            style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 2rem" }}
          >
            {/* Global Search */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  position: "relative",
                  maxWidth: "600px",
                  width: "100%",
                }}
              >
                <input
                  type="text"
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  placeholder={t("filters.search")}
                  style={{
                    width: "100%",
                    padding: "0.75rem 3rem 0.75rem 1rem",
                    border: "2px solid #cbd5e0",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                {globalSearchTerm && (
                  <button
                    onClick={() => setGlobalSearchTerm("")}
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#718096",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      padding: "0.5rem",
                    }}
                    title={t("filters.searchClear")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Tag Filter */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <label style={{ fontWeight: "500", fontSize: "0.9rem" }}>
                  {t("filters.tags")}
                </label>
                <select
                  onChange={(e) => {
                    addFilter("tag", e.target.value);
                    e.target.value = "";
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "4px",
                    minWidth: "150px",
                  }}
                >
                  <option value="">{t("filters.select")}</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <label style={{ fontWeight: "500", fontSize: "0.9rem" }}>
                  {t("filters.category")}
                </label>
                <select
                  onChange={(e) => {
                    addFilter("category", e.target.value);
                    e.target.value = "";
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "4px",
                    minWidth: "150px",
                  }}
                >
                  <option value="">{t("filters.select")}</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Filter */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <label style={{ fontWeight: "500", fontSize: "0.9rem" }}>
                  {t("filters.user")}
                </label>
                <select
                  onChange={(e) => {
                    addFilter("user", e.target.value);
                    e.target.value = "";
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "4px",
                    minWidth: "150px",
                  }}
                >
                  <option value="">{t("filters.select")}</option>
                  {availableUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <label style={{ fontWeight: "500", fontSize: "0.9rem" }}>
                  {t("filters.priority")}
                </label>
                <select
                  onChange={(e) => {
                    addFilter("priority", e.target.value);
                    e.target.value = "";
                  }}
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #cbd5e0",
                    borderRadius: "4px",
                    minWidth: "150px",
                  }}
                >
                  <option value="">{t("filters.select")}</option>
                  {availablePriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear All Button */}
              <button
                onClick={clearFilters}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem" }}
              >
                {t("filters.clearAll")}
              </button>
            </div>

            {/* Active Filters */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                minHeight: "32px",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              {activeFilters.map((filter) => (
                <span
                  key={filter.type + filter.value}
                  className="badge"
                  style={{
                    background: "#ebf8ff",
                    color: "#2b6cb0",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{getFilterLabel(filter.type, filter.value)}</span>
                  <button
                    onClick={() => removeFilter(filter.type, filter.value)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#2b6cb0",
                      cursor: "pointer",
                      padding: "0",
                      fontWeight: "bold",
                    }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      {showWelcome && (
        <div className="welcome">
          <h2>{t("welcome.title")}</h2>
          <p>{t("welcome.description")}</p>
          <button
            onClick={selectFolder}
            className="btn btn-primary"
            style={{ fontSize: "1.1rem", padding: "0.8rem 2rem" }}
          >
            {t("welcome.start")}
          </button>

          <div
            style={{
              marginTop: "3rem",
              textAlign: "left",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <h3>{t("welcome.howItWorks")}</h3>
            <ol style={{ lineHeight: "1.8", color: "var(--text-secondary)" }}>
              <li>{t("welcome.step1")}</li>
              <li>{t("welcome.step2")}</li>
              <li>{t("welcome.step3")}</li>
              <li>{t("welcome.step4")}</li>
              <li>{t("welcome.step5")}</li>
            </ol>
            <p style={{ marginTop: "1rem", color: "#e53e3e" }}>
              {t("welcome.browserWarning")}
            </p>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!showWelcome && hasActiveTasks && (
        <div id="kanbanView">
          <div className="kanban-board">
            {config.columns.map((column) => (
              <div
                key={column.id}
                className="kanban-column"
                data-column-id={column.id}
              >
                <div className="column-header">
                  <div className="column-title">
                    <span>{column.name}</span>
                    <span className="column-count">
                      {getColumnCount(column.id)}
                    </span>
                  </div>
                </div>
                <div
                  className="task-list"
                  onDrop={(e) => handleDrop(e, column.id)}
                  onDragOver={handleDragOver}
                >
                  {getColumnTasks(column.id).map((task, taskIdx) => (
                    <div
                      key={`${column.id}-${task.id}-${taskIdx}`}
                      className="task-card"
                      data-task-id={task.id}
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      onClick={() => showTaskDetail(task)}
                    >
                      <div className="task-header">
                        <span className="task-id">{task.id}</span>
                        <button
                          className="task-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openTaskForm(task);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "1.1rem",
                            padding: "0.25rem",
                          }}
                          title="Edit task"
                        >
                          ✏️
                        </button>
                      </div>
                      <div className="task-title">{task.title}</div>

                      {/* Task metadata */}
                      <div className="task-meta">
                        {task.priority && (
                          <span
                            className={`badge badge-priority ${getPriorityClass(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                        )}

                        {task.category && (
                          <span className="badge badge-category">
                            {task.category}
                          </span>
                        )}

                        {task.assignees.map((assignee) => (
                          <span key={assignee} className="badge badge-assignee">
                            {assignee}
                          </span>
                        ))}

                        {task.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Description preview */}
                      {task.description && (
                        <div className="task-description">
                          {task.description}
                        </div>
                      )}

                      {/* Subtasks progress */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="task-subtasks">
                          <div className="subtask-progress">
                            <span>
                              {getSubtaskProgress(task.subtasks).completed}/
                              {getSubtaskProgress(task.subtasks).total}
                            </span>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${getSubtaskProgress(task.subtasks).percentage}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Empty state */}
                  {getColumnCount(column.id) === 0 && (
                    <div className="empty-state">
                      <span>{t("empty.noTasks")}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <div
        className={`modal ${showTaskModal ? "active" : ""}`}
        onClick={closeTaskDetail}
      >
        {currentDetailTask && (
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("taskDetail.title")}</h2>
              <button className="close-btn" onClick={closeTaskDetail}>
                &times;
              </button>
            </div>

            <div className="task-detail" style={{ padding: "1.5rem" }}>
              {/* Task ID Badge */}
              <div
                style={{
                  display: "inline-block",
                  background: "var(--primary)",
                  color: "white",
                  padding: "0.25rem 0.75rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                <span>{currentDetailTask.id}</span>
              </div>

              {/* Title */}
              <h3
                style={{
                  margin: "0 0 1.5rem 0",
                  fontSize: "1.5rem",
                  color: "var(--text)",
                }}
              >
                {currentDetailTask.title}
              </h3>

              {/* Metadata Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  background: "var(--bg)",
                  borderRadius: "8px",
                }}
              >
                {currentDetailTask.priority && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {t("meta.priority")}
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {config.priorities?.find((p) =>
                        p
                          .toLowerCase()
                          .includes(currentDetailTask.priority.toLowerCase()),
                      ) || currentDetailTask.priority}
                    </div>
                  </div>
                )}

                <div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {t("meta.status")}
                  </div>
                  <div style={{ fontWeight: "500" }}>
                    {config.columns.find(
                      (c) => c.id === currentDetailTask.status,
                    )?.name || currentDetailTask.status}
                  </div>
                </div>

                {currentDetailTask.category && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {t("meta.category")}
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {currentDetailTask.category}
                    </div>
                  </div>
                )}

                {currentDetailTask.created && (
                  <div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--text-secondary)",
                        marginBottom: "0.25rem",
                      }}
                    >
                      Creation date
                    </div>
                    <div style={{ fontWeight: "500" }}>
                      {currentDetailTask.created}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {currentDetailTask.tags && currentDetailTask.tags.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Tags
                  </div>
                  <div
                    style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                  >
                    {currentDetailTask.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: "var(--bg)",
                          color: "var(--text)",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "12px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                  }}
                >
                  <span>
                    Subtasks (
                    {currentDetailTask.subtasks?.filter((st) => st.completed)
                      .length || 0}
                    /{currentDetailTask.subtasks?.length || 0})
                  </span>
                </div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: "0",
                    margin: "0 0 1rem 0",
                  }}
                >
                  {(currentDetailTask.subtasks || []).map((subtask, idx) => (
                    <li
                      key={idx}
                      style={{
                        padding: "0.5rem",
                        marginBottom: "0.25rem",
                        background: "var(--bg)",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() =>
                          toggleSubtask(currentDetailTask.id, idx)
                        }
                        style={{
                          width: "18px",
                          height: "18px",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={
                          subtask.completed
                            ? {
                                textDecoration: "line-through",
                                color: "var(--text-secondary)",
                                flex: "1",
                              }
                            : { flex: "1" }
                        }
                      >
                        {subtask.text}
                      </span>
                      <button
                        onClick={() => deleteSubtask(currentDetailTask.id, idx)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#e53e3e",
                          fontSize: "1.1rem",
                          padding: "0.25rem",
                        }}
                        title="Delete subtask"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={newSubtaskInput}
                    onChange={(e) => setNewSubtaskInput(e.target.value)}
                    placeholder="New subtask..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        addSubtask(currentDetailTask.id);
                      }
                    }}
                    style={{
                      flex: "1",
                      padding: "0.5rem",
                      border: "2px solid #cbd5e0",
                      borderRadius: "4px",
                      fontSize: "0.9rem",
                    }}
                  />
                  <button
                    onClick={() => addSubtask(currentDetailTask.id)}
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1rem" }}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Notes */}
              {currentDetailTask.notes && (
                <div
                  style={{
                    marginTop: "1.5rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginBottom: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      lineHeight: "1.7",
                      color: "var(--text)",
                      background: "var(--bg)",
                      padding: "1rem",
                      borderRadius: "8px",
                      borderLeft: "4px solid var(--primary)",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: markdownParser.markdownToHtml(
                        currentDetailTask.notes,
                      ),
                    }}
                  />
                </div>
              )}
            </div>

            <div className="actions">
              <button className="btn btn-secondary" onClick={closeTaskDetail}>
                {t("taskDetail.close")}
              </button>
              <button
                className="btn btn-secondary"
                onClick={deleteCurrentTask}
                style={{ background: "#ef4444", color: "white" }}
              >
                {t("taskDetail.delete")}
              </button>
              {currentDetailTask && currentDetailTask.status !== "archived" && (
                <button
                  className="btn btn-secondary"
                  onClick={archiveCurrentTask}
                  style={{ background: "#f59e0b", color: "white" }}
                >
                  {t("taskDetail.archive")}
                </button>
              )}
              <button className="btn btn-primary" onClick={editCurrentTask}>
                {t("taskDetail.edit")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      <div
        className={`modal ${showTaskFormModal ? "active" : ""}`}
        onClick={closeTaskForm}
      >
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {isEditMode ? t("taskForm.editTask") : t("taskForm.newTask")}
            </h2>
            <button className="close-btn" onClick={closeTaskForm}>
              &times;
            </button>
          </div>

          <form onSubmit={submitTaskForm}>
            <div className="form-group">
              <label>{t("taskForm.titleLabel")}</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>{t("taskForm.columnLabel")}</label>
              <select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, status: e.target.value })
                }
                required
              >
                {config.columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>{t("taskForm.priorityLabel")}</label>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
              >
                <option value="">{t("taskForm.priorityNone")}</option>
                {config.priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label>{t("taskForm.categoryLabel")}</label>
              <select
                value={taskForm.category}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, category: e.target.value })
                }
              >
                <option value="">--</option>
                {config.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignees */}
            <div className="form-group">
              <label>{t("taskForm.assignedLabel")}</label>
              <input
                type="text"
                value={taskFormAssigneesInput}
                onChange={(e) => setTaskFormAssigneesInput(e.target.value)}
                onBlur={updateTaskFormAssignees}
                placeholder={t("taskForm.assignedPlaceholder")}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                Separate with commas (e.g., @alice, @bob)
              </small>
            </div>

            {/* Dates */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div className="form-group">
                <label>{t("taskForm.createdLabel")}</label>
                <input
                  type="date"
                  value={taskForm.created}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, created: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("taskForm.startedLabel")}</label>
                <input
                  type="date"
                  value={taskForm.started}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, started: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("taskForm.dueLabel")}</label>
                <input
                  type="date"
                  value={taskForm.due}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, due: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("taskForm.completedLabel")}</label>
                <input
                  type="date"
                  value={taskForm.completed}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, completed: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>{t("taskForm.tagsLabel")}</label>
              <input
                type="text"
                value={taskFormTagsInput}
                onChange={(e) => setTaskFormTagsInput(e.target.value)}
                onBlur={updateTaskFormTags}
                placeholder={t("taskForm.tagsPlaceholder")}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                {t("taskForm.tagsHelp")}
              </small>
            </div>

            <div className="form-group">
              <label>{t("taskForm.descriptionLabel")}</label>
              <textarea
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                rows="4"
              />
            </div>

            {/* Subtasks */}
            <div className="form-group">
              <label>{t("taskForm.subtasksLabel")}</label>
              <div style={{ marginBottom: "0.5rem" }}>
                {formSubtasks.map((subtask, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                      padding: "0.5rem",
                      background: "#f7f7f7",
                      borderRadius: "4px",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleFormSubtask(index)}
                      style={{ marginRight: "0.5rem" }}
                    />
                    <span style={{ flex: "1" }}>{subtask.text}</span>
                    <button
                      type="button"
                      onClick={() => removeFormSubtask(index)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#e53e3e",
                        cursor: "pointer",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder={t("taskForm.subtaskPlaceholder")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFormSubtask();
                    }
                  }}
                  style={{ flex: "1" }}
                />
                <button
                  type="button"
                  onClick={addFormSubtask}
                  className="btn btn-secondary"
                >
                  {t("taskForm.subtaskAdd")}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{t("taskForm.notesLabel")}</label>
              <textarea
                value={taskForm.notes}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, notes: e.target.value })
                }
                rows="6"
                placeholder={t("taskForm.notesPlaceholder")}
              />
              <small style={{ color: "#666", fontSize: "0.85rem" }}>
                {t("taskForm.notesHelp")}
              </small>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeTaskForm}
              >
                {t("taskForm.cancel")}
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditMode ? t("taskForm.save") : t("taskForm.create")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Archive Modal */}
      <div
        className={`modal ${showArchiveModal ? "active" : ""}`}
        onClick={() => setShowArchiveModal(false)}
      >
        <div
          className="modal-content"
          style={{ maxWidth: "900px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{t("archives.title")}</h2>
            <button
              className="close-btn"
              onClick={() => setShowArchiveModal(false)}
            >
              &times;
            </button>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                value={archiveSearchTerm}
                onChange={(e) => setArchiveSearchTerm(e.target.value)}
                placeholder={t("archives.search")}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "2px solid #cbd5e0",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              {getFilteredArchivedTasks(archivedTasks).map((task, idx) => (
                <div
                  key={`archive-${task.id}-${idx}`}
                  className="task-card"
                  style={{ marginBottom: "1rem", cursor: "pointer" }}
                  onClick={() => showTaskDetail(task)}
                >
                  <div className="task-header">
                    <span className="task-id">{task.id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreArchivedTask(task.id);
                      }}
                      className="btn btn-secondary"
                      style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                    >
                      {t("action.restore")}
                    </button>
                  </div>
                  <div className="task-title">{task.title}</div>
                </div>
              ))}

              {archivedTasks.length === 0 && (
                <div className="empty-state">
                  <span>{t("archives.empty")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Columns Modal */}
      <div
        className={`modal ${showColumnsModal ? "active" : ""}`}
        onClick={() => setShowColumnsModal(false)}
      >
        <div
          className="modal-content"
          style={{ maxWidth: "500px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{t("columns.title")}</h2>
            <button
              className="close-btn"
              onClick={() => setShowColumnsModal(false)}
            >
              &times;
            </button>
          </div>

          <div style={{ padding: "1.5rem" }}>
            <div>
              {config.columns.map((column, index) => (
                <div
                  key={column.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "#f7f7f7",
                    borderRadius: "6px",
                  }}
                >
                  <span style={{ flex: "1" }}>
                    {column.name} ({column.id})
                  </span>
                  <button
                    onClick={() => removeColumn(column.id)}
                    className="btn btn-secondary"
                    style={{ padding: "0.25rem 0.5rem", background: "#fee" }}
                  >
                    {t("action.delete")}
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addColumn}
              className="btn btn-primary"
              style={{ marginTop: "1rem", width: "100%" }}
            >
              {t("columns.add")}
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      <div
        className={`notification ${notification.show ? "show" : ""} ${notification.type}`}
      >
        <span>{notification.message}</span>
      </div>
    </div>
  );
}

export default App;
