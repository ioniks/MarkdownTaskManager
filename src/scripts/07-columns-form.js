        function openColumnsModal() {
            const modal = document.getElementById('columnsModal');
            const list = document.getElementById('columnsList');
            list.innerHTML = config.columns.map((col, idx) => `
                <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem; padding: 0.75rem; background: var(--bg); border: 2px solid var(--border, #cbd5e0); border-radius: 6px; align-items: center;">
                    <div style="display: flex; gap: 0.25rem;">
                        <button onclick="moveColumn(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="${t('action.moveUp')}">↑</button>
                        <button onclick="moveColumn(${idx}, 1)" ${idx === config.columns.length - 1 ? 'disabled' : ''} class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.85rem;" title="${t('action.moveDown')}">↓</button>
                    </div>
                    <input type="text" value="${escapeHtml(col.name)}" onchange="updateColumn(${idx}, 'name', this.value)" style="flex: 1; padding: 0.5rem; border: 1px solid var(--border, #cbd5e0); border-radius: 4px; background: var(--bg); color: var(--text);">
                    <input type="text" value="${escapeHtml(col.id)}" onchange="updateColumn(${idx}, 'id', this.value)" style="width: 120px; padding: 0.5rem; border: 1px solid var(--border, #cbd5e0); border-radius: 4px; background: var(--bg); color: var(--text);" placeholder="ID">
                    <button onclick="deleteColumn(${idx})" class="btn btn-secondary" style="padding: 0.5rem;">🗑️</button>
                </div>
            `).join('');
            modal.classList.add('active');
        }

        function closeColumnsModal() {
            document.getElementById('columnsModal').classList.remove('active');
        }

        function addColumn() {
            const name = prompt(t('prompt.columnName'));
            const id = prompt(t('prompt.columnId'));
            if (name && id) {
                config.columns.push({ name, id });
                openColumnsModal();
                autoSave();
                renderKanban();
            }
        }

        function updateColumn(idx, field, value) {
            config.columns[idx][field] = value;
            autoSave();
            renderKanban();
        }

        function deleteColumn(idx) {
            if (confirm(t('confirm.deleteColumn'))) {
                config.columns.splice(idx, 1);
                openColumnsModal();
                autoSave();
                renderKanban();
            }
        }

        function moveColumn(idx, direction) {
            const newIdx = idx + direction;
            if (newIdx < 0 || newIdx >= config.columns.length) return;

            // Swap columns
            [config.columns[idx], config.columns[newIdx]] = [config.columns[newIdx], config.columns[idx]];

            openColumnsModal();
            autoSave();
            renderKanban();
        }

        // Task edit/create modal
        function openTaskModal(task = null, defaultColumnId = null) {
            isEditMode = !!task;
            const modal = document.getElementById('newTaskModal');
            const form = document.getElementById('newTaskForm');
            const title = modal.querySelector('h2');
            const submitBtn = document.getElementById('taskFormSubmitBtn');

            title.textContent = isEditMode ? t('taskForm.editTask') : t('taskForm.newTask');
            submitBtn.textContent = isEditMode ? t('taskForm.save') : t('taskForm.create');

            // Populate columns select
            document.getElementById('taskStatus').innerHTML = config.columns.map(col =>
                `<option value="${escapeHtml(col.id)}">${escapeHtml(col.name)}</option>`
            ).join('');

            // Populate priorities select
            document.getElementById('taskPriority').innerHTML = config.priorities.map(priority =>
                `<option value="${clean(priority)}">${displayPriority(priority)}</option>`
            ).join('');

            // Update autocomplete
            updateAutocomplete();

            if (isEditMode) {
                document.getElementById('taskEditId').value = task.id;
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskStatus').value = task.status;
                document.getElementById('taskPriority').value = task.priority || '';
                document.getElementById('taskCategory').value = task.category || '';
                document.getElementById('taskAssignee').value = task.assignees.join(', ');
                document.getElementById('taskCreated').value = task.created || '';
                document.getElementById('taskStarted').value = task.started || '';
                document.getElementById('taskDue').value = task.due || '';
                document.getElementById('taskCompleted').value = task.completed || '';
                document.getElementById('taskTags').value = task.tags.join(' ');
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskNotes').value = task.notes || '';
                formSubtasks = JSON.parse(JSON.stringify(task.subtasks || []));
            } else {
                form.reset();
                document.getElementById('taskEditId').value = '';
                if (defaultColumnId) {
                    document.getElementById('taskStatus').value = defaultColumnId;
                }
                formSubtasks = [];
            }

            renderFormSubtasks();
            modal.classList.add('active');
        }

        function closeTaskModal() {
            document.getElementById('newTaskModal').classList.remove('active');
            document.getElementById('newTaskForm').reset();
            formSubtasks = [];
            isEditMode = false;
        }

        // Form subtasks management
        function renderFormSubtasks() {
            const list = document.getElementById('formSubtasksList');
            list.innerHTML = formSubtasks.map((st, idx) => `
                <li style="padding: 0.5rem; margin-bottom: 0.25rem; background: var(--bg); border: 1px solid var(--border, #cbd5e0); border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;">
                    <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="toggleFormSubtask(${idx})" style="width: 16px; height: 16px; cursor: pointer;">
                    <span style="flex: 1; ${st.completed ? 'text-decoration: line-through; color: #999;' : ''}">${st.text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                    <button type="button" onclick="deleteFormSubtask(${idx})" style="background: none; border: none; cursor: pointer; color: #e53e3e; font-size: 1rem;">🗑️</button>
                </li>
            `).join('');
        }

        function addFormSubtask() {
            const input = document.getElementById('formSubtaskInput');
            const text = input.value.trim();
            if (!text) return;
            formSubtasks.push({ completed: false, text });
            input.value = '';
            renderFormSubtasks();
        }

        function toggleFormSubtask(idx) {
            if (formSubtasks[idx]) {
                formSubtasks[idx].completed = !formSubtasks[idx].completed;
                renderFormSubtasks();
            }
        }

        function deleteFormSubtask(idx) {
            formSubtasks.splice(idx, 1);
            renderFormSubtasks();
        }

        // Render Kanban board
