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

## ⚙️ Configuration

**Columns**: 📝 To Do (todo) | 🚀 In Progress (in-progress) | 👀 In Review (in-review) | ✅ Done (done)

**Categories**: Frontend, Backend, Design, DevOps, Tests, Documentation

**Users**: @user (User)

**Priorities**: 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

**Tags**: #bug #feature #ui #backend #urgent #refactor #docs #test

---

## 📝 To Do

## 🚀 In Progress

## 👀 In Review

## ✅ Done
`;
        }

        // Create default archive.md content
        function createDefaultArchiveContent() {
            return `${t('markdown.archiveTitle')}

${t('markdown.archiveDesc')}

${t('markdown.archiveSection')}

`;
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
                    config.columns = columnsMatch[1].split('|').map(col => {
                        // Fixed regex to handle space before parenthesis
                        const match = col.trim().match(/(.+?)\s*\((.+?)\)/);
                        if (match) {
                            return { name: match[1].trim(), id: match[2].trim() };
                        }
                        return null;
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

            // Parse tasks by sections using the unified parser
            config.columns.forEach(column => {
                const columnTasks = parseTasksFromSection(content, column.name, column.id);
                tasks.push(...columnTasks);
            });

            console.log(`\n=== Total tasks parsed: ${tasks.length} ===`);
            console.log('Tasks:', tasks.map(t => `${t.id} (${t.status})`).join(', '));
        }

        // Parse tasks from a markdown section (reusable for both kanban and archive)
        function parseTasksFromSection(content, sectionName, statusId) {
            console.log(`\n--- Parsing section: ${sectionName} (status: ${statusId}) ---`);
            const tasksFound = [];

            // Split by ## to get sections
            const sections = content.split(/\n##\s+/);
            let sectionContent = null;

            for (let section of sections) {
                if (section.startsWith(sectionName)) {
                    // Extract content after the section title
                    sectionContent = section.substring(sectionName.length).trim();
                    break;
                }
            }

            if (!sectionContent) {
                console.log(`Section "${sectionName}" not found or empty`);
                return tasksFound;
            }

            console.log(`Section content length: ${sectionContent.length}`);

            // SIMPLE PARSING: Split by ### TASK-
            const taskBlocks = sectionContent.split(/###\s+TASK-/).slice(1); // Skip first empty element
            console.log(`Found ${taskBlocks.length} task blocks`);

            taskBlocks.forEach((block, index) => {
                // Each block starts with: XXX | Title
                const lines = block.split('\n');
                const firstLine = lines[0].trim();

                console.log(`Block ${index + 1} first line: "${firstLine}"`);

                // Extract ID and title from first line
                const pipeIndex = firstLine.indexOf('|');
                if (pipeIndex > 0) {
                    const idPart = firstLine.substring(0, pipeIndex).trim();
                    const titlePart = firstLine.substring(pipeIndex + 1).trim();

                    // Check if idPart is a valid number
                    const idMatch = idPart.match(/^(\d+)$/);
                    if (idMatch && titlePart) {
                        const taskId = 'TASK-' + idPart.padStart(3, '0');
                        const title = titlePart;
                        const taskContent = lines.slice(1).join('\n');

                        console.log(`✓ Matched! Parsing task: ${taskId} - ${title}`);
                        const task = parseTask(taskId, title, taskContent, statusId);
                        if (task) {
                            tasksFound.push(task);
                            console.log(`✓ Task added. Total in this section: ${tasksFound.length}`);
                        } else {
                            console.log(`✗ parseTask returned null`);
                        }
                    } else {
                        console.log(`✗ Invalid ID format: "${idPart}"`);
                    }
                } else {
                    console.log(`✗ No pipe character found in first line`);
                }
            });

            console.log(`Total tasks parsed from "${sectionName}": ${tasksFound.length}`);
            return tasksFound;
        }

        // Parse individual task
        function parseTask(id, title, content, status) {
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
                if (line.match(/^\*\*(Priority|Category|Assigned|Created|Started|Due|Finished|Tags)\*\*/)) {
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
            task.description = descriptionLines.join(' ').substring(0, 200);

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
