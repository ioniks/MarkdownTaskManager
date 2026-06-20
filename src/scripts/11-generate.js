        function generateMarkdown() {
            let md = `# Kanban Board\n\n<!-- Config: Last Task ID: ${config.lastTaskId} -->\n\n`;

            // Update config with values from tasks (merge with existing)
            const allCategories = new Set(config.categories || []);
            const allUsers = new Set(config.users || []);
            const allTags = new Set(config.tags || []);

            tasks.forEach(task => {
                if (task.category) allCategories.add(task.category);
                task.assignees.forEach(u => allUsers.add(u));
                task.tags.forEach(t => allTags.add(t.replace('#', '')));
            });

            // Update config with merged values
            config.categories = [...allCategories];
            config.users = [...allUsers];
            config.tags = [...allTags];

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

            // Add tasks by column
            config.columns.forEach(column => {
                md += `## ${column.name}\n\n`;

                const columnTasks = tasks.filter(t => t.status === column.id);
                columnTasks.forEach(task => {
                    md += `### ${task.id} | ${task.title}\n`;

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

                    if (task.notes) {
                        md += `\n**Notes**:\n${task.notes}\n`;
                    }

                    md += `\n`; // Just one blank line between tasks, no ---
                });
            });

            return md;
        }

        // Show notification
