// Task Store - Main data store for tasks and configuration
document.addEventListener('alpine:init', () => {
    Alpine.store('tasks', {
        // State
        tasks: [],
        config: {
            lastTaskId: 0,
            columns: [],
            categories: [],
            users: [],
            priorities: [],
            tags: []
        },
        directoryHandle: null,
        kanbanFileHandle: null,
        archivedTasks: [],
        archiveFileHandle: null,

        // Initialize store
        init() {
            // Set default config if needed
            if (this.config.columns.length === 0) {
                this.config.columns = [
                    { name: '📝 To Do', id: 'todo' },
                    { name: '🚀 In Progress', id: 'in-progress' },
                    { name: '👀 In Review', id: 'in-review' },
                    { name: '✅ Done', id: 'done' }
                ];
            }
        },

        // Load kanban file
        async loadFile(dirHandle) {
            try {
                this.directoryHandle = dirHandle;

                // Load kanban.md
                const kanbanResult = await window.fileSystem.loadKanbanFile(dirHandle);
                this.kanbanFileHandle = kanbanResult.fileHandle;

                // Parse content
                const parsed = window.markdownParser.parseMarkdown(kanbanResult.content);
                this.tasks = parsed.tasks;
                this.config = parsed.config;

                // Set current content for file watcher
                window.fileWatcher.setCurrentContent(kanbanResult.content);

                // Load archive.md
                const archiveResult = await window.fileSystem.loadArchiveFile(dirHandle);
                this.archiveFileHandle = archiveResult.fileHandle;
                this.archivedTasks = window.markdownParser.parseArchive(archiveResult.content);

                // Start file watcher
                this.startWatching();

                return true;
            } catch (error) {
                console.error('Error loading files:', error);
                return false;
            }
        },

        // Save kanban file
        async saveFile() {
            if (!this.kanbanFileHandle) return false;

            const content = window.markdownParser.generateMarkdown(this.tasks, this.config);
            await window.fileWatcher.autoSave(this.kanbanFileHandle, () => content);
            return true;
        },

        // Save archive file
        async saveArchive() {
            if (!this.archiveFileHandle) return false;

            const content = window.markdownParser.generateArchiveMarkdown(this.archivedTasks);
            return await window.fileSystem.saveArchiveFile(content);
        },

        // Add new task
        addTask(taskData) {
            // Generate new task ID
            this.config.lastTaskId++;
            const taskId = 'TASK-' + String(this.config.lastTaskId).padStart(3, '0');

            // Create task object
            const newTask = {
                id: taskId,
                title: taskData.title || '',
                status: taskData.status || 'todo',
                priority: taskData.priority || '',
                category: taskData.category || '',
                assignees: taskData.assignees || [],
                tags: taskData.tags || [],
                created: taskData.created || new Date().toISOString().split('T')[0],
                started: taskData.started || '',
                due: taskData.due || '',
                completed: taskData.completed || '',
                description: taskData.description || '',
                subtasks: taskData.subtasks || [],
                notes: taskData.notes || ''
            };

            // Add to tasks array
            this.tasks.push(newTask);

            // Save to file
            this.saveFile();

            return newTask;
        },

        // Update existing task
        updateTask(taskId, updates) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;

            // Check if status changed
            const oldStatus = this.tasks[taskIndex].status;

            // Update task
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };

            // If status changed, trigger reorganization
            if (oldStatus !== updates.status && updates.status) {
                window.markdownParser.scheduleStatusReorganization(
                    this.tasks,
                    this.config,
                    (content) => this.saveFile()
                );
            } else {
                // Normal save
                this.saveFile();
            }

            return true;
        },

        // Delete task
        deleteTask(taskId) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;

            this.tasks.splice(taskIndex, 1);
            this.saveFile();
            return true;
        },

        // Move task to different column
        moveTask(taskId, newStatus) {
            return this.updateTask(taskId, { status: newStatus });
        },

        // Archive task
        archiveTask(taskId) {
            const taskIndex = this.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;

            const task = this.tasks[taskIndex];

            // Add to archived tasks
            this.archivedTasks.push({ ...task, status: 'archived' });

            // Remove from active tasks
            this.tasks.splice(taskIndex, 1);

            // Save both files
            this.saveFile();
            this.saveArchive();

            return true;
        },

        // Restore task from archive
        restoreTask(taskId, targetStatus) {
            const taskIndex = this.archivedTasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;

            const task = this.archivedTasks[taskIndex];

            // Restore to tasks with target status
            this.tasks.push({ ...task, status: targetStatus || 'todo' });

            // Remove from archive
            this.archivedTasks.splice(taskIndex, 1);

            // Save both files
            this.saveFile();
            this.saveArchive();

            return true;
        },

        // Permanently delete from archive
        deleteArchivedTask(taskId) {
            const taskIndex = this.archivedTasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;

            this.archivedTasks.splice(taskIndex, 1);
            this.saveArchive();

            return true;
        },

        // Get tasks by column
        getColumnTasks(columnId) {
            return this.tasks.filter(t => t.status === columnId);
        },

        // Get task by ID
        getTaskById(taskId) {
            return this.tasks.find(t => t.id === taskId) ||
                   this.archivedTasks.find(t => t.id === taskId);
        },

        // Update column configuration
        updateColumns(columns) {
            this.config.columns = columns;
            this.saveFile();
        },

        // Add column
        addColumn(name, id) {
            this.config.columns.push({ name, id });
            this.saveFile();
        },

        // Remove column
        removeColumn(columnId) {
            // Move all tasks from this column to first column
            const firstColumnId = this.config.columns[0]?.id || 'todo';
            this.tasks.forEach(task => {
                if (task.status === columnId) {
                    task.status = firstColumnId;
                }
            });

            // Remove column from config
            this.config.columns = this.config.columns.filter(c => c.id !== columnId);
            this.saveFile();
        },

        // Update subtask
        updateSubtask(taskId, subtaskIndex, completed) {
            const task = this.getTaskById(taskId);
            if (!task || !task.subtasks[subtaskIndex]) return false;

            task.subtasks[subtaskIndex].completed = completed;

            if (this.archivedTasks.includes(task)) {
                this.saveArchive();
            } else {
                this.saveFile();
            }

            return true;
        },

        // Start file watching
        startWatching() {
            window.fileWatcher.startFileWatcher(this.kanbanFileHandle, {
                onExternalChange: (newContent) => {
                    // Save old tasks for comparison
                    const oldTasks = [...this.tasks];

                    // Parse new content
                    const parsed = window.markdownParser.parseMarkdown(newContent);
                    this.tasks = parsed.tasks;
                    this.config = parsed.config;

                    // Apply changes with callbacks
                    window.fileWatcher.applyExternalChanges(oldTasks, this.tasks, {
                        onTaskRemoved: (task) => {
                            // Task was removed externally
                            console.log('Task removed:', task.id);
                        },
                        onTaskAdded: (task) => {
                            // Task was added externally
                            console.log('Task added:', task.id);
                        },
                        onTaskMoved: (task, oldStatus) => {
                            // Task was moved externally
                            console.log('Task moved:', task.id);
                        },
                        onTaskUpdated: (task) => {
                            // Task was updated externally
                            console.log('Task updated:', task.id);
                        },
                        onReorganizeNeeded: () => {
                            // Reorganize file after status changes
                            this.saveFile();
                        }
                    });

                    // Show notification
                    Alpine.store('ui').showNotification('File updated from external source', 'info');
                }
            });
        },

        // Stop file watching
        stopWatching() {
            window.fileWatcher.stopFileWatcher();
        }
    });
});
