        async function loadArchive() {
            console.log('🗃️ === LOADING ARCHIVE ===');
            try {
                archiveFileHandle = await directoryHandle.getFileHandle('archive.md');
                console.log('✓ Archive file handle obtained');
                const file = await archiveFileHandle.getFile();
                console.log('✓ Archive file loaded, size:', file.size, 'bytes');
                const content = await file.text();
                console.log('✓ Archive content read, length:', content.length, 'characters');
                console.log('Archive content preview:', content.substring(0, 500));

                // Parse every "### TASK-" block in archive.md, regardless of the section
                // heading's language (archive is a flat list — this also fixes the German
                // "## ✅ Archiv" vs hardcoded "✅ Archives" mismatch). honorStatusField=true so
                // an archived task keeps the original column it was in (stored in **Status**),
                // making restore exact; old archives with no **Status** fall back to 'archived'.
                loadedArchiveV2 = /<!--\s*Format:\s*v2\s*-->/i.test(content);
                archivedTasks = parseTaskBlocks(content, 'archived', true);

                console.log('✓ Archive parsed. Total archived tasks:', archivedTasks.length);

                // Auto-migrate a legacy archive.md to the V2 shape (format marker + **Status**
                // per task). Same TOTAL-parse guard as kanban.md: only rewrite when every
                // "### TASK-" header parsed to exactly one unique task — a malformed/unparsed
                // archive block must abstain, not be dropped on saveArchive(). Its OWN try/catch:
                // a failed write must NOT reach the outer catch (which resets archivedTasks = []).
                const archiveBlockCount = (content.match(/^###\s+TASK-/gm) || []).length;
                const archiveUnique = new Set(archivedTasks.map(t => t.id)).size;
                if (!loadedArchiveV2 && archivedTasks.length > 0
                        && archivedTasks.length === archiveBlockCount && archiveUnique === archiveBlockCount) {
                    try {
                        // Same rule as kanban.md: never overwrite without a confirmed backup.
                        if (await backupOriginal('archive.md', content)) {
                            await saveArchive();
                            console.log('Migrated archive.md to V2 format');
                        } else {
                            console.warn('Skipped archive.md migration: backup failed. File left unchanged.');
                        }
                    } catch (e) {
                        console.error('Archive migration write failed (kept in memory):', e);
                    }
                } else if (!loadedArchiveV2 && archivedTasks.length > 0) {
                    console.warn(`Skipped archive.md migration: incomplete parse (${archivedTasks.length}/${archiveBlockCount} blocks). File left unchanged.`);
                }
            } catch (error) {
                console.error('❌ archive.md not found or error:', error);
                archivedTasks = [];
            }
        }

        async function saveArchive() {
            if (!archiveFileHandle) {
                archiveFileHandle = await directoryHandle.getFileHandle('archive.md', { create: true });
            }

            let md = `${t('markdown.archiveTitle')}\n<!-- Format: v2 -->\n\n${t('markdown.archiveDesc')}\n\n${t('markdown.archiveSection')}\n\n`;
            archivedTasks.forEach(task => {
                md += `### ${task.id} | ${task.title}\n`;
                md += `**Status**: ${task.status}\n`;
                let meta = '';
                if (task.priority) meta += `**Priority**: ${task.priority}`;
                if (task.category) meta += ` | **Category**: ${task.category}`;
                if (task.assignees.length > 0) meta += ` | **Assigned**: ${task.assignees.join(', ')}`;
                if (meta) md += `${meta}\n`;

                // Write dates line
                let dates = '';
                if (task.created) dates += `**Created**: ${task.created}`;
                if (task.started) dates += (dates ? ' | ' : '') + `**Started**: ${task.started}`;
                if (task.due) dates += (dates ? ' | ' : '') + `**Due**: ${task.due}`;
                if (task.completed) dates += (dates ? ' | ' : '') + `**Finished**: ${task.completed}`;
                if (dates) md += `${dates}\n`;
                if (task.tags.length > 0) md += `**Tags**: ${task.tags.join(' ')}\n`;
                if (task.description) md += `\n${task.description}\n`;
                if (task.subtasks.length > 0) {
                    md += `\n**Subtasks**:\n`;
                    task.subtasks.forEach(st => md += `- [${st.completed ? 'x' : ' '}] ${st.text}\n`);
                }
                if (task.extra) {
                    md += `\n${task.extra}\n`;
                }
                if (task.notes) {
                    md += `\n**Notes**:\n${task.notes}\n`;
                }
                md += `\n`;
            });

            const writable = await archiveFileHandle.createWritable();
            await writable.write(md);
            await writable.close();
        }

        function archiveCurrentTask() {
            if (!currentDetailTask) return;
            if (confirm(t('confirm.archiveTask', {title: currentDetailTask.title}))) {
                // Remove from active tasks
                const idx = tasks.findIndex(t => t.id === currentDetailTask.id);
                if (idx >= 0) {
                    const task = tasks.splice(idx, 1)[0];
                    archivedTasks.push(task);
                    saveArchive();
                    autoSave();
                    updateAutocomplete(); // Keep historical values in autocomplete
                    renderKanban();
                    closeModal();
                    showNotification(t('notif.taskArchived'), 'success');
                }
            }
        }

        function deleteCurrentTask() {
            if (!currentDetailTask) return;
            deleteTask(currentDetailTask.id, false);
        }

        function deleteTask(taskId, fromArchive = false) {
            const taskList = fromArchive ? archivedTasks : tasks;
            const task = taskList.find(t => t.id === taskId);

            if (!task) return;

            const confirmMessage = fromArchive
                ? t('confirm.deleteTask', {title: task.title})
                : t('confirm.deleteTaskFromArchive', {title: task.title});

            if (confirm(confirmMessage)) {
                const idx = taskList.findIndex(t => t.id === taskId);
                if (idx >= 0) {
                    taskList.splice(idx, 1);

                    // Save both files
                    if (fromArchive) {
                        saveArchive();
                    } else {
                        autoSave();
                    }

                    // Update UI
                    if (fromArchive) {
                        renderArchiveList(document.getElementById('archiveSearch').value);
                    } else {
                        renderKanban();
                        closeModal();
                    }

                    showNotification(t('notif.taskDeleted'), 'success');
                }
            }
        }

        async function openArchiveModal() {
            console.log('\n📂 === OPENING ARCHIVE MODAL ===');
            await loadArchive();
            renderArchiveList();
            document.getElementById('archiveModal').classList.add('active');
            console.log('✓ Archive modal opened');
        }

        function closeArchiveModal() {
            document.getElementById('archiveModal').classList.remove('active');
        }

        function renderArchiveList(searchTerm = '') {
            console.log('\n🎨 === RENDERING ARCHIVE LIST ===');
            console.log('Search term:', searchTerm || '(none)');
            console.log('Total archived tasks:', archivedTasks.length);

            const list = document.getElementById('archiveList');
            if (!list) {
                console.error('❌ archiveList element not found!');
                return;
            }

            const filtered = searchTerm ?
                archivedTasks.filter(t =>
                    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    t.category.toLowerCase().includes(searchTerm.toLowerCase())
                ) : archivedTasks;

            console.log('Filtered tasks:', filtered.length);

            if (filtered.length === 0) {
                console.log('⚠️ No tasks to display - showing empty message');
                list.innerHTML = `<p style="text-align: center; color: var(--text-secondary, #999); padding: 2rem;">${t('archives.empty')}</p>`;
                return;
            }

            console.log('✓ Rendering', filtered.length, 'tasks');

            list.innerHTML = filtered.map(task => `
                <div class="task-card" onclick="showTaskDetail(archivedTasks.find(t => t.id === '${task.id}'))">
                    <div style="background: var(--bg); border: 2px solid var(--border, #e2e8f0); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                            <div>
                                <span style="background: #6b7280; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${task.id}</span>
                                <strong style="margin-left: 0.5rem; font-size: 1.1rem;">${escapeHtml(task.title)}</strong>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="event.stopPropagation(); deleteTask('${task.id}', true)" class="btn btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; background: #ef4444; color: white;">🗑️</button>
                                <button onclick="event.stopPropagation(); unarchiveTask('${task.id}')" class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;">${t('action.restore')}</button>
                            </div>
                        </div>
                        ${task.description ? `<p style="color: var(--text-secondary, #666); margin: 0.5rem 0;">${markdownToHtml(task.description)}</p>` : ''}
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                            ${task.priority ? `<span style="background: #fbbf24; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${displayPriority(task.priority)}</span>` : ''}
                            ${task.category ? `<span style="background: #8b5cf6; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${escapeHtml(task.category)}</span>` : ''}
                            ${task.tags.map(t => `<span style="background: #3b82f6; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8rem;">${escapeHtml(t)}</span>`).join('')}
                        </div>
                    </div>
            `).join('');
        }

        function unarchiveTask(taskId) {
            const idx = archivedTasks.findIndex(t => t.id === taskId);
            if (idx >= 0) {
                const task = archivedTasks.splice(idx, 1)[0];
                // Keep original column status
                // If the column no longer exists, use first column as fallback
                if (!config.columns.find(col => col.id === task.status)) {
                    task.status = config.columns[0]?.id || 'todo';
                }
                tasks.push(task);
                saveArchive();
                autoSave();
                updateAutocomplete(); // Update autocomplete after restoring
                renderKanban();
                renderArchiveList(document.getElementById('archiveSearch').value);
                showNotification(t('notif.taskRestored'), 'success');
            }
        }

        // Archive search
        document.getElementById('archiveSearch').addEventListener('input', (e) => {
            renderArchiveList(e.target.value);
        });

        // Event listeners
        document.getElementById('newTaskBtn').addEventListener('click', () => openTaskModal());
        document.getElementById('archiveBtn').addEventListener('click', openArchiveModal);
        document.getElementById('manageColsBtn').addEventListener('click', openColumnsModal);

        // Generate Markdown from tasks - SIMPLIFIED!
