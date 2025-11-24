// Markdown parsing and generation module
// Handles conversion between markdown format and task objects
import DOMPurify from "dompurify";

// Parse markdown content into tasks and config
function parseMarkdown(content) {
  const tasks = [];
  const config = {
    lastTaskId: 0,
    columns: [],
    categories: [],
    users: [],
    priorities: [],
    tags: [],
  };

  // Parse config comment
  const configMatch = content.match(/<!-- Config: Last Task ID: (\d+) -->/);
  if (configMatch) {
    config.lastTaskId = parseInt(configMatch[1]);
  }

  // Parse config section
  const configSection = content.match(
    /## ⚙️ Configuration\s+([\s\S]*?)(?:---|$)/,
  );
  if (configSection) {
    const configText = configSection[1];

    // Parse columns
    const columnsMatch = configText.match(/\*\*Columns\*\*:\s*(.+)/);
    if (columnsMatch) {
      config.columns = columnsMatch[1]
        .split("|")
        .map((col) => {
          const match = col.trim().match(/(.+?)\s*\((.+?)\)/);
          if (match) {
            return { name: match[1].trim(), id: match[2].trim() };
          }
          return null;
        })
        .filter(Boolean);
    }

    // Parse categories
    const categoriesMatch = configText.match(/\*\*Categories\*\*:\s*(.+)/);
    if (categoriesMatch) {
      config.categories = categoriesMatch[1]
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
    }

    // Parse users
    const usersMatch = configText.match(/\*\*Users\*\*:\s*(.+)/);
    if (usersMatch) {
      config.users = usersMatch[1]
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
    }

    // Parse priorities
    const prioritiesMatch = configText.match(/\*\*Priorities\*\*:\s*(.+)/);
    if (prioritiesMatch) {
      config.priorities = prioritiesMatch[1]
        .split("|")
        .map((p) => p.trim())
        .filter(Boolean);
    }

    // Parse tags
    const tagsMatch = configText.match(/\*\*Tags\*\*:\s*(.+)/);
    if (tagsMatch) {
      config.tags = tagsMatch[1]
        .split(/\s+/)
        .filter((t) => t.startsWith("#"))
        .map((t) => t.replace("#", ""));
    }
  }

  // Default columns if not found
  if (config.columns.length === 0) {
    config.columns = [
      { name: "📝 To Do", id: "todo" },
      { name: "🚀 In Progress", id: "in-progress" },
      { name: "👀 In Review", id: "in-review" },
      { name: "✅ Done", id: "done" },
    ];
  }

  // Default categories if not found
  if (config.categories.length === 0) {
    config.categories = [
      "Frontend",
      "Backend",
      "Design",
      "DevOps",
      "Tests",
      "Documentation",
    ];
  }

  // Default users if not found
  if (config.users.length === 0) {
    config.users = ["@user (User)"];
  }

  // Default priorities if not found
  if (config.priorities.length === 0) {
    config.priorities = ["🔴 Critical", "🟠 High", "🟡 Medium", "🟢 Low"];
  }

  // Default tags if not found
  if (config.tags.length === 0) {
    config.tags = [
      "bug",
      "feature",
      "ui",
      "backend",
      "urgent",
      "refactor",
      "docs",
      "test",
    ];
  }

  // First, detect all section headers in the file (## Header) that are NOT config or special sections
  const sectionHeaderRegex = /^##\s+(?!⚙️\s*Configuration)(.+)$/gm;
  const detectedSections = [];
  let match;

  while ((match = sectionHeaderRegex.exec(content)) !== null) {
    const sectionName = match[1].trim();
    // Skip the separator line
    if (sectionName === "---") continue;

    // Convert section name to ID (lowercase, replace spaces with hyphens)
    // Remove emojis and special chars, then clean up any leading/trailing dashes
    const sectionId = sectionName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove emojis and special chars
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/^-+|-+$/g, "") // Remove leading/trailing dashes
      .replace(/-+/g, "-"); // Collapse multiple dashes into one

    detectedSections.push({ name: sectionName, id: sectionId });
  }

  // Merge detected sections with config columns, preserving file order
  console.log(
    `📋 Detected ${detectedSections.length} sections in file:`,
    detectedSections,
  );
  detectedSections.forEach((section) => {
    const exists = config.columns.some(
      (col) => col.id === section.id || col.name === section.name,
    );
    if (!exists) {
      console.log(
        `➕ Adding new column from file: ${section.name} (${section.id})`,
      );
      config.columns.push(section);
    }
  });
  console.log(`📊 Final columns config:`, config.columns);

  // Parse tasks by sections using the unified parser
  config.columns.forEach((column) => {
    const columnTasks = parseTasksFromSection(content, column.name, column.id);
    tasks.push(...columnTasks);
  });

  return { tasks, config };
}

// Parse tasks from a markdown section (reusable for both kanban and archive)
function parseTasksFromSection(content, sectionName, statusId) {
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
    return tasksFound;
  }

  // SIMPLE PARSING: Split by ### TASK-
  const taskBlocks = sectionContent.split(/###\s+TASK-/).slice(1); // Skip first empty element

  taskBlocks.forEach((block) => {
    // Each block starts with: XXX | Title
    const lines = block.split("\n");
    const firstLine = lines[0].trim();

    // Extract ID and title from first line
    const pipeIndex = firstLine.indexOf("|");
    if (pipeIndex > 0) {
      const idPart = firstLine.substring(0, pipeIndex).trim();
      const titlePart = firstLine.substring(pipeIndex + 1).trim();

      // Check if idPart is a valid number
      const idMatch = idPart.match(/^(\d+)$/);
      if (idMatch && titlePart) {
        const taskId = "TASK-" + idPart.padStart(3, "0");
        const title = titlePart;
        const taskContent = lines.slice(1).join("\n");

        const task = parseTask(taskId, title, taskContent, statusId);
        if (task) {
          tasksFound.push(task);
        }
      }
    }
  });

  return tasksFound;
}

// Parse individual task
function parseTask(id, title, content, status) {
  const task = {
    id,
    title: title.trim(),
    status,
    priority: "",
    category: "",
    assignees: [],
    tags: [],
    created: "",
    started: "",
    due: "",
    completed: "",
    description: "",
    subtasks: [],
    notes: "",
  };

  // Parse metadata line - now with Status field support
  const metaMatch = content.match(/\*\*Priority\*\*:\s*([^|]+)/);
  if (metaMatch) {
    task.priority = metaMatch[1].trim();
  }

  const categoryMatch = content.match(/\*\*Category\*\*:\s*([^|]+)/);
  if (categoryMatch) {
    task.category = categoryMatch[1].trim();
  }

  const assignedMatch = content.match(/\*\*Assigned\*\*:\s*(.+?)(?:\s*\||$)/m);
  if (assignedMatch) {
    task.assignees = assignedMatch[1].split(",").map((a) => a.trim());
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

  // Parse Status field - if present, it's authoritative (overrides section)
  const statusMatch = content.match(/\*\*Status\*\*:\s*(\S+)/i);
  if (statusMatch) {
    // Accept any status value - it will be used to move the task to the correct section
    const parsedStatus = statusMatch[1].toLowerCase().trim();

    console.log(
      `🔍 Task ${id}: current section='${status}', parsed Status field='${parsedStatus}'`,
    );

    // If the status doesn't match the section we're in, mark it for reorganization
    if (parsedStatus !== status) {
      console.log(
        `✨ Task ${id} marked for reorganization: will move from '${status}' to '${parsedStatus}'`,
      );
      task._needsReorganization = true;
      task.status = parsedStatus; // Use the parsed status
    } else {
      console.log(`✓ Task ${id} already in correct section '${status}'`);
    }
  }

  // Parse tags
  const tagsMatch = content.match(/\*\*Tags\*\*:\s*(.+)/);
  if (tagsMatch) {
    task.tags = tagsMatch[1].match(/#[\w-]+/g) || [];
  }

  // Parse description (text after dates/tags but before "**Sous-tâches**" or "**Notes**")
  const lines = content.split("\n");
  let descriptionLines = [];
  let inDescription = false;

  for (let line of lines) {
    // Skip metadata lines
    if (
      line.match(
        /^\*\*(Priority|Category|Assigned|Created|Started|Due|Finished|Tags|Status)\*\*/,
      )
    ) {
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
  task.description = descriptionLines.join(" ").substring(0, 200);

  // Parse subtasks
  const subtaskMatches = content.matchAll(/- \[(x| )\] (.+)/g);
  for (const match of subtaskMatches) {
    task.subtasks.push({
      completed: match[1] === "x",
      text: match[2].trim(),
    });
  }

  // Parse notes - everything after **Notes**: until end of task
  const notesMatch = content.match(/\*\*Notes\*\*:\s*\n([\s\S]*?)$/);
  if (notesMatch) {
    task.notes = notesMatch[1].trim();
  }

  return task;
}

// Parse archived tasks from archive.md
function parseArchive(content) {
  const archivedTasks = [];

  // Parse archived tasks section
  const archiveSection = content.match(/## ✅ Archives\s+([\s\S]*?)$/);
  if (archiveSection) {
    const archiveContent = archiveSection[1];
    const taskBlocks = archiveContent.split(/###\s+TASK-/).slice(1);

    taskBlocks.forEach((block) => {
      const lines = block.split("\n");
      const firstLine = lines[0].trim();
      const pipeIndex = firstLine.indexOf("|");

      if (pipeIndex > 0) {
        const idPart = firstLine.substring(0, pipeIndex).trim();
        const titlePart = firstLine.substring(pipeIndex + 1).trim();
        const idMatch = idPart.match(/^(\d+)$/);

        if (idMatch && titlePart) {
          const taskId = "TASK-" + idPart.padStart(3, "0");
          const title = titlePart;
          const taskContent = lines.slice(1).join("\n");
          const task = parseTask(taskId, title, taskContent, "archived");

          if (task) {
            archivedTasks.push(task);
          }
        }
      }
    });
  }

  return archivedTasks;
}

// Generate markdown from tasks and config
function generateMarkdown(tasks, config) {
  let md = `# Kanban Board\n\n<!-- Config: Last Task ID: ${config.lastTaskId} -->\n\n`;

  // Update config with values from tasks (merge with existing)
  const allCategories = new Set(config.categories || []);
  const allUsers = new Set(config.users || []);
  const allTags = new Set(config.tags || []);

  tasks.forEach((task) => {
    if (task.category) allCategories.add(task.category);
    task.assignees.forEach((u) => allUsers.add(u));
    task.tags.forEach((t) => allTags.add(t.replace("#", "")));
  });

  // Update config with merged values
  config.categories = [...allCategories];
  config.users = [...allUsers];
  config.tags = [...allTags];

  // Ensure defaults exist
  if (config.categories.length === 0) {
    config.categories = [
      "Frontend",
      "Backend",
      "Design",
      "DevOps",
      "Tests",
      "Documentation",
    ];
  }
  if (config.users.length === 0) {
    config.users = ["@user (User)"];
  }
  if (config.priorities.length === 0) {
    config.priorities = ["🔴 Critical", "🟠 High", "🟡 Medium", "🟢 Low"];
  }
  if (config.tags.length === 0) {
    config.tags = [
      "bug",
      "feature",
      "ui",
      "backend",
      "urgent",
      "refactor",
      "docs",
      "test",
    ];
  }

  // Add config section
  md += `## ⚙️ Configuration\n\n`;
  md += `**Columns**: ${config.columns.map((c) => `${c.name} (${c.id})`).join(" | ")}\n\n`;
  md += `**Categories**: ${config.categories.join(", ")}\n\n`;
  md += `**Users**: ${config.users.join(", ")}\n\n`;
  md += `**Priorities**: ${config.priorities.join(" | ")}\n\n`;
  md += `**Tags**: ${config.tags.map((t) => "#" + t).join(" ")}\n\n`;
  md += `---\n\n`;

  // Add tasks by column
  config.columns.forEach((column, index) => {
    md += `## ${column.name}\n\n`;

    const columnTasks = tasks.filter((t) => t.status === column.id);
    columnTasks.forEach((task) => {
      md += `### ${task.id} | ${task.title}\n`;

      let meta = "";
      if (task.priority) meta += `**Priority**: ${task.priority}`;
      if (task.category)
        meta += (meta ? " | " : "") + `**Category**: ${task.category}`;
      meta += (meta ? " | " : "") + `**Status**: ${task.status}`;
      if (task.assignees.length > 0)
        meta += ` | **Assigned**: ${task.assignees.join(", ")}`;
      if (meta) md += meta + "\n";

      // Write dates line
      let dates = "";
      if (task.created) dates += `**Created**: ${task.created}`;
      if (task.started)
        dates += (dates ? " | " : "") + `**Started**: ${task.started}`;
      if (task.due) dates += (dates ? " | " : "") + `**Due**: ${task.due}`;
      if (task.completed)
        dates += (dates ? " | " : "") + `**Finished**: ${task.completed}`;
      if (dates) md += dates + "\n";

      if (task.tags.length > 0) {
        md += `**Tags**: ${task.tags.join(" ")}\n`;
      }

      if (task.description) {
        md += `\n${task.description}\n`;
      }

      if (task.subtasks.length > 0) {
        md += `\n**Subtasks**:\n`;
        task.subtasks.forEach((st) => {
          md += `- [${st.completed ? "x" : " "}] ${st.text}\n`;
        });
      }

      if (task.notes) {
        md += `\n**Notes**:\n${task.notes}\n`;
      }

      md += `\n`; // Just one blank line between tasks
    });
    // No separator between sections - only one separator after config section
  });

  return md;
}

// Generate archive markdown
function generateArchiveMarkdown(archivedTasks) {
  let md = `# Task Archive\n\n> Archived tasks\n\n## ✅ Archives\n\n`;

  archivedTasks.forEach((task) => {
    md += `### ${task.id} | ${task.title}\n`;

    let meta = "";
    if (task.priority) meta += `**Priority**: ${task.priority}`;
    if (task.category)
      meta += (meta ? " | " : "") + `**Category**: ${task.category}`;
    if (task.assignees.length > 0)
      meta +=
        (meta ? " | " : "") + `**Assigned**: ${task.assignees.join(", ")}`;
    if (meta) md += meta + "\n";

    // Write dates line
    let dates = "";
    if (task.created) dates += `**Created**: ${task.created}`;
    if (task.started)
      dates += (dates ? " | " : "") + `**Started**: ${task.started}`;
    if (task.due) dates += (dates ? " | " : "") + `**Due**: ${task.due}`;
    if (task.completed)
      dates += (dates ? " | " : "") + `**Finished**: ${task.completed}`;
    if (dates) md += dates + "\n";

    if (task.tags.length > 0) {
      md += `**Tags**: ${task.tags.join(" ")}\n`;
    }

    if (task.description) {
      md += `\n${task.description}\n`;
    }

    if (task.subtasks.length > 0) {
      md += `\n**Subtasks**:\n`;
      task.subtasks.forEach((st) => {
        md += `- [${st.completed ? "x" : " "}] ${st.text}\n`;
      });
    }

    if (task.notes) {
      md += `\n**Notes**:\n${task.notes}\n`;
    }

    md += `\n`;
  });

  return md;
}

// Enhanced markdown to HTML converter for notes
function markdownToHtml(markdown) {
  if (!markdown) return "";

  let html = markdown;

  // First, extract code blocks before escaping HTML
  const codeBlocks = [];
  html = html.replace(
    /```([^\n`]*)\n?([\s\S]*?)```/g,
    (match, language, code) => {
      const lang = (language || "").trim() || "text";
      const placeholder = `\n__CODE_BLOCK_${codeBlocks.length}__\n`;
      const escapedCode = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      codeBlocks.push(
        `<pre><code class="language-${lang}">${escapedCode}</code></pre>`,
      );
      return placeholder;
    },
  );

  // Escape HTML in the remaining text
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Convert markdown syntax
  html = html
    // Headers
    .replace(/^### (.*$)/gim, "<h3>$1</h3>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Unordered lists
    .replace(/^\* (.+)$/gm, "<li>$1</li>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    // Inline code (after escaping)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");

  // Wrap in paragraph tags if needed
  if (!html.startsWith("<")) {
    html = "<p>" + html + "</p>";
  }

  // Wrap list items with ul tags
  html = html.replace(/(<li>.*<\/li>)/s, (match) => {
    return "<ul>" + match + "</ul>";
  });

  // Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`__CODE_BLOCK_${i}__`, block);
  });

  // Sanitize HTML to prevent XSS attacks
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "p",
      "strong",
      "em",
      "code",
      "pre",
      "ul",
      "li",
      "a",
      "br",
    ],
    ALLOWED_ATTR: ["href", "target", "class"],
  });
}

// Status field reorganization timer
let statusReorganizationTimer = null;

// Schedule markdown reorganization after Status field change
function scheduleStatusReorganization(tasks, config, saveCallback) {
  // Clear any existing timer
  if (statusReorganizationTimer) {
    clearTimeout(statusReorganizationTimer);
  }

  // Set new timer for 2-3 seconds
  statusReorganizationTimer = setTimeout(() => {
    const markdown = generateMarkdown(tasks, config);
    saveCallback(markdown);
  }, 2500); // 2.5 seconds delay
}

// Export for use in other modules
export const markdownParser = {
  parseMarkdown,
  parseArchive,
  parseTasksFromSection,
  parseTask,
  generateMarkdown,
  generateArchiveMarkdown,
  markdownToHtml,
  scheduleStatusReorganization,
};

export {
  parseMarkdown,
  parseArchive,
  parseTasksFromSection,
  parseTask,
  generateMarkdown,
  generateArchiveMarkdown,
  markdownToHtml,
  scheduleStatusReorganization,
};
