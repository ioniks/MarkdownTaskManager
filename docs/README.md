# MarkdownTaskManager Documentation

**Version:** 1.0.0 | **Status:** Active

---

## Overview

This directory contains documentation for MarkdownTaskManager integration patterns, best practices, and advanced features.

---

## Documentation Files

| File | Purpose |
|------|---------|
| [MANUS_INLINE_LOGGING.md](./MANUS_INLINE_LOGGING.md) | Manus 2-Action Rule inline logging pattern for visual research operations |

---

## About MarkdownTaskManager

MarkdownTaskManager is a kanban-based task management system using markdown files for storage.

**Core Features:**
- Markdown-based task storage (kanban.md)
- Auto-archive support (archive.md)
- Status-based task organization (todo, in-progress, done)
- Tag and priority support
- React-based HTML viewer (task-manager.html)

---

## Integration Patterns

### Claude Code + Manus Philosophy

The Manus 2-Action Rule (from Meta AI's $2B acquisition) can be integrated with MarkdownTaskManager using inline logging:

**Pattern:** Append visual operations (WebFetch, WebSearch) directly to task's **Notes** section in kanban.md

**Benefits:**
- Logs survive task archiving
- Single source of truth
- Human-readable format
- No separate log files to manage

**Full details:** See [MANUS_INLINE_LOGGING.md](./MANUS_INLINE_LOGGING.md)

---

## Contributing

To add documentation:
1. Create markdown file in `docs/`
2. Add entry to this README
3. Follow existing format and style
4. Include version and date

---

**Last Updated:** 2026-01-11
