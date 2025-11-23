// Filter Store - Manages task filtering and searching
document.addEventListener('alpine:init', () => {
    Alpine.store('filters', {
        // Active filters
        activeFilters: [], // Array of {type: 'tag'|'category'|'user'|'priority', value: string}
        globalSearchTerm: '',
        archiveSearchTerm: '',

        // Filter bar visibility
        showFilterBar: false,

        // Available filter values (populated from tasks)
        availableTags: [],
        availableCategories: [],
        availableUsers: [],
        availablePriorities: [],

        // Initialize filters
        init() {
            this.updateAvailableFilters();
        },

        // Update available filter values from tasks
        updateAvailableFilters() {
            const taskStore = Alpine.store('tasks');
            const allTasks = [...taskStore.tasks, ...taskStore.archivedTasks];

            // Collect unique values
            const tags = new Set();
            const categories = new Set();
            const users = new Set();
            const priorities = new Set();

            allTasks.forEach(task => {
                // Tags
                task.tags.forEach(tag => tags.add(tag.replace('#', '')));

                // Category
                if (task.category) categories.add(task.category);

                // Users
                task.assignees.forEach(user => users.add(user));

                // Priority
                if (task.priority) priorities.add(task.priority);
            });

            // Add from config as well
            taskStore.config.tags?.forEach(tag => tags.add(tag));
            taskStore.config.categories?.forEach(cat => categories.add(cat));
            taskStore.config.users?.forEach(user => users.add(user));
            taskStore.config.priorities?.forEach(pri => priorities.add(pri));

            // Convert to arrays and sort
            this.availableTags = Array.from(tags).sort();
            this.availableCategories = Array.from(categories).sort();
            this.availableUsers = Array.from(users).sort();
            this.availablePriorities = Array.from(priorities);
        },

        // Add a filter
        addFilter(type, value) {
            if (!value || !value.trim()) return;

            // Check if filter already exists
            const exists = this.activeFilters.some(f =>
                f.type === type && f.value === value
            );

            if (!exists) {
                this.activeFilters.push({ type, value });
                console.log('Filter added:', type, value);
            }
        },

        // Remove a filter
        removeFilter(type, value) {
            this.activeFilters = this.activeFilters.filter(f =>
                !(f.type === type && f.value === value)
            );
            console.log('Filter removed:', type, value);
        },

        // Toggle a filter
        toggleFilter(type, value) {
            const exists = this.activeFilters.some(f =>
                f.type === type && f.value === value
            );

            if (exists) {
                this.removeFilter(type, value);
            } else {
                this.addFilter(type, value);
            }
        },

        // Clear all filters
        clearFilters() {
            this.activeFilters = [];
            this.globalSearchTerm = '';
            console.log('All filters cleared');
        },

        // Clear search
        clearSearch() {
            this.globalSearchTerm = '';
        },

        // Clear archive search
        clearArchiveSearch() {
            this.archiveSearchTerm = '';
        },

        // Check if a filter is active
        isFilterActive(type, value) {
            return this.activeFilters.some(f =>
                f.type === type && f.value === value
            );
        },

        // Get filtered tasks
        getFilteredTasks(tasks) {
            let filteredTasks = [...tasks];

            // Apply active filters
            this.activeFilters.forEach(filter => {
                filteredTasks = filteredTasks.filter(task => {
                    switch (filter.type) {
                        case 'tag':
                            return task.tags.some(tag =>
                                tag.replace('#', '') === filter.value
                            );

                        case 'category':
                            return task.category === filter.value;

                        case 'user':
                            return task.assignees.includes(filter.value);

                        case 'priority':
                            return task.priority === filter.value;

                        default:
                            return true;
                    }
                });
            });

            // Apply global search
            if (this.globalSearchTerm) {
                const searchLower = this.globalSearchTerm.toLowerCase();
                filteredTasks = filteredTasks.filter(task => {
                    return (
                        task.title.toLowerCase().includes(searchLower) ||
                        task.description.toLowerCase().includes(searchLower) ||
                        task.notes.toLowerCase().includes(searchLower) ||
                        task.id.toLowerCase().includes(searchLower) ||
                        task.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                        task.category?.toLowerCase().includes(searchLower) ||
                        task.assignees.some(user => user.toLowerCase().includes(searchLower))
                    );
                });
            }

            console.log(`Filtered ${tasks.length} tasks to ${filteredTasks.length}`);
            return filteredTasks;
        },

        // Get filtered archived tasks
        getFilteredArchivedTasks(tasks) {
            if (!this.archiveSearchTerm) return tasks;

            const searchLower = this.archiveSearchTerm.toLowerCase();
            return tasks.filter(task => {
                return (
                    task.title.toLowerCase().includes(searchLower) ||
                    task.description.toLowerCase().includes(searchLower) ||
                    task.notes.toLowerCase().includes(searchLower) ||
                    task.id.toLowerCase().includes(searchLower) ||
                    task.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                    task.category?.toLowerCase().includes(searchLower) ||
                    task.assignees.some(user => user.toLowerCase().includes(searchLower))
                );
            });
        },

        // Get tasks for a specific column (with filters applied)
        getColumnTasks(columnId) {
            const taskStore = Alpine.store('tasks');
            const columnTasks = taskStore.getColumnTasks(columnId);
            return this.getFilteredTasks(columnTasks);
        },

        // Toggle filter bar visibility
        toggleFilterBar() {
            this.showFilterBar = !this.showFilterBar;
        },

        // Get filter display label
        getFilterLabel(type, value) {
            switch (type) {
                case 'tag':
                    return `#${value}`;
                case 'category':
                    return `📁 ${value}`;
                case 'user':
                    return `👤 ${value}`;
                case 'priority':
                    return `⚡ ${value}`;
                default:
                    return value;
            }
        },

        // Get filter count
        getActiveFilterCount() {
            return this.activeFilters.length + (this.globalSearchTerm ? 1 : 0);
        },

        // Has active filters
        hasActiveFilters() {
            return this.activeFilters.length > 0 || this.globalSearchTerm !== '';
        },

        // Export filter state (for persistence)
        exportState() {
            return {
                activeFilters: this.activeFilters,
                globalSearchTerm: this.globalSearchTerm
            };
        },

        // Import filter state
        importState(state) {
            if (state.activeFilters) {
                this.activeFilters = state.activeFilters;
            }
            if (state.globalSearchTerm !== undefined) {
                this.globalSearchTerm = state.globalSearchTerm;
            }
        }
    });
});
