        async function autoSave() {
            if (!kanbanFileHandle) return false;
            try {
                const newContent = generateMarkdown();
                const writable = await kanbanFileHandle.createWritable();
                await writable.write(newContent);
                await writable.close();
                currentKanbanContent = newContent;
                console.log('Auto-saved');
                return true;
            } catch (error) {
                console.error('Auto-save failed:', error);
                return false;
            }
        }

        // Helper function to normalize user identifier (extract @username from @username (Display Name))
        function normalizeUserId(userString) {
            if (!userString) return '';
            // Extract @username before the space or parenthesis
            const match = userString.match(/^(@[^\s(]+)/);
            return match ? match[1] : userString;
        }

        // Helper function to get full user format from user ID
        function getUserFullFormat(userId) {
            // Resolve "@user (Name)" from the runtime union (config + active + archived tasks),
            // not just config.users: a user that lives only on a task must still show its full
            // name in filter badges now that config no longer absorbs task-derived users.
            const match = extractUniqueValues().users.find(u => normalizeUserId(u) === userId);
            return match || userId;
        }

        // Extract unique values for autocomplete (including historical archived data)
        function extractUniqueValues() {
            // Start with values from config (always keep these)
            const categories = new Set(config.categories || []);
            const userMap = new Map(); // Map from normalized ID to full format
            const tags = new Set(config.tags || []);

            // First, add config users (these have the full format with display names)
            (config.users || []).forEach(u => {
                const normalizedId = normalizeUserId(u);
                if (!userMap.has(normalizedId)) {
                    userMap.set(normalizedId, u);
                }
            });

            // Extract from active tasks
            tasks.forEach(t => {
                if (t.category) categories.add(t.category);
                t.assignees.forEach(u => {
                    const normalizedId = normalizeUserId(u);
                    // Only add if not already in map (prefer config version)
                    if (!userMap.has(normalizedId)) {
                        userMap.set(normalizedId, u);
                    }
                });
                t.tags.forEach(tag => tags.add(tag.replace('#', '')));
            });

            // Extract from archived tasks (historical data)
            archivedTasks.forEach(t => {
                if (t.category) categories.add(t.category);
                t.assignees.forEach(u => {
                    const normalizedId = normalizeUserId(u);
                    if (!userMap.has(normalizedId)) {
                        userMap.set(normalizedId, u);
                    }
                });
                t.tags.forEach(tag => tags.add(tag.replace('#', '')));
            });

            return { categories: [...categories], users: [...userMap.values()], tags: [...tags] };
        }

        // Update autocomplete datalists and filter selects
        function updateAutocomplete() {
            const { categories, users, tags } = extractUniqueValues();

            // Update form datalists (keep full format for proper storage). Escape values: they can
            // come from a shared kanban.md, and an <option value> is an HTML attribute → XSS sink.
            document.getElementById('categoriesList').innerHTML = categories.map(c => `<option value="${escapeHtml(c)}">`).join('');
            document.getElementById('usersList').innerHTML = users.map(u => `<option value="${escapeHtml(u)}">`).join('');
            document.getElementById('tagsList').innerHTML = tags.map(t => `<option value="${escapeHtml(t)}">`).join('');

            // Update filter selects
            document.getElementById('filterTagSelect').innerHTML = `<option value="">${t('filters.select')}</option>` + tags.map(t => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join('');
            document.getElementById('filterCategorySelect').innerHTML = `<option value="">${t('filters.select')}</option>` + categories.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
            document.getElementById('filterUserSelect').innerHTML = `<option value="">${t('filters.select')}</option>` + users.map(u => {
                const normalizedId = normalizeUserId(u);
                return `<option value="${escapeHtml(normalizedId)}">${escapeHtml(u)}</option>`;
            }).join('');

            // Update priority filter select from config
            const priorities = (config.priorities || []);
            document.getElementById('filterPrioritySelect').innerHTML = `<option value="">${t('filters.select')}</option>` + priorities.map((p, i) => `<option value="${clean(p)}">${displayPriority(p)}</option>`).join('');
        }

        // Filter functions
        function addFilter(type) {
            let value;
            if (type === 'tag') {
                value = document.getElementById('filterTagSelect').value;
                document.getElementById('filterTagSelect').value = '';
            } else if (type === 'category') {
                value = document.getElementById('filterCategorySelect').value;
                document.getElementById('filterCategorySelect').value = '';
            } else if (type === 'user') {
                value = document.getElementById('filterUserSelect').value;
                document.getElementById('filterUserSelect').value = '';
            } else if (type === 'priority') {
                value = document.getElementById('filterPrioritySelect').value;
                document.getElementById('filterPrioritySelect').value = '';
            }

            if (value && !activeFilters.find(f => f.type === type && f.value === value)) {
                activeFilters.push({ type, value });
                renderFilters();
                renderKanban();
            }
        }

        function removeFilter(idx) {
            activeFilters.splice(idx, 1);
            renderFilters();
            renderKanban();
        }

        function clearFilters() {
            activeFilters = [];
            renderFilters();
            renderKanban();
        }

        // Global search functions
        function applyGlobalSearch() {
            const input = document.getElementById('globalSearchInput');
            const clearBtn = document.getElementById('clearGlobalSearch');
            globalSearchTerm = input.value.trim();

            // Show/hide clear button
            clearBtn.style.display = globalSearchTerm ? 'block' : 'none';

            // Re-render kanban with search filter
            renderKanban();
        }

        function clearGlobalSearch() {
            const input = document.getElementById('globalSearchInput');
            const clearBtn = document.getElementById('clearGlobalSearch');
            input.value = '';
            globalSearchTerm = '';
            clearBtn.style.display = 'none';
            renderKanban();
        }

        function renderFilters() {
            const container = document.getElementById('activeFilters');
            const colors = {
                tag: '#3b82f6',      // Blue
                category: '#8b5cf6', // Purple
                user: '#10b981',     // Green
                priority: '#f59e0b'  // Orange
            };

            container.innerHTML = activeFilters.map((f, idx) => {
                const escapedValue = f.value.replace(/'/g, "\\'");

                // Determine display value based on filter type
                let displayValue = f.value;

                // For priority filters, display with prefix/emoji from config
                if (f.type === 'priority' && config.priorities) {
                    const priority = config.priorities.find(p => clean(p) === f.value);
                    if (priority) {
                        displayValue = priority;
                    }
                }

                // For user filters, display with full format from config
                if (f.type === 'user') {
                    const fullUserFormat = getUserFullFormat(f.value);
                    displayValue = fullUserFormat;
                }

                return `
                <span style="background: ${colors[f.type]}; color: white; padding: 0.35rem 0.75rem; border-radius: 16px; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 500;">
                    ${displayPriority(displayValue)}
                    <button onclick="removeFilter(${idx})" style="background: none; border: none; color: white; cursor: pointer; padding: 0; font-weight: bold; font-size: 1.1rem; line-height: 1;" title="Supprimer ce filtre">✕</button>
                </span>
                `;
            }).join('');
        }

        function matchesFilters(task) {
            // Check active filters (tags, category, user, priority)
            if (activeFilters.length > 0) {
                const matchesActiveFilters = activeFilters.every(filter => {
                    if (filter.type === 'tag') {
                        return task.tags.includes(filter.value) || task.tags.includes('#' + filter.value);
                    } else if (filter.type === 'category') {
                        return task.category === filter.value;
                    } else if (filter.type === 'user') {
                        // Normalize both the filter value and task assignees for comparison
                        return task.assignees.some(assignee => normalizeUserId(assignee) === filter.value);
                    } else if (filter.type === 'priority') {
                        return task.priority === filter.value;
                    }
                    return false;
                });
                if (!matchesActiveFilters) return false;
            }

            // Check global search term (searches in title, description, and notes)
            if (globalSearchTerm) {
                const searchLower = globalSearchTerm.toLowerCase();
                const matchesSearch =
                    (task.title && task.title.toLowerCase().includes(searchLower)) ||
                    (task.description && task.description.toLowerCase().includes(searchLower)) ||
                    (task.notes && task.notes.toLowerCase().includes(searchLower));
                if (!matchesSearch) return false;
            }

            return true;
        }

        // Click to add filter
        function clickToFilter(type, value) {
            if (!activeFilters.find(f => f.type === type && f.value === value)) {
                activeFilters.push({ type, value });
                renderFilters();
                renderKanban();
            }
        }

        // Column management
