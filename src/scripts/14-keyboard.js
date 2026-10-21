        // ===== Keyboard support =====
        // Esc closes the dialog on top (issue #23). Dialogs are .modal elements shown with .active.
        // Dialogs without an entry here are simply hidden.
        const modalClosers = {
            taskModal: () => closeModal(), // also brings back the archive if opened from there
            newTaskModal: () => {
                if (isTaskFormDirty() && !confirm(t('confirm.discardChanges'))) return;
                closeTaskModal();
            },
            columnsModal: () => closeColumnsModal(),
            archiveModal: () => closeArchiveModal()
        };

        // Dialogs share one z-index, so the DOM order (not the opening order) decided which one was
        // drawn on top. Record the opening order and raise each newly opened dialog above the
        // others, so the one drawn on top is also the one Esc closes.
        let modalOpenCounter = 0;
        const modalObserver = new MutationObserver(records => {
            records.forEach(({ target: modal }) => {
                if (modal.classList.contains('active')) {
                    if (!modal.dataset.openOrder) {
                        modal.dataset.openOrder = ++modalOpenCounter;
                        modal.style.zIndex = 1000 + modalOpenCounter;
                    }
                } else if (modal.dataset.openOrder) {
                    delete modal.dataset.openOrder;
                    modal.style.zIndex = '';
                }
            });
            if (!document.querySelector('.modal.active')) modalOpenCounter = 0;
        });
        document.querySelectorAll('.modal').forEach(modal =>
            modalObserver.observe(modal, { attributes: true, attributeFilter: ['class'] }));

        function topActiveModal() {
            const open = [...document.querySelectorAll('.modal.active')];
            open.sort((a, b) => (+a.dataset.openOrder || 0) - (+b.dataset.openOrder || 0));
            return open.length ? open[open.length - 1] : null;
        }

        function closeTopModal() {
            const modal = topActiveModal();
            if (!modal) return false;
            const closer = modalClosers[modal.id];
            if (closer) closer();
            else modal.classList.remove('active');
            return true;
        }

        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || e.isComposing || e.defaultPrevented) return;
            if (closeTopModal()) e.preventDefault();
        });

        // ===== Keyboard navigation & shortcuts (issue #24) =====
        // Cards are focusable (tabindex=0). Single-key shortcuts are ignored while typing in a
        // field and while a dialog is open (except the few that act on that dialog).

        function isTypingTarget(el) {
            return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
        }

        // Visible cards per column, in board order
        function boardCardColumns() {
            return [...document.querySelectorAll('#kanbanBoard .kanban-column')]
                .map(col => [...col.querySelectorAll('.task-card')]);
        }

        // The focused card, also when focus is on one of its own buttons (↑ ↓ ✏️)
        function focusedCard() {
            const el = document.activeElement;
            return el && el.closest ? el.closest('#kanbanBoard .task-card') : null;
        }

        function focusTaskCard(taskId, options) {
            const card = [...document.querySelectorAll('#kanbanBoard .task-card')].find(c => c.dataset.taskId === taskId);
            if (card) card.focus(options);
            return !!card;
        }

        // Arrow keys / hjkl: dy moves within the column, dx jumps to the nearest non-empty
        // column on that side, keeping roughly the same row.
        function navigateCards(dx, dy) {
            const columns = boardCardColumns();
            const card = focusedCard();
            if (!card) {
                const first = columns.flat()[0];
                if (first) first.focus();
                return;
            }
            const c = columns.findIndex(col => col.includes(card));
            const r = columns[c].indexOf(card);
            if (dy) {
                const next = columns[c][r + dy];
                if (next) next.focus();
                return;
            }
            for (let i = c + dx; i >= 0 && i < columns.length; i += dx) {
                if (columns[i].length) {
                    columns[i][Math.min(r, columns[i].length - 1)].focus();
                    return;
                }
            }
        }

        function focusColumnEdge(card, last) {
            const cards = [...card.closest('.task-list').querySelectorAll('.task-card')];
            const target = last ? cards[cards.length - 1] : cards[0];
            if (target) target.focus();
        }

        // Shift+←/→: move the task to the end of the previous/next column, keeping focus on it
        function moveTaskToAdjacentColumn(taskId, dir) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;
            const target = config.columns[config.columns.findIndex(col => col.id === task.status) + dir];
            if (target && moveTask(taskId, target.id, null)) {
                renderKanban();
                autoSave();
                showNotification(t('notif.taskMoved'), 'success');
            }
            focusTaskCard(taskId);
        }

        // Shift+↑/↓ and Shift+Home/End: reorder within the column, keeping focus on the task
        function reorderFocusedTask(taskId, where) {
            moveTaskInColumn(taskId, where);
            focusTaskCard(taskId);
        }

        // Return focus to where it was (typically a card) once every dialog is closed again. The
        // card may have been re-rendered meanwhile, so fall back to finding it by task id.
        let focusBeforeModal = null;
        new MutationObserver(() => {
            const anyOpen = !!document.querySelector('.modal.active');
            if (anyOpen && !focusBeforeModal) {
                const el = document.activeElement;
                focusBeforeModal = { el, taskId: el && el.dataset ? el.dataset.taskId : null };
            } else if (!anyOpen && focusBeforeModal) {
                const { el, taskId } = focusBeforeModal;
                focusBeforeModal = null;
                if (el && el.isConnected && el !== document.body) el.focus({ preventScroll: true });
                else if (taskId) focusTaskCard(taskId, { preventScroll: true });
            }
        }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });

        const SHORTCUTS = [
            ['← → ↑ ↓  ·  h j k l', 'shortcuts.navigate'],
            ['Home / End', 'shortcuts.firstLast'],
            ['Enter', 'shortcuts.open'],
            ['e', 'shortcuts.edit'],
            ['n', 'shortcuts.new'],
            ['Shift + ← / →', 'shortcuts.moveColumn'],
            ['Shift + ↑ / ↓', 'shortcuts.moveUpDown'],
            ['Shift + Home / End', 'shortcuts.moveTopBottom'],
            ['/', 'shortcuts.search'],
            ['Esc', 'shortcuts.close'],
            ['Ctrl / ⌘ + Enter', 'shortcuts.save'],
            ['?', 'shortcuts.help']
        ];

        function openShortcutsModal() {
            document.getElementById('shortcutsModalTitle').textContent = t('shortcuts.title');
            document.getElementById('shortcutsList').innerHTML = SHORTCUTS.map(([keys, key]) => `
                <tr><td><kbd>${escapeHtml(keys)}</kbd></td><td>${escapeHtml(t(key))}</td></tr>`).join('');
            document.getElementById('shortcutsModal').classList.add('active');
        }

        function closeShortcutsModal() {
            document.getElementById('shortcutsModal').classList.remove('active');
        }

        const NAV_KEYS = {
            ArrowLeft: [-1, 0], h: [-1, 0],
            ArrowRight: [1, 0], l: [1, 0],
            ArrowUp: [0, -1], k: [0, -1],
            ArrowDown: [0, 1], j: [0, 1]
        };

        document.addEventListener('keydown', (e) => {
            if (e.defaultPrevented || e.isComposing) return;
            const modal = topActiveModal();

            // Ctrl/Cmd+Enter saves the task form, also while typing in it
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && modal && modal.id === 'newTaskModal') {
                e.preventDefault();
                document.getElementById('newTaskForm').requestSubmit();
                return;
            }

            if (isTypingTarget(e.target)) {
                // Esc leaves a board field such as the search box (dialogs are handled above)
                if (e.key === 'Escape' && !modal) e.target.blur();
                return;
            }
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

            if (e.key === '?') {
                e.preventDefault();
                if (modal && modal.id === 'shortcutsModal') closeShortcutsModal();
                else if (!modal) openShortcutsModal();
                return;
            }

            if (modal) {
                // In the task details dialog, "e" edits the open task (not for archived tasks)
                if (modal.id === 'taskModal' && key === 'e' && !wasArchiveModalActive) {
                    e.preventDefault();
                    editCurrentTask();
                }
                return;
            }

            // Everything below needs a loaded board
            if (document.getElementById('kanbanView').style.display === 'none') return;

            const card = focusedCard();
            const task = card ? tasks.find(t => t.id === card.dataset.taskId) : null;

            if (key === '/') {
                e.preventDefault();
                document.getElementById('globalSearchInput').focus();
            } else if (key === 'n') {
                e.preventDefault();
                openTaskModal(null, card ? card.closest('.kanban-column').dataset.columnId : null);
            } else if (key === 'e' && task) {
                e.preventDefault();
                openTaskModal(task);
            } else if ((e.key === 'Enter' || e.key === ' ') && task && e.target === card) {
                e.preventDefault();
                showTaskDetail(task);
            } else if (NAV_KEYS[key]) {
                const [dx, dy] = NAV_KEYS[key];
                e.preventDefault();
                if (e.shiftKey && task) {
                    if (dx) moveTaskToAdjacentColumn(task.id, dx);
                    else reorderFocusedTask(task.id, dy < 0 ? 'up' : 'down');
                } else if (!e.shiftKey) {
                    navigateCards(dx, dy);
                }
            } else if ((e.key === 'Home' || e.key === 'End') && card) {
                e.preventDefault();
                if (e.shiftKey) reorderFocusedTask(task.id, e.key === 'Home' ? 'top' : 'bottom');
                else focusColumnEdge(card, e.key === 'End');
            }
        });

        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('shortcutsBtn');
            if (btn) btn.title = t('shortcuts.title') + ' (?)';
            document.getElementById('languageSelector').addEventListener('change', () => {
                if (btn) btn.title = t('shortcuts.title') + ' (?)';
            });
        });
