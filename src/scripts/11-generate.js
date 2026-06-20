        function generateMarkdown() {
            // The Format marker makes V2 detection unambiguous (vs a legacy column named "Tasks").
            // Preserve the user's H1 title (default "Kanban Board") instead of hardcoding it.
            const boardTitle = (config.boardTitle && config.boardTitle.trim()) || 'Kanban Board';
            let md = `# ${boardTitle}\n\n<!-- Config: Last Task ID: ${config.lastTaskId} -->\n<!-- Format: v2 -->\n\n`;

            // The config lists (Categories / Users / Tags) keep ONLY the user-configured values.
            // Values that appear only on tasks are NOT folded back in here — doing so made these
            // lines grow without bound on every save (every tag/category/user ever used stuck
            // forever). Autocomplete still surfaces task-derived values: extractUniqueValues()
            // unions config + active + archived tasks at runtime.
            config.categories = [...new Set(config.categories || [])];
            config.users = [...new Set(config.users || [])];
            config.tags = [...new Set(config.tags || [])];

            // Ensure defaults exist
            if (config.categories.length === 0) {
                config.categories = ['Frontend', 'Backend', 'Design', 'DevOps', 'Tests', 'Documentation'];
            }
            if (config.users.length === 0) {
                config.users = ['@user (User)'];
            }
            if (config.priorities.length === 0) {
                config.priorities = ['🔴 Critical', '🟠 High', '🟡 Medium', '🟢 Low'];
            }
            if (config.tags.length === 0) {
                config.tags = ['bug', 'feature', 'ui', 'backend', 'urgent', 'refactor', 'docs', 'test'];
            }

            // Add config section
            md += `## ⚙️ Configuration\n\n`;
            md += `**Columns**: ${config.columns.map(c => `${c.name} (${c.id})`).join(' | ')}\n\n`;
            md += `**Categories**: ${config.categories.join(', ')}\n\n`;
            md += `**Users**: ${config.users.join(', ')}\n\n`;
            md += `**Priorities**: ${config.priorities.join(' | ')}\n\n`;
            md += `**Tags**: ${config.tags.map(t => '#' + t).join(' ')}\n\n`;
            md += `---\n\n`;

            // V2: a single "## Tasks" section. Each task carries its own **Status**
            // field (= its column), and its order in the file equals its order in
            // tasks[] (= its rank within its column). Moving a task between columns is
            // a one-line **Status** edit; the block itself never has to move.
            md += `## Tasks\n\n`;
            tasks.forEach(task => {
                md += `### ${task.id} | ${task.title}\n`;
                md += `**Status**: ${task.status}\n`;

                let meta = '';
                if (task.priority) meta += `**Priority**: ${task.priority}`;
                if (task.category) meta += ` | **Category**: ${task.category}`;
                if (task.assignees.length > 0) meta += ` | **Assigned**: ${task.assignees.join(', ')}`;
                if (meta) md += meta + '\n';

                // Write dates line
                let dates = '';
                if (task.created) dates += `**Created**: ${task.created}`;
                if (task.started) dates += (dates ? ' | ' : '') + `**Started**: ${task.started}`;
                if (task.due) dates += (dates ? ' | ' : '') + `**Due**: ${task.due}`;
                if (task.completed) dates += (dates ? ' | ' : '') + `**Finished**: ${task.completed}`;
                if (dates) md += dates + '\n';

                if (task.tags.length > 0) {
                    md += `**Tags**: ${task.tags.join(' ')}\n`;
                }

                if (task.description) {
                    md += `\n${task.description}\n`;
                }

                if (task.subtasks.length > 0) {
                    md += `\n**Subtasks**:\n`;
                    task.subtasks.forEach(st => {
                        md += `- [${st.completed ? 'x' : ' '}] ${st.text}\n`;
                    });
                }

                // Re-emit preserved unsupported sections verbatim (kept here, before Notes, so a
                // re-parse captures them again as task.extra rather than folding them into notes).
                if (task.extra) {
                    md += `\n${task.extra}\n`;
                }

                if (task.notes) {
                    md += `\n**Notes**:\n${task.notes}\n`;
                }

                md += `\n`; // Just one blank line between tasks, no ---
            });

            return md;
        }

        // Show notification
