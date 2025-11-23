// Translation system module
let currentLanguage = "en"; // Default language

const translations = {
  en: {
    // Page title
    "page.title": "Markdown Task Manager",

    // Header
    "header.title": "📋 Task Manager",
    "header.renameProject": "Rename project",
    "header.deleteProject": "Remove project from list",
    "header.folder": "📁 Folder",
    "header.newTask": "➕ Task",
    "header.archives": "📦 Archives",
    "header.columns": "⚙️ Columns",

    // Filters
    "filters.tags": "Tags:",
    "filters.category": "Category:",
    "filters.user": "User:",
    "filters.priority": "Priority:",
    "filters.select": "Select...",
    "filters.add": "+",
    "filters.clearAll": "✕ Clear all",
    "filters.search": "Search in tasks...",
    "filters.searchClear": "✕",

    // Welcome screen
    "welcome.title": "Welcome! 👋",
    "welcome.description":
      "Select the folder containing your Markdown files (kanban.md and archive.md)",
    "welcome.start": "📁 Get Started",
    "welcome.howItWorks": "💡 How does it work?",
    "welcome.step1": 'Click "Get Started" above',
    "welcome.step2": "Select the folder containing your Markdown files",
    "welcome.step3": "The app automatically loads kanban.md",
    "welcome.step4": "Manage your tasks visually with Kanban",
    "welcome.step5": "Changes are saved to Markdown files",
    "welcome.browserWarning":
      "⚠️ Supported browsers: Chrome 86+, Edge 86+, Opera 72+",

    // Task detail modal
    "taskDetail.title": "Task Details",
    "taskDetail.close": "Close",
    "taskDetail.delete": "🗑️ Delete",
    "taskDetail.archive": "📦 Archive",
    "taskDetail.edit": "✏️ Edit",

    // Task form modal
    "taskForm.newTask": "New Task",
    "taskForm.editTask": "Edit Task",
    "taskForm.titleLabel": "Title *",
    "taskForm.columnLabel": "Column *",
    "taskForm.priorityLabel": "Priority",
    "taskForm.priorityNone": "None",
    "taskForm.priorityCritical": "Critical",
    "taskForm.priorityHigh": "High",
    "taskForm.priorityMedium": "Medium",
    "taskForm.priorityLow": "Low",
    "taskForm.categoryLabel": "Category",
    "taskForm.categoryPlaceholder": "Frontend, Backend...",
    "taskForm.assignedLabel": "Assigned to",
    "taskForm.assignedPlaceholder": "@alice",
    "taskForm.createdLabel": "Created",
    "taskForm.startedLabel": "Started",
    "taskForm.dueLabel": "Due",
    "taskForm.completedLabel": "Completed",
    "taskForm.tagsLabel": "Tags",
    "taskForm.tagsPlaceholder": "#bug #feature",
    "taskForm.tagsHelp": "Separate with spaces",
    "taskForm.descriptionLabel": "Description",
    "taskForm.subtasksLabel": "Subtasks",
    "taskForm.subtaskPlaceholder": "Add a subtask...",
    "taskForm.subtaskAdd": "+ Add",
    "taskForm.notesLabel": "Notes",
    "taskForm.notesPlaceholder": "Technical notes, results, decisions, etc...",
    "taskForm.notesHelp":
      "Markdown supported: **bold**, *italic*, `code`, lists, links, **Subsections**:",
    "taskForm.cancel": "Cancel",
    "taskForm.create": "Create",
    "taskForm.save": "Save",

    // Columns modal
    "columns.title": "Manage Columns",
    "columns.add": "+ Add Column",

    // Archives modal
    "archives.title": "📦 Archives",
    "archives.search": "Search in archives...",
    "archives.empty": "No archived tasks",

    // Project selector
    "projects.select": "Select a project...",

    // Task metadata in detail modal
    "meta.priority": "Priority",
    "meta.status": "Status",
    "meta.category": "Category",
    "meta.assigned": "Assigned to",
    "meta.created": "Creation date",
    "meta.started": "Start date",
    "meta.due": "Due date",
    "meta.completed": "Completion date",
    "meta.tags": "Tags",
    "meta.description": "Description",
    "meta.subtasks": "Subtasks ({completed}/{total})",
    "meta.notes": "Notes",

    // Empty states
    "empty.noTasks": "No tasks",

    // Buttons and actions
    "action.restore": "↩️ Restore",
    "action.delete": "🗑️",
    "action.edit": "✏️",
    "action.moveUp": "Move up",
    "action.moveDown": "Move down",

    // Tooltips
    "tooltip.filterByCategory": "Filter by this category",
    "tooltip.filterByUser": "Filter by this user",
    "tooltip.filterByTag": "Filter by this tag",
    "tooltip.filterByPriority": "Filter by this priority",
    "tooltip.doubleClickEdit": "Double-click to edit",
    "tooltip.delete": "Delete",

    // Notifications
    "notif.folderLoaded": "Folder loaded successfully!",
    "notif.folderError": "Error loading folder",
    "notif.initializingFolder": "Initializing folder...",
    "notif.filesInitialized":
      "Files initialized successfully! (kanban.md and archive.md)",
    "notif.filesError": "Error creating files",
    "notif.projectLoaded": 'Project "{name}" loaded',
    "notif.permissionDenied": "Permission denied for this project",
    "notif.projectError": "Error switching project",
    "notif.projectRenamed": "Project renamed successfully",
    "notif.projectDeleted": "Project removed from list",
    "notif.renameError": "Error renaming",
    "notif.projectRestored": "Project restored automatically",
    "notif.taskMoved": "Task moved!",
    "notif.taskEdited": "Task {id} updated!",
    "notif.taskCreated": "Task {id} created!",
    "notif.taskArchived": "Task archived!",
    "notif.taskDeleted": "Task permanently deleted",
    "notif.taskRestored": "Task restored to its original column!",

    // Prompts and confirmations
    "prompt.projectName": 'Project name (leave empty to use "{name}"):',
    "prompt.renameProject": "New project name:",
    "prompt.columnName": "Column name:",
    "prompt.columnId": "Column ID (e.g., todo, done):",
    "prompt.editSubtask": "Edit subtask:",
    "confirm.deleteColumn": "Delete this column?",
    "confirm.deleteSubtask": "Delete this subtask?",
    "confirm.deleteProject":
      'Remove project "{name}" from the recent list?\n\nThis only removes it from the dropdown - your files will not be deleted.',
    "confirm.archiveTask": 'Archive task "{title}"?',
    "confirm.deleteTask":
      '⚠️ WARNING: Permanently delete task "{title}"?\n\nThis action cannot be undone.',
    "confirm.deleteTaskFromArchive":
      '⚠️ WARNING: Permanently delete task "{title}"?\n\nThis action cannot be undone.\n\nIf you want to keep it in history, use "Archive" instead.',

    // Alerts
    "alert.browserNotSupported":
      "Your browser does not support the File System Access API.\n\nPlease use Chrome 86+, Edge 86+ or Opera 72+.",

    // Subtasks in detail modal
    "subtask.newPlaceholder": "New subtask...",

    // Markdown generation
    "markdown.archiveTitle": "# Task Archive",
    "markdown.archiveDesc": "> Archived tasks",
    "markdown.archiveSection": "## ✅ Archives",
    "markdown.configSection": "## ⚙️ Configuration",
    "markdown.configColumns": "**Columns**:",
    "markdown.configCategories": "**Categories**:",
    "markdown.configUsers": "**Users**:",
    "markdown.configPriorities": "**Priorities**:",
    "markdown.configTags": "**Tags**:",

    // Language selector
    "language.label": "Language:",
    "language.en": "English",
    "language.fr": "Français",
  },
  fr: {
    // Page title
    "page.title": "Gestionnaire de Tâches Markdown",

    // Header
    "header.title": "📋 Task Manager",
    "header.renameProject": "Renommer le projet",
    "header.deleteProject": "Retirer le projet de la liste",
    "header.folder": "📁 Dossier",
    "header.newTask": "➕ Tâche",
    "header.archives": "📦 Archives",
    "header.columns": "⚙️ Colonnes",

    // Filters
    "filters.tags": "Tags:",
    "filters.category": "Catégorie:",
    "filters.user": "Utilisateur:",
    "filters.priority": "Priorité:",
    "filters.select": "Sélectionner...",
    "filters.add": "+",
    "filters.clearAll": "✕ Tout effacer",
    "filters.search": "Rechercher dans les tâches...",
    "filters.searchClear": "✕",

    // Welcome screen
    "welcome.title": "Bienvenue ! 👋",
    "welcome.description":
      "Sélectionnez le dossier contenant vos fichiers Markdown (kanban.md et archive.md)",
    "welcome.start": "📁 Commencer",
    "welcome.howItWorks": "💡 Comment ça marche ?",
    "welcome.step1": 'Cliquez sur "Commencer" ci-dessus',
    "welcome.step2": "Sélectionnez le dossier contenant vos fichiers Markdown",
    "welcome.step3": "L'application charge automatiquement kanban.md",
    "welcome.step4": "Gérez vos tâches visuellement avec le Kanban",
    "welcome.step5":
      "Les modifications sont sauvegardées dans les fichiers Markdown",
    "welcome.browserWarning":
      "⚠️ Navigateurs supportés : Chrome 86+, Edge 86+, Opera 72+",

    // Task detail modal
    "taskDetail.title": "Détails de la tâche",
    "taskDetail.close": "Fermer",
    "taskDetail.delete": "🗑️ Supprimer",
    "taskDetail.archive": "📦 Archiver",
    "taskDetail.edit": "✏️ Modifier",

    // Task form modal
    "taskForm.newTask": "Nouvelle tâche",
    "taskForm.editTask": "Modifier la tâche",
    "taskForm.titleLabel": "Titre *",
    "taskForm.columnLabel": "Colonne *",
    "taskForm.priorityLabel": "Priorité",
    "taskForm.priorityNone": "Aucune",
    "taskForm.priorityCritical": "Critique",
    "taskForm.priorityHigh": "Haute",
    "taskForm.priorityMedium": "Moyenne",
    "taskForm.priorityLow": "Basse",
    "taskForm.categoryLabel": "Catégorie",
    "taskForm.categoryPlaceholder": "Frontend, Backend...",
    "taskForm.assignedLabel": "Assigné à",
    "taskForm.assignedPlaceholder": "@alice",
    "taskForm.createdLabel": "Créé",
    "taskForm.startedLabel": "Commencé",
    "taskForm.dueLabel": "Échéance",
    "taskForm.completedLabel": "Terminé",
    "taskForm.tagsLabel": "Tags",
    "taskForm.tagsPlaceholder": "#bug #feature",
    "taskForm.tagsHelp": "Séparez avec des espaces",
    "taskForm.descriptionLabel": "Description",
    "taskForm.subtasksLabel": "Sous-tâches",
    "taskForm.subtaskPlaceholder": "Ajouter une sous-tâche...",
    "taskForm.subtaskAdd": "+ Ajouter",
    "taskForm.notesLabel": "Notes",
    "taskForm.notesPlaceholder":
      "Notes techniques, résultats, décisions, etc...",
    "taskForm.notesHelp":
      "Markdown supporté : **gras**, *italique*, `code`, listes, liens, **Sous-sections**:",
    "taskForm.cancel": "Annuler",
    "taskForm.create": "Créer",
    "taskForm.save": "Enregistrer",

    // Columns modal
    "columns.title": "Gérer les colonnes",
    "columns.add": "+ Ajouter une colonne",

    // Archives modal
    "archives.title": "📦 Archives",
    "archives.search": "Rechercher dans les archives...",
    "archives.empty": "Aucune tâche archivée",

    // Project selector
    "projects.select": "Sélectionner un projet...",

    // Task metadata in detail modal
    "meta.priority": "Priorité",
    "meta.status": "Statut",
    "meta.category": "Catégorie",
    "meta.assigned": "Assigné à",
    "meta.created": "Date de création",
    "meta.started": "Date de début",
    "meta.due": "Date d'échéance",
    "meta.completed": "Date de fin",
    "meta.tags": "Tags",
    "meta.description": "Description",
    "meta.subtasks": "Sous-tâches ({completed}/{total})",
    "meta.notes": "Notes",

    // Empty states
    "empty.noTasks": "Aucune tâche",

    // Buttons and actions
    "action.restore": "↩️ Restaurer",
    "action.delete": "🗑️",
    "action.edit": "✏️",
    "action.moveUp": "Déplacer vers le haut",
    "action.moveDown": "Déplacer vers le bas",

    // Tooltips
    "tooltip.filterByCategory": "Filtrer par cette catégorie",
    "tooltip.filterByUser": "Filtrer par cet utilisateur",
    "tooltip.filterByTag": "Filtrer par ce tag",
    "tooltip.filterByPriority": "Filtrer par cette priorité",
    "tooltip.doubleClickEdit": "Double-cliquez pour éditer",
    "tooltip.delete": "Supprimer",

    // Notifications
    "notif.folderLoaded": "Dossier chargé avec succès !",
    "notif.folderError": "Erreur lors de la sélection du dossier",
    "notif.initializingFolder": "Initialisation du dossier...",
    "notif.filesInitialized":
      "Fichiers initialisés avec succès ! (kanban.md et archive.md)",
    "notif.filesError": "Erreur lors de la création des fichiers",
    "notif.projectLoaded": 'Projet "{name}" chargé',
    "notif.permissionDenied": "Permission refusée pour ce projet",
    "notif.projectError": "Erreur lors du changement de projet",
    "notif.projectRenamed": "Projet renommé avec succès",
    "notif.projectDeleted": "Projet retiré de la liste",
    "notif.renameError": "Erreur lors du renommage",
    "notif.projectRestored": "Projet restauré automatiquement",
    "notif.taskMoved": "Tâche déplacée !",
    "notif.taskEdited": "Tâche {id} modifiée !",
    "notif.taskCreated": "Tâche {id} créée !",
    "notif.taskArchived": "Tâche archivée !",
    "notif.taskDeleted": "Tâche supprimée définitivement",
    "notif.taskRestored": "Tâche restaurée dans sa colonne d'origine !",

    // Prompts and confirmations
    "prompt.projectName":
      'Nom du projet (laisser vide pour utiliser "{name}") :',
    "prompt.renameProject": "Nouveau nom du projet :",
    "prompt.columnName": "Nom de la colonne:",
    "prompt.columnId": "ID de la colonne (ex: todo, done):",
    "prompt.editSubtask": "Modifier la sous-tâche:",
    "confirm.deleteColumn": "Supprimer cette colonne ?",
    "confirm.deleteSubtask": "Supprimer cette sous-tâche ?",
    "confirm.deleteProject":
      'Retirer le projet "{name}" de la liste récente ?\n\nCeci retire seulement le projet du menu déroulant - vos fichiers ne seront pas supprimés.',
    "confirm.archiveTask": 'Archiver la tâche "{title}" ?',
    "confirm.deleteTask":
      '⚠️ ATTENTION : Supprimer définitivement la tâche "{title}" ?\n\nCette action est irréversible.',
    "confirm.deleteTaskFromArchive":
      '⚠️ ATTENTION : Supprimer définitivement la tâche "{title}" ?\n\nCette action est irréversible.\n\nSi vous voulez la conserver dans l\'historique, utilisez plutôt "Archiver".',

    // Alerts
    "alert.browserNotSupported":
      "Votre navigateur ne supporte pas la File System Access API.\n\nVeuillez utiliser Chrome 86+, Edge 86+ ou Opera 72+.",

    // Subtasks in detail modal
    "subtask.newPlaceholder": "Nouvelle sous-tâche...",

    // Markdown generation
    "markdown.archiveTitle": "# Archive des Tâches",
    "markdown.archiveDesc": "> Tâches archivées",
    "markdown.archiveSection": "## ✅ Archives",
    "markdown.configSection": "## ⚙️ Configuration",
    "markdown.configColumns": "**Colonnes**:",
    "markdown.configCategories": "**Catégories**:",
    "markdown.configUsers": "**Utilisateurs**:",
    "markdown.configPriorities": "**Priorités**:",
    "markdown.configTags": "**Tags**:",

    // Language selector
    "language.label": "Langue :",
    "language.en": "English",
    "language.fr": "Français",
  },
};

const priorityIconClasses = {
  // Color circles
  "🟢": "Green",
  "🟡": "Yellow",
  "🟠": "Orange",
  "🔴": "Red",
  "🔵": "Blue",
  "🟣": "Purple",
  "⚪": "White",
  "⚫": "Black",
  // Hearts
  "❤️": "Red",
  "🧡": "Orange",
  "💛": "Yellow",
  "💚": "Green",
  "💙": "Blue",
  "💜": "Purple",
  "🤍": "White",
  "🖤": "Black",
  // Squares
  "🟥": "Red",
  "🟧": "Orange",
  "🟨": "Yellow",
  "🟩": "Green",
  "🟦": "Blue",
  "🟪": "Purple",
  // Diamonds
  "🔶": "Orange",
  "🔷": "Blue",
  "🔸": "Orange",
  "🔹": "Blue",
  // Stars
  "⭐": "Yellow",
  "🌟": "Yellow",
  // Flags
  "🚩": "Red",
  "🏴": "Black",
  "🏳️": "White",
  // Alert symbols
  "⚠️": "Yellow",
  "🔥": "Orange",
  "💥": "Red",
  "⚡": "Yellow",
  // Arrows
  "⬆️": "Red",
  "➡️": "Blue",
  "⬇️": "Green",
  // Exclamation/Question
  "❗": "Red",
  "❓": "Blue",
  "❕": "Red",
  "❔": "Blue",
};

// Translation function
function t(key, params = {}) {
  let text =
    translations[currentLanguage]?.[key] || translations["en"][key] || key;

  // Replace placeholders with parameters
  Object.keys(params).forEach((param) => {
    text = text.replace(new RegExp(`\\{${param}\\}`, "g"), params[param]);
  });

  return text;
}

// Set language
function setLanguage(lang) {
  if (!translations[lang]) {
    console.warn(`Language "${lang}" not available, falling back to English`);
    lang = "en";
  }

  currentLanguage = lang;
  localStorage.setItem("preferredLanguage", lang);

  // Note: UI updates will be handled by Alpine reactivity
  console.log(`Language changed to: ${lang}`);
}

// Initialize language based on saved preference or browser language
function initLanguage() {
  // Check for saved preference first
  const savedLang = localStorage.getItem("preferredLanguage");
  if (savedLang && translations[savedLang]) {
    currentLanguage = savedLang;
    return;
  }

  // Detect browser language
  const browserLang = navigator.language || navigator.userLanguage;
  const langCode = browserLang.toLowerCase().split("-")[0]; // e.g., "en-US" -> "en"

  // Check if we support this language, otherwise fallback to English
  if (translations[langCode]) {
    currentLanguage = langCode;
  } else {
    currentLanguage = "en"; // Default fallback
  }

  // Save the detected/default language
  localStorage.setItem("preferredLanguage", currentLanguage);
  console.log(`Language initialized to: ${currentLanguage}`);
}

// Export for use in other modules
window.translationSystem = {
  t,
  setLanguage,
  initLanguage,
  getCurrentLanguage: () => currentLanguage,
  priorityIconClasses,
};

// Also make t() available globally for Alpine templates
window.t = t;
