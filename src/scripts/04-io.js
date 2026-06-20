        async function loadKanbanFile() {
            try {
                kanbanFileHandle = await directoryHandle.getFileHandle('kanban.md');
                const file = await kanbanFileHandle.getFile();
                currentKanbanContent = await file.text();

                console.log('File loaded, size:', currentKanbanContent.length);
                parseMarkdown(currentKanbanContent);
                await loadArchive(); // Load archive for historical autocomplete data
                updateAutocomplete();
                renderKanban();
                // Auto-migrate a legacy (V1) kanban.md to V2 on disk: nothing is lost and future
                // AI reads/edits stay cheap. One-time — V2 files carry the format marker.
                // Guard against silent data loss: never overwrite a file that HAD task headers
                // but parsed to nothing (unrecognized columns/sections), and back it up first.
                const hadHeaders = /###\s+TASK-/.test(currentKanbanContent);
                if (!loadedFormatV2 && !(hadHeaders && tasks.length === 0)) {
                    await backupOriginal('kanban.md', currentKanbanContent);
                    if (await autoSave()) {
                        console.log('Migrated kanban.md from V1 (sections) to V2 (status field)');
                    }
                }
            } catch (error) {
                // Only create default files if the file truly doesn't exist
                if (error.name === 'NotFoundError') {
                    showNotification(t('notif.initializingFolder'), 'success');
                    console.log('kanban.md not found, creating default files...');

                    try {
                        // Create kanban.md
                        currentKanbanContent = createDefaultKanbanContent();
                        kanbanFileHandle = await directoryHandle.getFileHandle('kanban.md', { create: true });
                        const writable = await kanbanFileHandle.createWritable();
                        await writable.write(currentKanbanContent);
                        await writable.close();

                        // Create archive.md
                        const archiveContent = createDefaultArchiveContent();
                        const archiveFileHandle = await directoryHandle.getFileHandle('archive.md', { create: true });
                        const archiveWritable = await archiveFileHandle.createWritable();
                        await archiveWritable.write(archiveContent);
                        await archiveWritable.close();

                        showNotification(t('notif.filesInitialized'), 'success');

                        parseMarkdown(currentKanbanContent);
                        updateAutocomplete();
                        renderKanban();
                    } catch (createError) {
                        showNotification(t('notif.filesError'), 'error');
                        console.error(createError);
                    }
                } else {
                    // Different error (permissions, read error, etc.) - show error and don't overwrite
                    showNotification(t('notif.loadError') || 'Erreur lors du chargement du fichier', 'error');
                    console.error('Error loading kanban.md:', error);
                }
            }
        }

        // Create default kanban.md content
        function createDefaultKanbanContent() {
            return `# Kanban Board

<!-- Config: Last Task ID: 0 -->
<!-- Format: v2 -->

## ⚙️ Configuration

**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | 👀 In Review (in-review) | ✅ Done (done)

**Categories**: Frontend, Backend, Design, DevOps, Tests, Documentation

**Users**: @user (User)

**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Tags**: #bug #feature #ui #backend #urgent #refactor #docs #test

---

## Tasks
`;
        }

        // Create default archive.md content
        function createDefaultArchiveContent() {
            return `${t('markdown.archiveTitle')}

${t('markdown.archiveDesc')}

${t('markdown.archiveSection')}

`;
        }

        // One-time backup of a file's original content before a destructive V1→V2 migration,
        // so the conversion can always be undone. Skips if a backup already exists.
        async function backupOriginal(name, content) {
            try {
                const backupName = name.replace(/\.md$/, '.v1-backup.md');
                try { await directoryHandle.getFileHandle(backupName); return; } catch (e) { /* none yet → create */ }
                const fh = await directoryHandle.getFileHandle(backupName, { create: true });
                const w = await fh.createWritable();
                await w.write(content);
                await w.close();
                console.log('Backup written:', backupName);
            } catch (e) {
                console.warn('Backup failed (continuing):', e);
            }
        }

        // Parse Markdown - IMPROVED VERSION
        function parseMarkdown(content) {
            tasks = [];
            config = {
                lastTaskId: 0,
                columns: [],
                categories: [],
                users: [],
                priorities: [],
                tags: []
            };

            console.log('=== Starting parseMarkdown ===');

            // Parse config comment
            const configMatch = content.match(/<!-- Config: Last Task ID: (\d+) -->/);
            if (configMatch) {
                config.lastTaskId = parseInt(configMatch[1]);
                console.log('Last Task ID:', config.lastTaskId);
            }

            // Parse config section
            const configSection = content.match(/## ⚙️ Configuration\s+([\s\S]*?)---/);
            if (configSection) {
                const configText = configSection[1];
                console.log('Config section found');

                // Parse columns - FIXED REGEX
                const columnsMatch = configText.match(/\*\*Columns\*\*:\s*(.+)/);
                if (columnsMatch) {
                    console.log('Raw columns:', columnsMatch[1]);
                    const usedColIds = new Set();
                    config.columns = columnsMatch[1].split('|').map((col, idx) => {
                        col = col.trim();
                        if (!col) return null;
                        const match = col.match(/^(.+?)\s*\((.+?)\)\s*$/);
                        let name, baseId;
                        if (match) {
                            name = match[1].trim();
                            baseId = match[2].trim();
                        } else {
                            // No explicit (id): derive a slug from the name so legacy files
                            // without ids still parse (e.g. "📝 To Do" → "to-do") instead of being dropped.
                            name = col;
                            baseId = col.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || ('col' + (idx + 1));
                        }
                        // Ensure ids are unique (handles slug or explicit-id collisions deterministically).
                        let id = baseId, n = 2;
                        while (usedColIds.has(id)) id = `${baseId}-${n++}`;
                        usedColIds.add(id);
                        return { name, id };
                    }).filter(Boolean);
                    console.log('Parsed columns:', config.columns);
                }

                // Parse categories
                const categoriesMatch = configText.match(/\*\*Categories\*\*:\s*(.+)/);
                if (categoriesMatch) {
                    config.categories = categoriesMatch[1].split(',').map(c => c.trim()).filter(Boolean);
                    console.log('Parsed categories:', config.categories);
                }

                // Parse users
                const usersMatch = configText.match(/\*\*Users\*\*:\s*(.+)/);
                if (usersMatch) {
                    config.users = usersMatch[1].split(',').map(u => u.trim()).filter(Boolean);
                    console.log('Parsed users:', config.users);
                }

                // Parse priorities
                const prioritiesMatch = configText.match(/\*\*Priorities\*\*:\s*(.+)/);
                if (prioritiesMatch) {
                    config.priorities = prioritiesMatch[1].split('|').map(p => p.trim()).filter(Boolean);
                    console.log('Parsed priorities:', config.priorities);
                }

                // Parse tags
                const tagsMatch = configText.match(/\*\*Tags\*\*:\s*(.+)/);
                if (tagsMatch) {
                    config.tags = tagsMatch[1].split(/\s+/).filter(t => t.startsWith('#')).map(t => t.replace('#', ''));
                    console.log('Parsed tags:', config.tags);
                }
            }

            // Default columns if not found
            if (config.columns.length === 0) {
                config.columns = [
                    { name: '📝 To Do', id: 'todo' },
                    { name: '🚀 In Progress', id: 'in-progress' },
                    { name: '👀 In Review', id: 'in-review' },
                    { name: '✅ Done', id: 'done' }
                ];
                console.log('Using default columns');
            }

            // Default categories if not found
            if (config.categories.length === 0) {
                config.categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Tests', 'Documentation'];
            }

            // Default users if not found
            if (config.users.length === 0) {
                config.users = ['@user (User)'];
            }

            // Default priorities if not found
            if (config.priorities.length === 0) {
                config.priorities = ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'];
            }

            // Default tags if not found
            if (config.tags.length === 0) {
                config.tags = ['bug', 'feature', 'ui', 'backend', 'urgent', 'refactor', 'docs', 'test'];
            }

            // Parse tasks. V2: a single "## Tasks" section where each task carries its own
            // **Status** field. Legacy: one "## <Column>" section per status (status inferred
            // from the section). The **Status** field wins; the section is the fallback → old
            // kanban.md files keep working unchanged.
            // Detect V2 by an explicit format marker, OR by a "## Tasks" heading with no legacy
            // column section present (so a legacy column literally named "Tasks" is never
            // mis-detected and silently dropped).
            const reEscape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const hasMarker = /<!--\s*Format:\s*v2\s*-->/i.test(content);
            const hasTasksHeading = /(^|\n)##\s+Tasks\s*(\n|$)/.test(content);
            const hasColumnSections = config.columns.some(c =>
                new RegExp(`(^|\\n)##\\s+${reEscape(c.name)}\\s*(\\n|$)`).test(content));
            const hasUnified = hasMarker || (hasTasksHeading && !hasColumnSections);
            loadedFormatV2 = hasUnified;

            if (hasUnified) {
                // The "## Tasks" section runs to the end of the file, so a "## " or "### "
                // heading inside a task's notes/description never truncates the board.
                const body = content.replace(/^[\s\S]*?(?:^|\n)##\s+Tasks\s*(?:\n|$)/, '');
                tasks.push(...parseTaskBlocks(body, config.columns[0].id, true));
            } else {
                // Legacy: status comes from the section only — never honour a stray
                // **Status** line that might sit inside an old task's notes.
                config.columns.forEach(column => {
                    tasks.push(...parseTasksFromSection(content, column.name, column.id, false));
                });
            }

            console.log(`\n=== Total tasks parsed: ${tasks.length} ===`);
            console.log('Tasks:', tasks.map(t => `${t.id} (${t.status})`).join(', '));
        }

        // Extract the "## <sectionName>" section, then parse its task blocks.
        // Used by the legacy column path and by the archive (each column / "Archives"
        // is its own section). The V2 unified path calls parseTaskBlocks() directly.
        function parseTasksFromSection(content, sectionName, statusId, honorStatusField = false) {
            const sections = content.split(/\n##\s+/);
            let sectionContent = null;
            for (let section of sections) {
                if (section.startsWith(sectionName)) {
                    sectionContent = section.substring(sectionName.length).trim();
                    break;
                }
            }
            if (!sectionContent) return [];
            return parseTaskBlocks(sectionContent, statusId, honorStatusField);
        }

        // Parse "### TASK-NNN | Title" blocks from a chunk of markdown. The split is anchored
        // to line starts so a "### TASK-" appearing mid-line in notes is not split on.
        function parseTaskBlocks(sectionContent, statusId, honorStatusField = false) {
            const tasksFound = [];
            // Only a real, line-anchored "### TASK-<digits> | <title>" header starts a block.
            // A malformed "### TASK-foo" or a header-like line inside notes is NOT a boundary,
            // so it neither drops the following content nor truncates the surrounding task.
            const headerRe = /^###\s+TASK-(\d+)\s*\|\s*(.+?)\s*$/gm;
            const headers = [...sectionContent.matchAll(headerRe)];
            headers.forEach((h, i) => {
                const titlePart = h[2].trim();
                if (!titlePart) return;
                const start = h.index + h[0].length;
                const end = i + 1 < headers.length ? headers[i + 1].index : sectionContent.length;
                const taskContent = sectionContent.slice(start, end);
                const taskId = 'TASK-' + h[1].padStart(3, '0');
                const task = parseTask(taskId, titlePart, taskContent, statusId, honorStatusField);
                if (task) tasksFound.push(task);
            });
            return tasksFound;
        }

        // Parse individual task
        function parseTask(id, title, content, fallbackStatus, honorStatusField = false) {
            // V2: the **Status** field is authoritative when present and a valid column id;
            // otherwise fall back to the section-derived status (legacy files / archive).
            let status = fallbackStatus;
            if (honorStatusField) {
                const statusMatch = content.match(/^\s*\*\*Status\*\*:\s*([^\r\n]+)/im);
                if (statusMatch) {
                    const s = statusMatch[1].trim();
                    if (config.columns.some(c => c.id === s)) status = s;
                }
            }
            const task = {
                id,
                title: title.trim(),
                status,
                priority: '',
                category: '',
                assignees: [],
                tags: [],
                created: '',
                started: '',
                due: '',
                completed: '',
                description: '',
                subtasks: [],
                notes: ''
            };

            // Parse metadata line
            const metaMatch = content.match(/\*\*Priority\*\*:\s*(\w+)\s*\|\s*\*\*Category\*\*:\s*([^|]+?)(?:\s*\|\s*\*\*Assigned\*\*:\s*(.+?))?$/m);
            if (metaMatch) {
                task.priority = metaMatch[1].trim();
                task.category = metaMatch[2].trim();
                if (metaMatch[3]) {
                    task.assignees = metaMatch[3].split(',').map(a => a.trim());
                }
            }

            // Parse dates - support all date fields
            const createdMatch = content.match(/\*\*Created\*\*:\s*([\d-]+)/);
            if (createdMatch) task.created = createdMatch[1];

            const startedMatch = content.match(/\*\*Started\*\*:\s*([\d-]+)/);
            if (startedMatch) task.started = startedMatch[1];

            const dueMatch = content.match(/\*\*Due\*\*:\s*([\d-]+)/);
            if (dueMatch) task.due = dueMatch[1];

            const completedMatch = content.match(/\*\*Finished\*\*:\s*([\d-]+)/);
            if (completedMatch) task.completed = completedMatch[1];

            // Parse tags
            const tagsMatch = content.match(/\*\*Tags\*\*:\s*(.+)/);
            if (tagsMatch) {
                task.tags = tagsMatch[1].match(/#[\w-]+/g) || [];
            }

            // Parse description (text after dates/tags but before "**Sous-tâches**" or "**Notes**")
            const lines = content.split('\n');
            let descriptionLines = [];
            let inDescription = false;

            for (let line of lines) {
                // Skip metadata lines
                if (line.match(/^\*\*(Status|Priority|Category|Assigned|Created|Started|Due|Finished|Tags)\*\*/)) {
                    continue;
                }
                // Stop at subsections
                if (line.match(/^\*\*(Subtasks|Notes|Links|Review|Dependencies)\*\*/)) {
                    break;
                }
                // Collect description lines
                if (line.trim() && !inDescription) {
                    inDescription = true;
                }
                if (inDescription && line.trim()) {
                    descriptionLines.push(line.trim());
                }
            }
            task.description = descriptionLines.join('\n'); // full text — the card clamps the display via CSS

            // Parse subtasks
            const subtaskMatches = content.matchAll(/- \[(x| )\] (.+)/g);
            for (const match of subtaskMatches) {
                task.subtasks.push({
                    completed: match[1] === 'x',
                    text: match[2].trim()
                });
            }

            // Parse notes - everything after **Notes**: until end of task
            const notesMatch = content.match(/\*\*Notes\*\*:\s*\n([\s\S]*?)$/);
            if (notesMatch) {
                task.notes = notesMatch[1].trim();
            }

            return task;
        }

        // Enhanced markdown to HTML converter for notes
        // Escape user-controlled text/attribute values before inserting into innerHTML (XSS hardening)
