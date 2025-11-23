// Main Alpine.js application component
document.addEventListener('alpine:init', () => {
    Alpine.data('taskManager', () => ({
        // Initialization
        async init() {
            console.log('Initializing Task Manager...');

            // Initialize language
            window.translationSystem.initLanguage();

            // Initialize stores
            this.$store.tasks.init();
            this.$store.ui.init();
            this.$store.filters.init();

            // Try to restore previous directory
            await this.tryRestorePreviousDirectory();

            // Setup drag and drop
            this.setupDragAndDrop();

            // Setup global event listeners
            this.setupEventListeners();

            console.log('Task Manager initialized');
        },

        // Computed properties using stores
        get tasks() {
            return this.$store.tasks.tasks;
        },

        get config() {
            return this.$store.tasks.config;
        },

        get filteredTasks() {
            return this.$store.filters.getFilteredTasks(this.tasks);
        },

        get hasActiveTasks() {
            return this.tasks.length > 0;
        },

        get currentLanguage() {
            return window.translationSystem.getCurrentLanguage();
        },

        get showWelcome() {
            return !this.$store.tasks.directoryHandle;
        },

        // Translation helper
        t(key, params) {
            return window.translationSystem.t(key, params);
        },

        // Change language
        setLanguage(lang) {
            window.translationSystem.setLanguage(lang);
            // Force Alpine reactivity
            this.$nextTick();
        },

        // Try to restore previous directory
        async tryRestorePreviousDirectory() {
            const lastSelectedProjectName = localStorage.getItem('lastSelectedProject');
            console.log('Last selected project:', lastSelectedProjectName);

            const projects = await window.fileSystem.loadRecentProjects();
            let projectToRestore = null;

            if (lastSelectedProjectName) {
                projectToRestore = projects.find(p => p.name === lastSelectedProjectName);
            }

            // Fallback to most recent project
            if (!projectToRestore && projects.length > 0) {
                projectToRestore = projects[0];
            }

            if (projectToRestore) {
                try {
                    console.log('Verifying permissions for:', projectToRestore.name);
                    if (await window.fileSystem.verifyPermission(projectToRestore.handle)) {
                        console.log('Permission granted, loading kanban file...');

                        await this.$store.tasks.loadFile(projectToRestore.handle);

                        // Save the restored project name
                        localStorage.setItem('lastSelectedProject', projectToRestore.name);

                        this.$store.ui.showNotification(
                            this.t('notif.projectRestored'),
                            'success'
                        );

                        return true;
                    }
                } catch (error) {
                    console.error('Could not restore previous directory:', error);
                }
            }

            return false;
        },

        // Select folder
        async selectFolder() {
            try {
                const handle = await window.fileSystem.requestDirectoryAccess(
                    this.$store.tasks.directoryHandle
                );

                if (!handle) return; // User cancelled

                // Save the selected project
                await window.fileSystem.saveDirectoryHandle(handle);
                localStorage.setItem('lastSelectedProject', handle.name);

                // Load files
                await this.$store.tasks.loadFile(handle);

                // Update filters
                this.$store.filters.updateAvailableFilters();

                this.$store.ui.showNotification(
                    this.t('notif.folderLoaded'),
                    'success'
                );
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.$store.ui.showNotification(
                        this.t('notif.folderError'),
                        'error'
                    );
                    console.error(error);
                }
            }
        },

        // Switch project
        async switchProject(projectIndex) {
            const projects = await window.fileSystem.loadRecentProjects();
            const project = projects[projectIndex];

            if (!project) return;

            try {
                if (await window.fileSystem.verifyPermission(project.handle)) {
                    await this.$store.tasks.loadFile(project.handle);

                    localStorage.setItem('lastSelectedProject', project.name);

                    this.$store.ui.showNotification(
                        this.t('notif.projectLoaded', { name: project.displayName || project.name }),
                        'success'
                    );
                } else {
                    this.$store.ui.showNotification(
                        this.t('notif.permissionDenied'),
                        'error'
                    );
                }
            } catch (error) {
                console.error('Error switching project:', error);
                this.$store.ui.showNotification(
                    this.t('notif.projectError'),
                    'error'
                );
            }
        },

        // Rename current project
        async renameCurrentProject() {
            const projects = await window.fileSystem.loadRecentProjects();
            const currentProject = projects.find(p =>
                p.handle === this.$store.tasks.directoryHandle
            );

            if (!currentProject) return;

            const newName = prompt(
                this.t('prompt.renameProject'),
                currentProject.displayName || currentProject.name
            );

            if (newName && newName.trim()) {
                const projectIndex = projects.indexOf(currentProject);
                if (await window.fileSystem.renameProject(projectIndex, newName.trim())) {
                    this.$store.ui.showNotification(
                        this.t('notif.projectRenamed'),
                        'success'
                    );
                    await this.$store.ui.loadRecentProjects();
                }
            }
        },

        // Delete current project from recents
        async deleteCurrentProject() {
            const projects = await window.fileSystem.loadRecentProjects();
            const currentProject = projects.find(p =>
                p.handle === this.$store.tasks.directoryHandle
            );

            if (!currentProject) return;

            const confirmed = confirm(
                this.t('confirm.deleteProject', {
                    name: currentProject.displayName || currentProject.name
                })
            );

            if (confirmed) {
                const projectIndex = projects.indexOf(currentProject);
                if (await window.fileSystem.deleteProjectFromRecents(projectIndex)) {
                    this.$store.ui.showNotification(
                        this.t('notif.projectDeleted'),
                        'success'
                    );

                    // Clear current project
                    this.$store.tasks.directoryHandle = null;
                    localStorage.removeItem('lastSelectedProject');

                    // Reload UI
                    await this.$store.ui.loadRecentProjects();
                }
            }
        },

        // Get tasks for a column (filtered)
        getColumnTasks(columnId) {
            return this.$store.filters.getColumnTasks(columnId);
        },

        // Get column task count
        getColumnCount(columnId) {
            return this.getColumnTasks(columnId).length;
        },

        // Show task detail
        showTaskDetail(task) {
            this.$store.ui.openTaskDetail(task);
        },

        // Create new task
        createTask() {
            this.$store.ui.openTaskForm();
        },

        // Setup drag and drop
        setupDragAndDrop() {
            // Store dragged task
            this.draggedTask = null;

            // Prevent browser default drag behavior
            document.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            document.addEventListener('drop', (e) => {
                const dropZone = e.target.closest('.task-list');
                if (!dropZone) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        },

        // Drag start handler
        handleDragStart(e, task) {
            this.draggedTask = task;
            e.dataTransfer.effectAllowed = 'move';
            e.target.classList.add('dragging');
        },

        // Drag end handler
        handleDragEnd(e) {
            e.target.classList.remove('dragging');
            this.draggedTask = null;
        },

        // Drag over handler
        handleDragOver(e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        },

        // Drop handler
        handleDrop(e, columnId) {
            e.preventDefault();

            if (!this.draggedTask) return;

            // Move task to new column
            this.$store.tasks.moveTask(this.draggedTask.id, columnId);

            this.$store.ui.showNotification(
                this.t('notif.taskMoved'),
                'info'
            );

            this.draggedTask = null;
        },

        // Toggle subtask
        toggleSubtask(taskId, subtaskIndex) {
            const task = this.$store.tasks.getTaskById(taskId);
            if (!task || !task.subtasks[subtaskIndex]) return;

            const newState = !task.subtasks[subtaskIndex].completed;
            this.$store.tasks.updateSubtask(taskId, subtaskIndex, newState);
        },

        // Add column
        async addColumn() {
            const name = prompt(this.t('prompt.columnName'));
            if (!name || !name.trim()) return;

            const id = prompt(this.t('prompt.columnId'));
            if (!id || !id.trim()) return;

            this.$store.tasks.addColumn(name.trim(), id.trim());
        },

        // Remove column
        async removeColumn(columnId) {
            const confirmed = confirm(this.t('confirm.deleteColumn'));
            if (!confirmed) return;

            this.$store.tasks.removeColumn(columnId);
        },

        // Setup event listeners
        setupEventListeners() {
            // Clean up file watcher on page unload
            window.addEventListener('beforeunload', () => {
                this.$store.tasks.stopWatching();
            });

            // Handle visibility change (pause/resume file watcher)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('Page hidden, pausing file watcher');
                    this.$store.tasks.stopWatching();
                } else {
                    console.log('Page visible, resuming file watcher');
                    if (this.$store.tasks.kanbanFileHandle) {
                        this.$store.tasks.startWatching();
                    }
                }
            });
        },

        // Get priority icon class
        getPriorityClass(priority) {
            return this.$store.ui.getPriorityClass(priority);
        },

        // Format date for display
        formatDate(dateString) {
            if (!dateString) return '';

            const date = new Date(dateString);
            const today = new Date();
            const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Tomorrow';
            if (diffDays === -1) return 'Yesterday';
            if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
            if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

            return dateString;
        },

        // Get subtask progress
        getSubtaskProgress(subtasks) {
            if (!subtasks || subtasks.length === 0) return { completed: 0, total: 0, percentage: 0 };

            const completed = subtasks.filter(st => st.completed).length;
            const total = subtasks.length;
            const percentage = Math.round((completed / total) * 100);

            return { completed, total, percentage };
        },

        // Check if browser is supported
        checkBrowserSupport() {
            if (!('showDirectoryPicker' in window)) {
                alert(this.t('alert.browserNotSupported'));
                return false;
            }
            return true;
        }
    }));
});
