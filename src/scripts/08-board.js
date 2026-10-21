        function renderKanban() {
            const board = document.getElementById('kanbanBoard');
            board.innerHTML = '';

            console.log('Rendering kanban with', tasks.length, 'tasks');

            // Nothing loaded yet (e.g. language switched on the welcome screen): skip rendering
            if (!config.columns || config.columns.length === 0) {
                return;
            }

            // Debug info
            const debugInfo = document.getElementById('debugInfo');
            debugInfo.textContent = `Loaded ${tasks.length} tasks\nColumns: ${config.columns.map(c => c.name).join(', ')}`;
            // debugInfo.style.display = 'block'; // Uncomment to show debug info

            config.columns.forEach(column => {
                const columnTasks = tasks.filter(t => t.status === column.id && matchesFilters(t));
                console.log(`Column ${column.id}: ${columnTasks.length} tasks`);

                const columnEl = document.createElement('div');
                columnEl.className = 'kanban-column';
                columnEl.dataset.columnId = column.id;

                columnEl.innerHTML = `
                    <div class="column-header">
                        <div class="column-title">
                            ${escapeHtml(column.name)}
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div class="column-count">${columnTasks.length}</div>
                            <button class="column-add-btn">+</button>
                        </div>
                    </div>
                    <div class="task-list" ondrop="drop(event)" ondragover="allowDrop(event)">
                        ${columnTasks.length === 0 ? `<div class="empty-state">${t('empty.noTasks')}</div>` : ''}
                    </div>
                `;

                const taskList = columnEl.querySelector('.task-list');

                // Bind the per-column "+" handler in JS (no inline onclick) so the
                // column id is passed as a value, never concatenated into HTML.
                const addBtn = columnEl.querySelector('.column-add-btn');
                addBtn.title = t('taskForm.newTask');
                addBtn.addEventListener('click', () => openTaskModal(null, column.id));

                columnTasks.forEach((task, idx) => {
                    const taskEl = createTaskElement(task, idx === 0, idx === columnTasks.length - 1);
                    taskList.appendChild(taskEl);
                });

                board.appendChild(columnEl);
            });
        }

        // Deadline visibility: classify a task by its **Due** date so the card can surface it.
        // Returns 'overdue' (due date is before today), 'soon' (due within the next 2 days,
        // today included), or null. A task with a Finished date (task.completed) is never flagged
        // — it's done. Dates are compared at LOCAL midnight (parsed field-by-field, not via
        // new Date("YYYY-MM-DD") which is UTC) to avoid a timezone off-by-one near midnight.
        function dueStatus(task) {
            if (!task.due || task.completed) return null;
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(task.due.trim());
            if (!m) return null;
            const due = new Date(+m[1], +m[2] - 1, +m[3]);
            // Reject impossible calendar dates: JS rolls "2026-02-31" over to 2026-03-03, which
            // isNaN never catches — verify the constructed date matches the parsed fields.
            if (due.getFullYear() !== +m[1] || due.getMonth() !== +m[2] - 1 || due.getDate() !== +m[3]) return null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const days = Math.round((due - today) / 86400000);
            if (days < 0) return 'overdue';
            if (days <= 2) return 'soon';
            return null;
        }

        // Create task element. isFirst/isLast (position among the column's visible cards) disable
        // the matching ↑/↓ reorder button.
        function createTaskElement(task, isFirst = false, isLast = false) {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-card';
            taskEl.draggable = true;
            taskEl.dataset.taskId = task.id;
            // Reachable with Tab / arrow keys (issue #24)
            taskEl.tabIndex = 0;
            taskEl.setAttribute('aria-label', `${task.id}: ${task.title}`);

            // Deadline accent on the card border (red overdue / orange due-soon).
            const due = dueStatus(task);
            if (due) taskEl.classList.add(`task-card--${due}`);

            var priorityBadgeClass = "Default";
            if (config.priorities) {
                const priority = config.priorities.find(p => clean(p) === task.priority);
                if (priority) {
                    const emoji = getFirstEmoji(priority);
                    if (emoji && priorityIconClasses[emoji]) {
                        priorityBadgeClass = priorityIconClasses[emoji];
                    }
                }
            }

            const subtaskProgress = task.subtasks.length > 0 ?
                `<div class="task-subtasks">
                    <div class="subtask-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(task.subtasks.filter(s => s.completed).length / task.subtasks.length * 100)}%"></div>
                        </div>
                        <span>${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}</span>
                    </div>
                </div>` : '';

            taskEl.innerHTML = `
                <div class="task-header">
                    <span class="task-id">${escapeHtml(task.id)}</span>
                    <div class="task-header-actions">
                        <button class="task-order-btn" data-move="up" aria-disabled="${isFirst}" title="${escapeHtml(t('action.moveUp'))}" aria-label="${escapeHtml(t('action.moveUp'))}">↑</button>
                        <button class="task-order-btn" data-move="down" aria-disabled="${isLast}" title="${escapeHtml(t('action.moveDown'))}" aria-label="${escapeHtml(t('action.moveDown'))}">↓</button>
                        <button class="task-edit-btn" data-edit-task="1" style="background: none; border: none; cursor: pointer; font-size: 1.1rem; padding: 0.25rem;">✏️</button>
                    </div>
                </div>
                <div class="task-title">${escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${markdownToHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    ${task.due ? `<span class="badge badge-due${due ? ` badge-due--${due}` : ''}" title="${escapeHtml(t(due === 'overdue' ? 'tooltip.overdue' : (due === 'soon' ? 'tooltip.dueSoon' : 'meta.due')))}">${due === 'overdue' ? '⚠️' : '📅'} ${escapeHtml(task.due)}</span>` : ''}
                    ${task.priority ? `<span class="badge badge-priority ${priorityBadgeClass}" data-filter="priority" data-filter-value="${escapeHtml(task.priority)}" style="cursor: pointer;" title="${t('tooltip.filterByPriority')}">${escapeHtml(displayPriority(task.priority))}</span>` : ''}
                    ${task.category ? `<span class="badge badge-category" data-filter="category" data-filter-value="${escapeHtml(task.category)}" style="cursor: pointer;" title="${t('tooltip.filterByCategory')}">${escapeHtml(task.category)}</span>` : ''}
                    ${task.assignees.map(a => {
                        const normalizedId = normalizeUserId(a);
                        return `<span class="badge badge-assignee" data-filter="user" data-filter-value="${escapeHtml(normalizedId)}" style="cursor: pointer;" title="${t('tooltip.filterByUser')}">${escapeHtml(a)}</span>`;
                    }).join('')}
                    ${task.tags.map(tag => `<span class="tag" data-filter="tag" data-filter-value="${escapeHtml(tag)}" style="cursor: pointer;" title="${t('tooltip.filterByTag')}">${escapeHtml(tag)}</span>`).join('')}
                </div>
                ${subtaskProgress}
            `;

            // Bind handlers in JS (values passed via closure / dataset, never concatenated into HTML → no XSS)
            const editBtn = taskEl.querySelector('[data-edit-task]');
            if (editBtn) editBtn.addEventListener('click', (e) => { e.stopPropagation(); openTaskModal(task); });
            // aria-disabled rather than disabled: a disabled button swallows the click without
            // stopPropagation, which would fall through to the card and open the task.
            taskEl.querySelectorAll('[data-move]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (btn.getAttribute('aria-disabled') !== 'true') moveTaskInColumn(task.id, btn.dataset.move);
                });
            });
            taskEl.querySelectorAll('[data-filter]').forEach(el => {
                el.addEventListener('click', (e) => { e.stopPropagation(); clickToFilter(el.dataset.filter, el.dataset.filterValue); });
            });

            taskEl.addEventListener('dragstart', drag);
            taskEl.addEventListener('dragend', () => {
                taskEl.classList.remove('dragging');
                stopAutoScroll();
            });
            taskEl.addEventListener('click', () => showTaskDetail(task));
            attachTouchDrag(taskEl);

            return taskEl;
        }

        // Drag & Drop
        function allowDrop(event) {
            event.preventDefault();
        }

        function drag(event) {
            event.dataTransfer.setData('taskId', event.target.dataset.taskId);
            event.target.classList.add('dragging');
            startAutoScroll();
        }

        // Id of the card the dragged task should be inserted BEFORE, given a vertical
        // drop position (classic reorder pattern). Returns null to append at the end.
        function getDropBeforeId(taskListEl, y, excludeId = null) {
            const cards = [...taskListEl.querySelectorAll('.task-card:not(.dragging)')];
            for (const card of cards) {
                if (card.dataset.taskId === excludeId) continue;
                const rect = card.getBoundingClientRect();
                if (y < rect.top + rect.height / 2) return card.dataset.taskId;
            }
            return null;
        }

        // Move a task within tasks[] (the canonical display/file order): set its status
        // and reposition it before beforeTaskId (or at the end). The block's position in
        // tasks[] = its rank within its column. Returns true if status or order changed.
        function moveTask(taskId, newStatus, beforeTaskId = null) {
            const oldIdx = tasks.findIndex(t => t.id === taskId);
            if (oldIdx < 0) return false;
            const task = tasks[oldIdx];
            const statusChanged = newStatus && task.status !== newStatus;
            const targetStatus = newStatus || task.status;
            tasks.splice(oldIdx, 1);
            let insertIdx;
            if (beforeTaskId) {
                insertIdx = tasks.findIndex(t => t.id === beforeTaskId);
                if (insertIdx < 0) insertIdx = tasks.length;
            } else {
                // No explicit anchor (dropped at the bottom of a column): append right after
                // the last task already in that column, so the .md stays grouped by column.
                insertIdx = tasks.length;
                for (let i = tasks.length - 1; i >= 0; i--) {
                    if (tasks[i].status === targetStatus) { insertIdx = i + 1; break; }
                }
            }
            tasks.splice(insertIdx, 0, task);
            const posChanged = tasks.indexOf(task) !== oldIdx;
            if (newStatus) task.status = newStatus;
            return statusChanged || posChanged;
        }

        // Reorder a task within its column without dragging (issue #21). where is 'up' / 'down'
        // (swap with the neighbouring VISIBLE card, so it behaves as seen while filters are
        // active) or 'top' / 'bottom' (first / last of the whole column). Returns true if moved.
        function reorderTask(taskId, where) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return false;
            const column = tasks.filter(t => t.status === task.status);
            const visible = column.filter(t => matchesFilters(t));
            const pos = visible.indexOf(task);
            let anchor = null, after = false;
            if (where === 'top') anchor = column[0];
            else if (where === 'bottom') { anchor = column[column.length - 1]; after = true; }
            else if (where === 'up' && pos > 0) anchor = visible[pos - 1];
            else if (where === 'down' && pos >= 0) { anchor = visible[pos + 1]; after = true; }
            if (!anchor || anchor === task) return false;
            tasks.splice(tasks.indexOf(task), 1);
            tasks.splice(tasks.indexOf(anchor) + (after ? 1 : 0), 0, task);
            return true;
        }

        // Which reorder moves are possible for a task (to disable buttons at the column edges)
        function reorderOptions(task) {
            const column = tasks.filter(t => t.status === task.status);
            const visible = column.filter(t => matchesFilters(t));
            const pos = visible.indexOf(task);
            return {
                top: column[0] !== task,
                up: pos > 0,
                down: pos >= 0 && pos < visible.length - 1,
                bottom: column[column.length - 1] !== task
            };
        }

        function moveTaskInColumn(taskId, where) {
            if (!reorderTask(taskId, where)) return false;
            renderKanban();
            autoSave();
            // Refresh the open detail dialog so its position buttons reflect the new rank
            if (currentDetailTask && currentDetailTask.id === taskId &&
                    document.getElementById('taskModal').classList.contains('active')) {
                showTaskDetail(currentDetailTask);
            }
            showNotification(t('notif.taskMoved'), 'success');
            return true;
        }

        // ===== Auto-scroll while dragging (issue #21) =====
        // The page (not the column) scrolls, and the board scrolls horizontally, so while a card
        // is dragged near an edge we scroll that way on every animation frame. Speed grows the
        // closer the pointer is to the edge.
        const AUTO_SCROLL_EDGE = 70;      // px from the edge where scrolling starts
        const AUTO_SCROLL_MAX_SPEED = 22; // px per frame at the very edge
        let autoScroll = null;            // { x, y, frame } while a drag is in progress

        function startAutoScroll() {
            if (autoScroll) return;
            autoScroll = { x: null, y: null, frame: requestAnimationFrame(autoScrollStep) };
        }

        function updateAutoScroll(x, y) {
            if (autoScroll) { autoScroll.x = x; autoScroll.y = y; }
        }

        function stopAutoScroll() {
            if (autoScroll) cancelAnimationFrame(autoScroll.frame);
            autoScroll = null;
        }

        // Signed scroll speed for a pointer position within [min, max]: negative near min,
        // positive near max, 0 in between.
        function autoScrollSpeed(pos, min, max) {
            const ratio = (dist) => Math.min(1, Math.max(0, 1 - dist / AUTO_SCROLL_EDGE));
            if (pos < min + AUTO_SCROLL_EDGE) return -Math.ceil(AUTO_SCROLL_MAX_SPEED * ratio(pos - min));
            if (pos > max - AUTO_SCROLL_EDGE) return Math.ceil(AUTO_SCROLL_MAX_SPEED * ratio(max - pos));
            return 0;
        }

        function autoScrollStep() {
            if (!autoScroll) return;
            const { x, y } = autoScroll;
            if (x !== null && y !== null) {
                // The sticky header covers the top of the viewport: the top zone starts below it
                const header = document.querySelector('.header');
                const top = header ? header.getBoundingClientRect().bottom : 0;
                const dy = autoScrollSpeed(y, top, window.innerHeight);
                if (dy) window.scrollBy(0, dy);
                const board = document.getElementById('kanbanBoard');
                const rect = board.getBoundingClientRect();
                if (board.scrollWidth > board.clientWidth && y >= rect.top && y <= rect.bottom) {
                    const dx = autoScrollSpeed(x, rect.left, rect.right);
                    if (dx) board.scrollLeft += dx;
                }
            }
            autoScroll.frame = requestAnimationFrame(autoScrollStep);
        }

        // dragover fires on whatever is under the pointer and bubbles here; the dragged card
        // is re-rendered on drop, so its own dragend may never bubble — stop on drop too.
        document.addEventListener('dragover', (e) => updateAutoScroll(e.clientX, e.clientY));
        document.addEventListener('drop', stopAutoScroll);

        function drop(event) {
            event.preventDefault();
            const taskId = event.dataTransfer.getData('taskId');

            // Find the target column's task list
            let dropTarget = event.target;
            while (dropTarget && !dropTarget.classList.contains('task-list')) {
                dropTarget = dropTarget.parentElement;
            }
            if (!dropTarget || !dropTarget.classList.contains('task-list')) return;

            const newStatus = dropTarget.closest('.kanban-column').dataset.columnId;
            // Compute the drop position (which card to insert before) excluding the dragged card
            const beforeId = getDropBeforeId(dropTarget, event.clientY, taskId);
            const draggedEl = document.querySelector(`[data-task-id="${taskId}"]`);
            if (draggedEl) draggedEl.classList.remove('dragging');

            // moveTask handles both cross-column moves and within-column reordering
            if (moveTask(taskId, newStatus, beforeId)) {
                renderKanban();
                autoSave();
                showNotification(t('notif.taskMoved'), 'success');
            }
        }

        // ===== Touch drag & drop (mobile) — HTML5 DnD does not fire on touch devices (issue #12) =====
        let touchDrag = null;

        function attachTouchDrag(taskEl) {
            taskEl.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                const tch = e.touches[0];
                touchDrag = {
                    taskId: taskEl.dataset.taskId,
                    el: taskEl,
                    startX: tch.clientX,
                    startY: tch.clientY,
                    active: false,
                    // Long-press to start dragging (otherwise the touch is a scroll/tap)
                    timer: setTimeout(() => {
                        if (touchDrag) {
                            touchDrag.active = true;
                            taskEl.classList.add('dragging');
                            if (navigator.vibrate) navigator.vibrate(10);
                        }
                    }, 250)
                };
            }, { passive: true });

            taskEl.addEventListener('touchmove', (e) => {
                if (!touchDrag) return;
                const tch = e.touches[0];
                if (!touchDrag.active) {
                    // Moved before the long-press fired → treat as scroll, cancel the pending drag
                    if (Math.abs(tch.clientX - touchDrag.startX) > 10 || Math.abs(tch.clientY - touchDrag.startY) > 10) {
                        clearTimeout(touchDrag.timer);
                        touchDrag = null;
                    }
                    return;
                }
                e.preventDefault(); // block page scroll while dragging
                startAutoScroll();
                updateAutoScroll(tch.clientX, tch.clientY);
                const under = document.elementFromPoint(tch.clientX, tch.clientY);
                const col = under && under.closest('.kanban-column');
                document.querySelectorAll('.kanban-column').forEach(c => c.classList.toggle('drop-target', c === col));
            }, { passive: false });

            const endHandler = (e) => {
                if (!touchDrag) return;
                clearTimeout(touchDrag.timer);
                stopAutoScroll();
                if (touchDrag.active) {
                    e.preventDefault(); // suppress the synthetic click that follows a drag
                    touchDrag.el.classList.remove('dragging');
                    const tch = e.changedTouches[0];
                    const under = document.elementFromPoint(tch.clientX, tch.clientY);
                    const col = under && under.closest('.kanban-column');
                    document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drop-target'));
                    if (col) {
                        const newStatus = col.dataset.columnId;
                        const taskList = col.querySelector('.task-list');
                        const beforeId = getDropBeforeId(taskList, tch.clientY, touchDrag.taskId);
                        if (moveTask(touchDrag.taskId, newStatus, beforeId)) {
                            renderKanban();
                            autoSave();
                            showNotification(t('notif.taskMoved'), 'success');
                        }
                    }
                }
                touchDrag = null;
            };
            taskEl.addEventListener('touchend', endHandler, { passive: false });
            taskEl.addEventListener('touchcancel', endHandler, { passive: false });
        }

        // Show task detail
