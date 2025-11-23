// UI Store - Manages UI state and modals
document.addEventListener("alpine:init", () => {
  Alpine.store("ui", {
    // Modal states
    showTaskModal: false,
    showTaskFormModal: false,
    showArchiveModal: false,
    showColumnsModal: false,
    showRenameModal: false,

    // Current states
    currentDetailTask: null,
    isEditMode: false,
    formSubtasks: [],
    editingTaskId: null,

    // Notification
    notification: {
      show: false,
      message: "",
      type: "success",
    },

    // Loading states
    isLoading: false,
    isSaving: false,

    // Project management
    showProjectSelector: false,
    recentProjects: [],

    // Form data (for task creation/editing)
    taskForm: {
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
    },

    // Form input helpers (for parsing)
    taskFormAssigneesInput: "",
    taskFormTagsInput: "",
    newSubtaskText: "",
    newSubtaskInput: "", // For adding subtasks in detail view

    // Initialize UI
    init() {
      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Load recent projects
      this.loadRecentProjects();
    },

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
      document.addEventListener("keydown", (e) => {
        // ESC key closes modals
        if (e.key === "Escape") {
          if (this.showTaskModal) this.closeTaskDetail();
          if (this.showTaskFormModal) this.closeTaskForm();
          if (this.showArchiveModal) this.closeArchive();
          if (this.showColumnsModal) this.closeColumns();
        }

        // Ctrl/Cmd + N for new task
        if ((e.ctrlKey || e.metaKey) && e.key === "n") {
          e.preventDefault();
          this.openTaskForm();
        }
      });
    },

    // Load recent projects
    async loadRecentProjects() {
      this.recentProjects = await window.fileSystem.loadRecentProjects();
      this.showProjectSelector = this.recentProjects.length > 0;
    },

    // Open task detail modal
    openTaskDetail(task) {
      this.currentDetailTask = task;
      this.showTaskModal = true;
    },

    // Close task detail modal
    closeTaskDetail() {
      this.showTaskModal = false;
      this.currentDetailTask = null;
    },

    // Open task form modal (for new or edit)
    openTaskForm(task = null) {
      if (task) {
        // Edit mode
        console.log("Opening task form for edit:", task);
        console.log("Task subtasks:", task.subtasks);

        this.isEditMode = true;
        this.editingTaskId = task.id;

        // Deep copy subtasks
        const subtasksCopy =
          task.subtasks && Array.isArray(task.subtasks)
            ? task.subtasks.map((st) => ({
                completed: st.completed,
                text: st.text,
              }))
            : [];

        console.log("Subtasks copy:", subtasksCopy);

        this.taskForm = {
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
        };

        this.formSubtasks = subtasksCopy;
        console.log("formSubtasks set to:", this.formSubtasks);

        // Populate input fields for assignees and tags
        this.taskFormAssigneesInput = this.formatAssignees(
          task.assignees || [],
        );
        this.taskFormTagsInput = this.formatTags(task.tags || []);
      } else {
        // New task mode
        this.isEditMode = false;
        this.editingTaskId = null;
        this.resetTaskForm();
      }

      this.showTaskFormModal = true;
    },

    // Close task form modal
    closeTaskForm() {
      this.showTaskFormModal = false;
      this.resetTaskForm();
    },

    // Reset task form
    resetTaskForm() {
      this.taskForm = {
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
      };
      this.formSubtasks = [];
      this.taskFormAssigneesInput = "";
      this.taskFormTagsInput = "";
      this.newSubtaskText = "";
    },

    // Submit task form
    async submitTaskForm() {
      if (!this.taskForm.title.trim()) {
        this.showNotification("Task title is required", "error");
        return;
      }

      // Prepare task data
      const taskData = {
        ...this.taskForm,
        assignees: this.taskForm.assignees.filter((a) => a.trim()),
        tags: this.taskForm.tags.filter((t) => t.trim()),
        subtasks: this.formSubtasks,
      };

      const taskStore = Alpine.store("tasks");

      if (this.isEditMode) {
        // Update existing task
        taskStore.updateTask(this.editingTaskId, taskData);
        this.showNotification(
          window.translationSystem.t("notif.taskEdited", {
            id: this.editingTaskId,
          }),
          "success",
        );
      } else {
        // Create new task
        const newTask = taskStore.addTask(taskData);
        this.showNotification(
          window.translationSystem.t("notif.taskCreated", { id: newTask.id }),
          "success",
        );
      }

      this.closeTaskForm();
    },

    // Add subtask to form
    addFormSubtask(text) {
      if (!text || !text.trim()) return;

      this.formSubtasks.push({
        completed: false,
        text: text.trim(),
      });
    },

    // Remove subtask from form
    removeFormSubtask(index) {
      this.formSubtasks.splice(index, 1);
    },

    // Toggle subtask completion in form
    toggleFormSubtask(index) {
      if (this.formSubtasks[index]) {
        this.formSubtasks[index].completed =
          !this.formSubtasks[index].completed;
      }
    },

    // Open archive modal
    openArchive() {
      this.showArchiveModal = true;
    },

    // Close archive modal
    closeArchive() {
      this.showArchiveModal = false;
    },

    // Open columns management modal
    openColumns() {
      this.showColumnsModal = true;
    },

    // Close columns modal
    closeColumns() {
      this.showColumnsModal = false;
    },

    // Show notification
    showNotification(message, type = "success") {
      this.notification = {
        show: true,
        message,
        type,
      };

      // Auto-hide after 3 seconds
      setTimeout(() => {
        this.notification.show = false;
      }, 3000);
    },

    // Archive current detail task
    async archiveCurrentTask() {
      if (!this.currentDetailTask) return;

      const confirmed = confirm(
        window.translationSystem.t("confirm.archiveTask", {
          title: this.currentDetailTask.title,
        }),
      );

      if (confirmed) {
        const taskStore = Alpine.store("tasks");
        taskStore.archiveTask(this.currentDetailTask.id);
        this.closeTaskDetail();
        this.showNotification(
          window.translationSystem.t("notif.taskArchived"),
          "success",
        );
      }
    },

    // Delete current detail task
    async deleteCurrentTask() {
      if (!this.currentDetailTask) return;

      const isArchived = this.currentDetailTask.status === "archived";
      const confirmKey = isArchived
        ? "confirm.deleteTaskFromArchive"
        : "confirm.deleteTask";

      const confirmed = confirm(
        window.translationSystem.t(confirmKey, {
          title: this.currentDetailTask.title,
        }),
      );

      if (confirmed) {
        const taskStore = Alpine.store("tasks");

        if (isArchived) {
          taskStore.deleteArchivedTask(this.currentDetailTask.id);
        } else {
          taskStore.deleteTask(this.currentDetailTask.id);
        }

        this.closeTaskDetail();
        this.showNotification(
          window.translationSystem.t("notif.taskDeleted"),
          "success",
        );
      }
    },

    // Edit current detail task
    editCurrentTask() {
      if (!this.currentDetailTask) return;

      this.closeTaskDetail();
      this.openTaskForm(this.currentDetailTask);
    },

    // Restore archived task
    async restoreArchivedTask(taskId, targetStatus = "todo") {
      const taskStore = Alpine.store("tasks");
      taskStore.restoreTask(taskId, targetStatus);

      this.showNotification(
        window.translationSystem.t("notif.taskRestored"),
        "success",
      );
    },

    // Set loading state
    setLoading(loading) {
      this.isLoading = loading;
    },

    // Set saving state
    setSaving(saving) {
      this.isSaving = saving;
    },

    // Parse tags from input string
    parseTags(tagString) {
      if (!tagString) return [];

      return tagString
        .split(/\s+/)
        .filter((tag) => tag.startsWith("#"))
        .map((tag) => tag.substring(1));
    },

    // Parse assignees from input string
    parseAssignees(assigneeString) {
      if (!assigneeString) return [];

      return assigneeString
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
    },

    // Format tags for display
    formatTags(tags) {
      return tags.map((tag) => "#" + tag).join(" ");
    },

    // Format assignees for display
    formatAssignees(assignees) {
      return assignees.join(", ");
    },

    // Update task form assignees from input string
    updateTaskFormAssignees() {
      this.taskForm.assignees = this.parseAssignees(
        this.taskFormAssigneesInput,
      );
    },

    // Update task form tags from input string
    updateTaskFormTags() {
      this.taskForm.tags = this.parseTags(this.taskFormTagsInput);
    },

    // Get priority class
    getPriorityClass(priority) {
      if (!priority) return "Default";

      const iconClasses = window.translationSystem.priorityIconClasses;

      // First, try to extract emoji from priority string
      const emoji = priority.match(/^(.)/)?.["1"] || "";
      if (iconClasses[emoji]) {
        return iconClasses[emoji];
      }

      // If no emoji, map text-based priorities to colors
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

      // Check if priority contains one of the text keywords
      for (const [key, color] of Object.entries(textPriorityMap)) {
        if (priority.toLowerCase().includes(key.toLowerCase())) {
          return color;
        }
      }

      return "Default";
    },
  });
});
