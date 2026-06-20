        // File System Access API
        let directoryHandle = null;
        let kanbanFileHandle = null;
        let currentKanbanContent = '';
        let tasks = [];
        let config = {};
        let activeFilters = []; // Array of {type: 'tag'|'category'|'user', value: string}
        let globalSearchTerm = ''; // Global search term for searching in title, description, and notes
        let isEditMode = false;
        let currentDetailTask = null;
        let formSubtasks = [];
        let archivedTasks = [];
        let archiveFileHandle = null;
        let wasArchiveModalActive = false;
        let loadedFormatV2 = false; // true once the loaded kanban.md is V2 (status carried by a **Status** field)
        let loadedArchiveV2 = false; // true once the loaded archive.md carries the v2 format marker
