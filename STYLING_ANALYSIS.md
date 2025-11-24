# Complete Styling Analysis - task-manager-old.html

## CSS Variables (Root Colors & Theme)

```css
:root {
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --border-color: #e0e0e0;
    --text-primary: #212121;
    --text-secondary: #757575;
    --accent: #2196F3;
    --accent-hover: #1976D2;
    --shadow: 0 2px 4px rgba(0,0,0,0.1);
    --shadow-hover: 0 4px 8px rgba(0,0,0,0.15);

    /* Priority colors */
    --priority-default: #888888;
    --priority-red: #EF4444;
    --priority-orange: #F97316;
    --priority-yellow: #EAB308;
    --priority-green: #22C55E;
    --priority-blue: #3B82F6;
    --priority-purple: #A855F7;
    --priority-white: #E5E7EB;
    --priority-black: #1F2937;
}
```

## Global Styles

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.6;
}
```

## Header Styling

```css
.header {
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 2rem;
    box-shadow: var(--shadow);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
}
```

## Button Styles

### Base Button
```css
.btn {
    padding: 0.6rem 1.2rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
}
```

### Primary Button
```css
.btn-primary {
    background: var(--accent);
    color: white;
}

.btn-primary:hover {
    background: var(--accent-hover);
    box-shadow: var(--shadow-hover);
}
```

### Secondary Button
```css
.btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: #e8e8e8;
}
```

### Delete Project Button (Special)
```css
#deleteProjectBtn:hover {
    background: #ef4444 !important;
    color: white !important;
}
```

## Container & Layout

```css
.container {
    max-width: 1400px;
    margin: 2rem auto;
    padding: 0 2rem;
}
```

## Welcome Screen

```css
.welcome {
    text-align: center;
    padding: 4rem 2rem;
}

.welcome h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.welcome p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
    font-size: 1.1rem;
}
```

## Filter Bar

```css
#filterBar {
    display: none;
    background: white;
    border-bottom: 1px solid var(--border-color);
    padding: 1rem 0;
}

/* Global Search Input */
#globalSearchInput {
    width: 100%;
    padding: 0.75rem 3rem 0.75rem 1rem;
    border: 2px solid #cbd5e0;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
}

/* Clear Search Button */
#clearGlobalSearch {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    font-size: 1.2rem;
    padding: 0.5rem;
    display: none;
}
```

### Filter Selects & Buttons
```css
/* Filter select dropdowns */
#filterBar select {
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    min-width: 150px;
}

/* Filter labels */
#filterBar label {
    font-weight: 500;
    font-size: 0.9rem;
}

/* Filter "+" buttons */
#filterBar .btn-primary {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
}

/* Clear all button */
#filterBar button[onclick="clearFilters()"] {
    padding: 0.5rem 1rem;
}
```

## Kanban Board Layout

```css
#kanbanView {
    margin: 0;
    padding: 0;
}

.kanban-board {
    display: flex;
    gap: 1.5rem;
    margin: 0;
    padding: 2rem;
    overflow-x: auto;
    justify-content: flex-start;
}
```

## Kanban Columns

```css
.kanban-column {
    background: var(--bg-secondary);
    border-radius: 8px;
    padding: 1rem;
    box-shadow: var(--shadow);
    min-width: 280px;
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
}

.column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid var(--border-color);
}

.column-title {
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.column-count {
    background: var(--bg-primary);
    padding: 0.25rem 0.6rem;
    border-radius: 12px;
    font-size: 0.85rem;
    color: var(--text-secondary);
}

.task-list {
    min-height: 100px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
```

## Task Cards

```css
.task-card {
    background: white;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 1rem;
    cursor: move;
    transition: all 0.2s;
    animation: taskAppear 0.3s ease-out;
}

@keyframes taskAppear {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.task-card:hover {
    box-shadow: var(--shadow-hover);
    transform: translateY(-2px);
}

.task-card.dragging {
    opacity: 0.5;
}

.task-card.updating {
    animation: taskUpdate 0.3s ease-out;
}

@keyframes taskUpdate {
    0% {
        background: #f0f9ff;
    }
    100% {
        background: white;
    }
}
```

### Task Card Elements

```css
.task-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 0.5rem;
}

.task-id {
    font-size: 0.75rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.task-title {
    font-weight: 600;
    font-size: 0.95rem;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.task-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.75rem;
}

.task-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
```

## Badges & Tags

```css
.badge {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
}

.badge-priority {
    color: white;
    background: var(--priority-default);
}

.badge-priority.Default { background: var(--priority-default); }
.badge-priority.Red { background: var(--priority-red); }
.badge-priority.Orange { background: var(--priority-orange); }
.badge-priority.Yellow { background: var(--priority-yellow); }
.badge-priority.Green { background: var(--priority-green); }
.badge-priority.Blue { background: var(--priority-blue); }
.badge-priority.Purple { background: var(--priority-purple); }
.badge-priority.White { background: var(--priority-white); color: #1F2937; }
.badge-priority.Black { background: var(--priority-black); }

.badge-category {
    background: #E3F2FD;
    color: #1565C0;
}

.badge-assignee {
    background: #F3E5F5;
    color: #6A1B9A;
}

.tag {
    background: #FFF3E0;
    color: #E65100;
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    font-size: 0.7rem;
}
```

## Subtasks & Progress

```css
.task-subtasks {
    margin-top: 0.75rem;
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.subtask-progress {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.progress-bar {
    flex: 1;
    height: 4px;
    background: var(--bg-primary);
    border-radius: 2px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.3s;
}
```

## Code Blocks

```css
pre {
    margin: 1rem 0;
    border-radius: 6px;
    overflow-x: auto;
    background: #2d2d2d;
    padding: 1rem;
}

pre code {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    line-height: 1.5;
    color: #f8f8f2;
    display: block;
}

/* Inline code styling */
code {
    background: #2d2d2d;
    color: #f8f8f2;
    padding: 0.125rem 0.35rem;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 0.9em;
}

/* Override for code inside pre */
pre code {
    background: none;
    padding: 0;
}
```

## Modal Styles

```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    align-items: center;
    justify-content: center;
}

.modal.active {
    display: flex;
}

.modal-content {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    width: 80%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.modal-header h2 {
    font-size: 1.5rem;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
}
```

## Form Styles

```css
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-primary);
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
}

.form-group textarea {
    min-height: 100px;
    resize: vertical;
}
```

### Specific Form Styling (Task Form)

```css
#newTaskForm {
    padding: 1.5rem;
    background: #f8f9fa;
}

/* Form inputs with enhanced borders */
#newTaskForm input,
#newTaskForm textarea,
#newTaskForm select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #cbd5e0;
    border-radius: 6px;
    font-size: 0.95rem;
    background: white;
    box-sizing: border-box;
}

/* Form labels */
#newTaskForm label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #333;
}

/* Help text */
#newTaskForm small {
    color: var(--text-secondary);
    font-size: 0.85rem;
}
```

## Task Detail Modal

```css
.task-detail {
    line-height: 1.8;
}

.task-detail strong {
    color: var(--text-primary);
}
```

## Actions (Button Groups)

```css
.actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}
```

## Notifications

```css
.notification {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    background: white;
    padding: 1rem 1.5rem;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    display: none;
    align-items: center;
    gap: 0.75rem;
    z-index: 1001;
}

.notification.show {
    display: flex;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        transform: translateY(100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.notification.success {
    border-left: 4px solid #22C55E;
}

.notification.error {
    border-left: 4px solid #EF4444;
}

.notification.info {
    border-left: 4px solid #3B82F6;
}
```

## Loading Spinner

```css
.loading {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 3px solid var(--bg-primary);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

## Empty State

```css
.empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
}
```

## Debug Info

```css
.debug-info {
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 1rem;
    margin: 1rem 0;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.85rem;
    white-space: pre-wrap;
    word-wrap: break-word;
}
```

## Inline Styles Used in HTML

### Header Buttons Container
```css
display: flex;
gap: 0.75rem;
align-items: center;
```

### Language Selector
```css
padding: 0.6rem 1rem;
border: 1px solid var(--border-color);
border-radius: 6px;
font-size: 0.9rem;
background: white;
cursor: pointer;
```

### Project Selector
```css
display: none; /* initially */
padding: 0.6rem 1rem;
border: 1px solid var(--border-color);
border-radius: 6px;
font-size: 0.9rem;
background: white;
cursor: pointer;
min-width: 180px;
```

### Rename/Delete Buttons
```css
display: none; /* initially */
padding: 0.6rem;
```

### Welcome Screen Info Box
```css
margin-top: 2rem;
padding: 1.5rem;
background: white;
border-radius: 8px;
max-width: 600px;
margin-left: auto;
margin-right: auto;
text-align: left;
```

### Filter Bar Inner Container
```css
max-width: 1200px;
margin: 0 auto;
padding: 0 2rem;
```

### Global Search Container
```css
position: relative;
max-width: 600px;
width: 100%;
```

### Filter Controls Container
```css
display: flex;
gap: 1rem;
align-items: center;
flex-wrap: wrap;
margin-bottom: 0.75rem;
justify-content: center;
```

### Filter Label Groups
```css
display: flex;
gap: 0.5rem;
align-items: center;
```

### Active Filters Container
```css
display: flex;
gap: 0.5rem;
flex-wrap: wrap;
min-height: 32px;
justify-content: center;
```

## Archive Modal Specific Styles

### Archive List Items
```css
/* Archive task card */
background: white;
border: 2px solid #e2e8f0;
border-radius: 8px;
padding: 1rem;
margin-bottom: 0.75rem;

/* Archive task header */
display: flex;
justify-content: space-between;
align-items: start;
margin-bottom: 0.5rem;

/* Archive task ID badge */
background: #6b7280;
color: white;
padding: 0.25rem 0.5rem;
border-radius: 4px;
font-size: 0.75rem;
font-weight: 600;

/* Archive task title */
margin-left: 0.5rem;
font-size: 1.1rem;

/* Archive button group */
display: flex;
gap: 0.5rem;
```

## Column Management Modal

### Column List Item
```css
display: flex;
gap: 0.5rem;
margin-bottom: 0.75rem;
padding: 0.75rem;
background: white;
border: 2px solid #cbd5e0;
border-radius: 6px;
align-items: center;
```

### Move Up/Down Buttons
```css
padding: 0.25rem 0.5rem;
font-size: 0.85rem;
```

## Task Form Subtasks

### Subtask List
```css
list-style: none;
padding: 0;
margin: 0 0 0.5rem 0;
max-height: 150px;
overflow-y: auto;
```

### Subtask Item
```css
padding: 0.5rem;
margin-bottom: 0.25rem;
background: white;
border: 1px solid #cbd5e0;
border-radius: 4px;
display: flex;
align-items: center;
gap: 0.5rem;
```

### Subtask Checkbox
```css
width: 16px;
height: 16px;
cursor: pointer;
```

## Summary of Key Values

### Colors
- Primary Background: `#f5f5f5`
- Secondary Background (cards): `#ffffff`
- Border Color: `#e0e0e0`
- Primary Text: `#212121`
- Secondary Text: `#757575`
- Accent (Blue): `#2196F3`
- Accent Hover: `#1976D2`

### Shadows
- Default: `0 2px 4px rgba(0,0,0,0.1)`
- Hover: `0 4px 8px rgba(0,0,0,0.15)`
- Notification: `0 4px 12px rgba(0,0,0,0.15)`

### Border Radius
- Small elements (badges): `3px` - `4px`
- Medium elements (buttons, inputs): `6px`
- Large elements (cards): `8px`
- Pill shapes (counts): `12px`

### Spacing
- Small gap: `0.5rem`
- Medium gap: `0.75rem` - `1rem`
- Large gap: `1.5rem` - `2rem`

### Font Sizes
- Small (task ID, badges): `0.75rem` - `0.8rem`
- Regular (task description): `0.85rem`
- Medium (buttons, inputs): `0.9rem` - `0.95rem`
- Default: `1rem`
- Large (column title): `1.1rem`
- XL (modal title): `1.5rem`
- XXL (welcome): `2rem`

### Transitions
- All elements: `all 0.2s`
- Specific (progress): `width 0.3s`
- Border color: `border-color 0.2s`
