import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { translationSystem } from "./utils/translations";
import { fileSystem } from "./utils/fileSystem";
import { markdownParser } from "./utils/markdown";
import { fileWatcher } from "./utils/fileWatcher";
import { Button } from "./components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./components/ui/dialog";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Checkbox } from "./components/ui/checkbox";
import { Select } from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import {
  Search,
  X,
  FolderOpen,
  Plus,
  Archive,
  Settings,
  Edit,
  Edit2,
  Trash2,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  AlertCircle,
  Type,
} from "lucide-react";

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
  const isLoadingFromFile = useRef(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [archiveSearchTerm, setArchiveSearchTerm] = useState("");
  const [debouncedArchiveSearchTerm, setDebouncedArchiveSearchTerm] =
    useState("");

  // Sort state
  const [sortConfig, setSortConfig] = useState({
    mainBoard: { field: "created", direction: "desc" },
    archive: { field: "completed", direction: "desc" },
  });

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
  5;
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

  // Cleanup file watcher on unmount or when switching projects
  useEffect(() => {
    return () => {
      fileWatcher.stopFileWatcher();
    };
  }, [kanbanFileHandle]);

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
      isLoadingFromFile.current = true;
      const parsed = markdownParser.parseMarkdown(kanbanResult.content);

      // Deep clone to ensure React detects all changes including subtasks
      const clonedTasks = parsed.tasks.map((task) => ({
        ...task,
        subtasks: task.subtasks.map((st) => ({ ...st })),
        tags: [...task.tags],
        assignees: [...task.assignees],
      }));

      // Check if any tasks need reorganization (status doesn't match section)
      console.log(
        `🔍 Checking ${clonedTasks.length} tasks for reorganization on initial load...`,
      );
      const tasksNeedingReorganization = clonedTasks.filter((task) => {
        if (task._needsReorganization) {
          console.log(
            `📝 Task ${task.id} in wrong section: has status '${task.status}', will be reorganized`,
          );
          return true;
        }
        return false;
      });

      // Clean up the flags
      tasksNeedingReorganization.forEach((task) => {
        delete task._needsReorganization;
      });

      setTasks(clonedTasks);
      setConfig(parsed.config);

      // Set current content for file watcher
      fileWatcher.setCurrentContent(kanbanResult.content);

      // Load archive.md
      const archiveResult = await fileSystem.loadArchiveFile(dirHandle);
      setArchiveFileHandle(archiveResult.fileHandle);
      setArchivedTasks(markdownParser.parseArchive(archiveResult.content));

      // If any tasks need reorganization, save file to reorganize (like old version)
      if (tasksNeedingReorganization.length > 0) {
        console.log(
          `🔄 ${tasksNeedingReorganization.length} tasks will be reorganized to correct sections`,
        );

        // Tasks already have correct status from parsing, now save the file to reorganize
        setTimeout(async () => {
          try {
            const reorganizedMarkdown = markdownParser.generateMarkdown(
              clonedTasks,
              parsed.config,
            );
            const writable = await kanbanResult.fileHandle.createWritable();
            await writable.write(reorganizedMarkdown);
            await writable.close();
            // Update file watcher's content to prevent detecting our own save as an external change
            fileWatcher.setCurrentContent(reorganizedMarkdown);
            console.log("✅ Tasks reorganized and file saved");
          } catch (error) {
            console.error("❌ Error saving reorganized file:", error);
          } finally {
            isLoadingFromFile.current = false;
          }
        }, 500);
      } else {
        // Reset flag after loading completes
        setTimeout(() => {
          isLoadingFromFile.current = false;
        }, 1000);
      }

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
      onExternalChange: async (newContent) => {
        isLoadingFromFile.current = true;
        const parsed = markdownParser.parseMarkdown(newContent);

        // Deep clone to ensure React detects all changes including subtasks
        const clonedTasks = parsed.tasks.map((task) => ({
          ...task,
          subtasks: task.subtasks.map((st) => ({ ...st })),
          tags: [...task.tags],
          assignees: [...task.assignees],
        }));

        // Check if any tasks need reorganization (status doesn't match section)
        console.log(
          `🔍 Checking ${clonedTasks.length} tasks for reorganization...`,
        );
        const tasksNeedingReorganization = clonedTasks.filter((task) => {
          if (task._needsReorganization) {
            console.log(
              `📝 Task ${task.id} in wrong section: has status '${task.status}', will be reorganized`,
            );
            return true;
          }
          return false;
        });

        // Clean up the flags
        tasksNeedingReorganization.forEach((task) => {
          delete task._needsReorganization;
        });

        setTasks(clonedTasks);
        setConfig({ ...parsed.config, columns: [...parsed.config.columns] });
        showNotification("File updated from external source", "info");

        console.log(
          `📥 Loaded ${parsed.tasks.length} tasks from external file`,
        );

        // If any tasks need reorganization, save file to reorganize (like old version)
        if (tasksNeedingReorganization.length > 0) {
          console.log(
            `🔄 ${tasksNeedingReorganization.length} tasks will be reorganized to correct sections`,
          );

          // Tasks already have correct status from parsing, now save the file to reorganize
          setTimeout(async () => {
            try {
              const reorganizedMarkdown = markdownParser.generateMarkdown(
                clonedTasks,
                parsed.config,
              );
              const writable = await fileHandle.createWritable();
              await writable.write(reorganizedMarkdown);
              await writable.close();
              // Update file watcher's content to prevent detecting our own save as an external change
              fileWatcher.setCurrentContent(reorganizedMarkdown);
              console.log("✅ Tasks reorganized and file saved");
            } catch (error) {
              console.error("❌ Error saving reorganized file:", error);
            } finally {
              isLoadingFromFile.current = false;
            }
          }, 500);
        } else {
          // Reset flag after state updates have settled
          setTimeout(() => {
            isLoadingFromFile.current = false;
          }, 1000);
        }
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

  // Debounce search terms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(globalSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [globalSearchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedArchiveSearchTerm(archiveSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [archiveSearchTerm]);

  // Auto-save when tasks or config changes
  useEffect(() => {
    if (kanbanFileHandle && tasks.length >= 0 && !isLoadingFromFile.current) {
      const timer = setTimeout(() => {
        saveFile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tasks, config, kanbanFileHandle, saveFile]);

  // Auto-save archive when archivedTasks changes
  useEffect(() => {
    if (archiveFileHandle && archivedTasks.length >= 0) {
      const timer = setTimeout(() => {
        saveArchive();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [archivedTasks, archiveFileHandle, saveArchive]);

  // Update currentDetailTask when tasks change (for live updates in modal)
  useEffect(() => {
    if (currentDetailTask && showTaskModal) {
      const updatedTask = tasks.find((t) => t.id === currentDetailTask.id);
      if (updatedTask) {
        setCurrentDetailTask(updatedTask);
      }
    }
  }, [tasks, currentDetailTask, showTaskModal]);

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

    // Auto-save will trigger via useEffect when tasks/config changes

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

      // Auto-save will trigger via useEffect when tasks changes
      if (oldStatus !== updates.status && updates.status) {
        setTimeout(() => {
          markdownParser.scheduleStatusReorganization(newTasks, config, () => {
            // Reorganization callback - no-op since useEffect handles save
          });
        }, 0);
      }

      return newTasks;
    });
  };

  // Delete task
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    // Auto-save will trigger via useEffect when tasks changes
  };

  // Archive task
  const archiveTask = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    setArchivedTasks((prev) => [...prev, { ...task, status: "archived" }]);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Auto-save will trigger via useEffect for both files

    return true;
  };

  // Restore task
  const restoreTask = (taskId, targetStatus = "todo") => {
    const task = archivedTasks.find((t) => t.id === taskId);
    if (!task) return false;

    setTasks((prev) => [...prev, { ...task, status: targetStatus }]);
    setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId));

    // Auto-save will trigger via useEffect for both files

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

  // Open task form with pre-filled status
  const openTaskFormWithStatus = (statusId) => {
    setIsEditMode(false);
    setEditingTaskId(null);
    resetTaskForm();
    setTaskForm((prev) => ({ ...prev, status: statusId }));
    setShowTaskFormModal(true);
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

    // Auto-save will trigger via useEffect when config changes
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

    // Auto-save will trigger via useEffect when config changes
  };

  // Drag handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-50");
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("opacity-50");
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

  // Sort tasks utility
  const sortTasks = (taskList, config) => {
    if (!config || !config.field) return taskList;

    const sorted = [...taskList].sort((a, b) => {
      let aVal, bVal;

      switch (config.field) {
        case "created":
          aVal = new Date(a.created || 0);
          bVal = new Date(b.created || 0);
          break;
        case "completed":
          aVal = new Date(a.completed || 0);
          bVal = new Date(b.completed || 0);
          break;
        case "due":
          aVal = new Date(a.due || "9999-12-31");
          bVal = new Date(b.due || "9999-12-31");
          break;
        case "priority": {
          const priorityOrder = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
            "": 0,
          };
          aVal = priorityOrder[a.priority?.toLowerCase()] || 0;
          bVal = priorityOrder[b.priority?.toLowerCase()] || 0;
          break;
        }
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return config.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return config.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  // Get filtered tasks - memoized for performance
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

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

    // Apply global search (using debounced term)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
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

    // Apply sorting
    filtered = sortTasks(filtered, sortConfig.mainBoard);

    return filtered;
  }, [tasks, activeFilters, debouncedSearchTerm, sortConfig.mainBoard]);

  // Get filtered archived tasks - memoized for performance
  const filteredArchivedTasks = useMemo(() => {
    let filtered = [...archivedTasks];

    if (debouncedArchiveSearchTerm) {
      const searchLower = debouncedArchiveSearchTerm.toLowerCase();
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

    // Apply sorting
    filtered = sortTasks(filtered, sortConfig.archive);

    return filtered;
  }, [archivedTasks, debouncedArchiveSearchTerm, sortConfig.archive]);

  // Get column tasks - memoized by column
  const getColumnTasks = useCallback(
    (columnId) => {
      return filteredTasks.filter((t) => t.status === columnId);
    },
    [filteredTasks],
  );

  // Get column count
  const getColumnCount = useCallback(
    (columnId) => {
      return filteredTasks.filter((t) => t.status === columnId).length;
    },
    [filteredTasks],
  );

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
        return `${value}`;
      case "user":
        return `${value}`;
      case "priority":
        return `${value}`;
      default:
        return value;
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6">
            {/* Left Section: Branding & Context */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <h1 className="text-xl font-bold text-gray-900">
                {t("header.title")}
              </h1>

              {/* Language Selector */}
              <Select
                onChange={(e) => {
                  translationSystem.setLanguage(e.target.value);
                  setCurrentLanguage(e.target.value);
                }}
                value={currentLanguage}
                className="w-24 sm:w-32 text-sm"
              >
                <option value="en">EN</option>
                <option value="fr">FR</option>
              </Select>

              {/* Project Selector */}
              {showProjectSelector && (
                <Select
                  onChange={(e) => switchProject(e.target.value)}
                  value={getCurrentProjectIndex()}
                  className="w-32 sm:w-48 text-sm"
                >
                  <option value="">{t("projects.select")}</option>
                  {recentProjects.map((project, index) => (
                    <option key={index} value={index}>
                      {project.displayName || project.name}
                    </option>
                  ))}
                </Select>
              )}

              {/* Project Actions */}
              {directoryHandle && (
                <div className="flex items-center gap-1">
                  <Button
                    onClick={renameCurrentProject}
                    variant="ghost"
                    size="icon"
                    title={t("header.renameProject")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={deleteCurrentProject}
                    variant="ghost"
                    size="icon"
                    title={t("header.deleteProject")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={selectFolder}
                    variant="ghost"
                    size="icon"
                    title={t("header.folder")}
                  >
                    <FolderOpen className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Right Section: Actions & Settings */}
            <div className="flex items-center gap-2">
              {!directoryHandle && (
                <Button onClick={selectFolder} variant="default">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {t("header.folder")}
                </Button>
              )}

              {/* Primary Action - New Task */}
              {directoryHandle && (
                <>
                  <Button
                    onClick={createTask}
                    variant="default"
                    size="default"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("header.newTask")}
                  </Button>

                  <div className="h-6 w-px bg-gray-300" />

                  {/* Secondary Actions */}
                  <Button
                    onClick={() => setShowArchiveModal(true)}
                    variant="outline"
                    size="default"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {t("header.archives")}
                  </Button>

                  <Button
                    onClick={() => {
                      const daysOld = parseInt(
                        prompt(
                          "Archive tasks completed more than X days ago:",
                          "30",
                        ),
                      );
                      if (daysOld && !isNaN(daysOld)) {
                        const cutoffDate = new Date();
                        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
                        const toArchive = tasks.filter(
                          (t) =>
                            t.completed && new Date(t.completed) < cutoffDate,
                        );
                        toArchive.forEach((task) => archiveTask(task.id));
                        showNotification(
                          `Archived ${toArchive.length} tasks older than ${daysOld} days`,
                          "success",
                        );
                      }
                    }}
                    variant="outline"
                    size="default"
                  >
                    Auto-Archive
                  </Button>

                  <Button
                    onClick={() => setShowColumnsModal(true)}
                    variant="ghost"
                    size="icon"
                    title={t("header.columns")}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>

                  {/* Task Progress Indicator */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                    <span className="text-gray-600 font-medium">
                      {tasks.length > 0
                        ? `${Math.round((tasks.filter((t) => t.status === "done").length / tasks.length) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      {directoryHandle && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Global Search */}
            <div className="flex justify-center mb-4">
              <div className="relative w-full max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={globalSearchTerm}
                  onChange={(e) => setGlobalSearchTerm(e.target.value)}
                  placeholder={t("filters.search")}
                  className="pl-9 pr-9"
                />
                {globalSearchTerm && (
                  <button
                    onClick={() => setGlobalSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <div
                className="inline-flex rounded-lg border border-gray-300"
                role="group"
              >
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      mainBoard: { field: "created", direction: "desc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${
                    sortConfig.mainBoard.field === "created" &&
                    sortConfig.mainBoard.direction === "desc"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ArrowDown className="h-3 w-3" />
                  Newest
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      mainBoard: { field: "created", direction: "asc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.mainBoard.field === "created" &&
                    sortConfig.mainBoard.direction === "asc"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ArrowUp className="h-3 w-3" />
                  Oldest
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      mainBoard: { field: "priority", direction: "desc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.mainBoard.field === "priority"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <AlertCircle className="h-3 w-3" />
                  Priority
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      mainBoard: { field: "title", direction: "asc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.mainBoard.field === "title"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Type className="h-3 w-3" />
                  A-Z
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
              {/* Tag Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  {t("filters.tags")}
                </Label>
                <Select
                  id="tag-filter-select"
                  onChange={(e) => {
                    addFilter("tag", e.target.value);
                    e.target.value = "";
                  }}
                  className="w-40"
                >
                  <option value="">{t("filters.select")}</option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      #{tag}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={() => {
                    const selectEl =
                      document.getElementById("tag-filter-select");
                    if (selectEl && selectEl.value) {
                      addFilter("tag", selectEl.value);
                      selectEl.value = "";
                    }
                  }}
                  className="btn-add-filter"
                  title="Add tag filter"
                >
                  +
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  {t("filters.category")}
                </Label>
                <Select
                  id="category-filter-select"
                  onChange={(e) => {
                    addFilter("category", e.target.value);
                    e.target.value = "";
                  }}
                  className="w-40"
                >
                  <option value="">{t("filters.select")}</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={() => {
                    const selectEl = document.getElementById(
                      "category-filter-select",
                    );
                    if (selectEl && selectEl.value) {
                      addFilter("category", selectEl.value);
                      selectEl.value = "";
                    }
                  }}
                  className="btn-add-filter"
                  title="Add category filter"
                >
                  +
                </button>
              </div>

              {/* User Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  {t("filters.user")}
                </Label>
                <Select
                  id="user-filter-select"
                  onChange={(e) => {
                    addFilter("user", e.target.value);
                    e.target.value = "";
                  }}
                  className="w-40"
                >
                  <option value="">{t("filters.select")}</option>
                  {availableUsers.map((user) => (
                    <option key={user} value={user}>
                      {user}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={() => {
                    const selectEl =
                      document.getElementById("user-filter-select");
                    if (selectEl && selectEl.value) {
                      addFilter("user", selectEl.value);
                      selectEl.value = "";
                    }
                  }}
                  className="btn-add-filter"
                  title="Add user filter"
                >
                  +
                </button>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">
                  {t("filters.priority")}
                </Label>
                <Select
                  id="priority-filter-select"
                  onChange={(e) => {
                    addFilter("priority", e.target.value);
                    e.target.value = "";
                  }}
                  className="w-40"
                >
                  <option value="">{t("filters.select")}</option>
                  {availablePriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
                <button
                  onClick={() => {
                    const selectEl = document.getElementById(
                      "priority-filter-select",
                    );
                    if (selectEl && selectEl.value) {
                      addFilter("priority", selectEl.value);
                      selectEl.value = "";
                    }
                  }}
                  className="btn-add-filter"
                  title="Add priority filter"
                >
                  +
                </button>
              </div>

              {/* Clear All Button */}
              <button
                onClick={clearFilters}
                className="btn btn-secondary text-sm"
              >
                <X className="h-3 w-3 mr-1 inline" />
                {t("filters.clearAll")}
              </button>
            </div>

            {/* Active Filters */}
            <div className="flex gap-2 flex-wrap justify-center mt-4 min-h-[32px]">
              {activeFilters.map((filter) => (
                <span
                  key={filter.type + filter.value}
                  className="tag flex items-center gap-2 px-3 py-1"
                >
                  <span>{getFilterLabel(filter.type, filter.value)}</span>
                  <button
                    onClick={() => removeFilter(filter.type, filter.value)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Screen */}
      {showWelcome && (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4">
          <div className="text-center max-w-2xl">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("welcome.title")}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t("welcome.description")}
            </p>
            <Button onClick={selectFolder} size="lg">
              <FolderOpen className="h-5 w-5 mr-2" />
              {t("welcome.start")}
            </Button>

            <div className="mt-12 text-left bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">
                {t("welcome.howItWorks")}
              </h3>
              <ol className="space-y-3 text-gray-600">
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">1.</span>
                  <span>{t("welcome.step1")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">2.</span>
                  <span>{t("welcome.step2")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">3.</span>
                  <span>{t("welcome.step3")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">4.</span>
                  <span>{t("welcome.step4")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-semibold text-gray-900">5.</span>
                  <span>{t("welcome.step5")}</span>
                </li>
              </ol>
              <p className="mt-6 text-red-600 font-medium">
                {t("welcome.browserWarning")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {!showWelcome && hasActiveTasks && (
        <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-min">
              {config.columns.map((column) => (
                <div
                  key={column.id}
                  className="bg-gray-100 rounded-lg p-4 flex-shrink-0 w-80"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-900">
                        {column.name}
                      </h3>
                      <span className="badge badge-category">
                        {getColumnCount(column.id)}
                      </span>
                    </div>
                    <button
                      onClick={() => openTaskFormWithStatus(column.id)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Add task"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <div
                    className="space-y-3 min-h-[200px]"
                    onDrop={(e) => handleDrop(e, column.id)}
                    onDragOver={handleDragOver}
                  >
                    {getColumnTasks(column.id).map((task, taskIdx) => (
                      <Card
                        key={`${column.id}-${task.id}-${taskIdx}`}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        onClick={() => showTaskDetail(task)}
                      >
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-mono text-gray-500 font-medium">
                              {task.id}
                            </span>
                            <button
                              className="task-edit-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openTaskForm(task);
                              }}
                              title="Edit task"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </div>
                          <CardTitle className="text-sm font-semibold mt-2 line-clamp-2">
                            {task.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          {/* Task metadata */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {task.priority && (
                              <span
                                className={`badge badge-priority ${task.priority}`}
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
                              <span
                                key={assignee}
                                className="badge badge-assignee"
                              >
                                {assignee}
                              </span>
                            ))}

                            {task.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="tag">
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="tag">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>

                          {/* Description preview */}
                          {task.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}

                          {/* Subtasks progress */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>
                                  {getSubtaskProgress(task.subtasks).completed}/
                                  {getSubtaskProgress(task.subtasks).total}{" "}
                                  subtasks
                                </span>
                                <span>
                                  {getSubtaskProgress(task.subtasks).percentage}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${getSubtaskProgress(task.subtasks).percentage}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {/* Empty state */}
                    {getColumnCount(column.id) === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        {t("empty.noTasks")}
                      </div>
                    )}
                  </div>

                  {/* Add task button for this column */}
                  <Button
                    onClick={() => openTaskFormWithStatus(column.id)}
                    variant="outline"
                    className="w-full mt-3 border-dashed border-2 hover:bg-gray-200"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="w-[80%] max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
          {currentDetailTask && (
            <>
              <DialogHeader className="pb-4 mb-4 border-b flex-shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-xl font-semibold">
                    {t("taskDetail.title")}
                  </h2>
                  <button
                    onClick={closeTaskDetail}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                <h3 className="text-2xl font-normal mb-0">
                  {currentDetailTask.title}
                </h3>
              </DialogHeader>

              <div className="space-y-6 overflow-y-auto flex-1 px-1">
                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {currentDetailTask.priority && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        {t("meta.priority")}
                      </Label>
                      <div>
                        <span
                          className={`badge badge-priority ${currentDetailTask.priority}`}
                        >
                          {currentDetailTask.priority}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      {t("meta.status")}
                    </Label>
                    <p className="font-normal">
                      {config.columns.find(
                        (c) => c.id === currentDetailTask.status,
                      )?.name || currentDetailTask.status}
                    </p>
                  </div>

                  {currentDetailTask.category && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        {t("meta.category")}
                      </Label>
                      <p className="font-normal">
                        {currentDetailTask.category}
                      </p>
                    </div>
                  )}

                  {currentDetailTask.created && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        Creation date
                      </Label>
                      <p className="font-normal">{currentDetailTask.created}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {currentDetailTask.tags &&
                  currentDetailTask.tags.length > 0 && (
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">
                        Tags
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {currentDetailTask.tags.map((tag) => (
                          <span key={tag} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Description */}
                {currentDetailTask.description && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Description
                    </Label>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {currentDetailTask.description}
                    </p>
                  </div>
                )}

                {/* Subtasks */}
                <div>
                  <Label className="text-sm text-gray-600 mb-3 block">
                    Subtasks (
                    {currentDetailTask.subtasks?.filter((st) => st.completed)
                      .length || 0}
                    /{currentDetailTask.subtasks?.length || 0})
                  </Label>
                  <div className="space-y-2 mb-3">
                    {(currentDetailTask.subtasks || []).map((subtask, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={subtask.completed}
                          onChange={() =>
                            toggleSubtask(currentDetailTask.id, idx)
                          }
                          style={{
                            width: "16px",
                            height: "16px",
                            cursor: "pointer",
                          }}
                        />
                        <span
                          className={`flex-1 ${
                            subtask.completed
                              ? "line-through text-gray-400"
                              : ""
                          }`}
                        >
                          {subtask.text}
                        </span>
                        <button
                          onClick={() =>
                            deleteSubtask(currentDetailTask.id, idx)
                          }
                          className="text-gray-400 hover:text-gray-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
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
                      className="flex-1"
                    />
                    <button
                      onClick={() => addSubtask(currentDetailTask.id)}
                      className="btn-primary"
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {currentDetailTask.notes && (
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      Notes
                    </Label>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      style={{
                        fontSize: "0.875rem",
                        lineHeight: "1.5",
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

              <DialogFooter className="flex gap-3 pt-4 mt-4 border-t flex-shrink-0 bg-white">
                <button
                  onClick={closeTaskDetail}
                  className="btn-secondary"
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "4px",
                  }}
                >
                  Close
                </button>
                <button
                  onClick={deleteCurrentTask}
                  style={{
                    background: "#ef4444",
                    color: "white",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "4px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
                {currentDetailTask &&
                  currentDetailTask.status !== "archived" && (
                    <button
                      onClick={archiveCurrentTask}
                      style={{
                        background: "#f59e0b",
                        color: "white",
                        padding: "0.5rem 1.25rem",
                        borderRadius: "4px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Archive className="h-4 w-4" />
                      Archive
                    </button>
                  )}
                <button
                  onClick={editCurrentTask}
                  className="btn-primary"
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Form Modal */}
      <Dialog
        open={showTaskFormModal}
        onOpenChange={setShowTaskFormModal}
        disableOutsideClick={true}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? t("taskForm.editTask") : t("taskForm.newTask")}
            </DialogTitle>
            <button
              onClick={closeTaskForm}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogHeader>

          <form onSubmit={submitTaskForm} className="space-y-4">
            <div>
              <Label htmlFor="title">{t("taskForm.titleLabel")}</Label>
              <Input
                id="title"
                type="text"
                value={taskForm.title}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, title: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="status">{t("taskForm.columnLabel")}</Label>
              <Select
                id="status"
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
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">{t("taskForm.priorityLabel")}</Label>
                <Select
                  id="priority"
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
                </Select>
              </div>

              <div>
                <Label htmlFor="category">{t("taskForm.categoryLabel")}</Label>
                <Select
                  id="category"
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
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="assignees">{t("taskForm.assignedLabel")}</Label>
              <Input
                id="assignees"
                type="text"
                value={taskFormAssigneesInput}
                onChange={(e) => setTaskFormAssigneesInput(e.target.value)}
                onBlur={updateTaskFormAssignees}
                placeholder={t("taskForm.assignedPlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate with commas (e.g., @alice, @bob)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="created">{t("taskForm.createdLabel")}</Label>
                <Input
                  id="created"
                  type="date"
                  value={taskForm.created}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, created: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="started">{t("taskForm.startedLabel")}</Label>
                <Input
                  id="started"
                  type="date"
                  value={taskForm.started}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, started: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="due">{t("taskForm.dueLabel")}</Label>
                <Input
                  id="due"
                  type="date"
                  value={taskForm.due}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, due: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="completed">
                  {t("taskForm.completedLabel")}
                </Label>
                <Input
                  id="completed"
                  type="date"
                  value={taskForm.completed}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, completed: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tags">{t("taskForm.tagsLabel")}</Label>
              <Input
                id="tags"
                type="text"
                value={taskFormTagsInput}
                onChange={(e) => setTaskFormTagsInput(e.target.value)}
                onBlur={updateTaskFormTags}
                placeholder={t("taskForm.tagsPlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("taskForm.tagsHelp")}
              </p>
            </div>

            <div>
              <Label htmlFor="description">
                {t("taskForm.descriptionLabel")}
              </Label>
              <Textarea
                id="description"
                value={taskForm.description}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <Label>{t("taskForm.subtasksLabel")}</Label>
              <div className="space-y-2 mb-3">
                {formSubtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                  >
                    <Checkbox
                      checked={subtask.completed}
                      onChange={() => toggleFormSubtask(index)}
                    />
                    <span className="flex-1">{subtask.text}</span>
                    <Button
                      type="button"
                      onClick={() => removeFormSubtask(index)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
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
                />
                <Button
                  type="button"
                  onClick={addFormSubtask}
                  variant="secondary"
                >
                  {t("taskForm.subtaskAdd")}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">{t("taskForm.notesLabel")}</Label>
              <Textarea
                id="notes"
                value={taskForm.notes}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, notes: e.target.value })
                }
                rows={6}
                placeholder={t("taskForm.notesPlaceholder")}
              />
              <p className="text-xs text-gray-500 mt-1">
                {t("taskForm.notesHelp")}
              </p>
            </div>

            <DialogFooter className="sticky bottom-0 bg-white mt-6 -mx-6 px-6 pb-6 pt-4 border-t flex gap-2 justify-end">
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
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Archive Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{t("archives.title")}</DialogTitle>
            <button
              onClick={() => setShowArchiveModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={archiveSearchTerm}
                onChange={(e) => setArchiveSearchTerm(e.target.value)}
                placeholder={t("archives.search")}
                className="pl-9"
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <div
                className="inline-flex rounded-lg border border-gray-300"
                role="group"
              >
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      archive: { field: "completed", direction: "desc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 ${
                    sortConfig.archive.field === "completed" &&
                    sortConfig.archive.direction === "desc"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ArrowDown className="h-3 w-3" />
                  Recent
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      archive: { field: "completed", direction: "asc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.archive.field === "completed" &&
                    sortConfig.archive.direction === "asc"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ArrowUp className="h-3 w-3" />
                  Oldest
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      archive: { field: "priority", direction: "desc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.archive.field === "priority"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <AlertCircle className="h-3 w-3" />
                  Priority
                </button>
                <button
                  onClick={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      archive: { field: "title", direction: "asc" },
                    }))
                  }
                  className={`px-3 py-1.5 text-sm font-medium border-l flex items-center gap-1 ${
                    sortConfig.archive.field === "title"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Type className="h-3 w-3" />
                  A-Z
                </button>
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-3">
              {filteredArchivedTasks.map((task, idx) => (
                <Card
                  key={`archive-${task.id}-${idx}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Task ID Badge */}
                      <span className="px-3 py-1 text-xs font-mono bg-gray-600 text-white rounded flex-shrink-0">
                        {task.id}
                      </span>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-base font-semibold mb-2 cursor-pointer hover:text-blue-600"
                          onClick={() => showTaskDetail(task)}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          {task.priority && (
                            <span
                              className={`badge badge-priority ${task.priority}`}
                            >
                              {task.priority}
                            </span>
                          )}

                          {task.category && (
                            <span className="badge badge-category">
                              {task.category}
                            </span>
                          )}

                          {task.tags &&
                            task.tags.length > 0 &&
                            task.tags.map((tag) => (
                              <span key={tag} className="tag">
                                #{tag}
                              </span>
                            ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteArchivedTask(task.id);
                          }}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t("action.delete")}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            restoreArchivedTask(task.id);
                          }}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          {t("action.restore")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {archivedTasks.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  {t("archives.empty")}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Columns Modal */}
      <Dialog open={showColumnsModal} onOpenChange={setShowColumnsModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("columns.title")}</DialogTitle>
            <button
              onClick={() => setShowColumnsModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </DialogHeader>

          <p className="text-sm text-gray-500 mb-4">
            Manage your kanban board columns. Add, remove, or organize the
            status columns for your tasks.
          </p>

          <div className="space-y-3">
            {config.columns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
              >
                <div>
                  <span className="font-medium">{column.name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({column.id})
                  </span>
                </div>
                <Button
                  onClick={() => removeColumn(column.id)}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  {t("action.delete")}
                </Button>
              </div>
            ))}
            <Button onClick={addColumn} variant="default" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {t("columns.add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-600 text-white"
                : notification.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-blue-600 text-white"
            }`}
          >
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
