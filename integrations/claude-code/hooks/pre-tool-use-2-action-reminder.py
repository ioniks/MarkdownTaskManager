#!/usr/bin/env python3
"""
PreToolUse 2-Action Rule Inline Logging Hook (Manus Pattern)

Purpose: Track visual/browser operations with inline logging to kanban Notes section,
         trigger findings file creation after 2 operations to preserve multimodal
         content as text.

Based on: Manus Philosophy (Meta AI - $2B acquisition value)
Pattern: 2-Action Rule - Save findings after every 2 visual operations

Hook Type: PreToolUse
Matcher: WebFetch|WebSearch
Exit Code Strategy:
  - 0: Allow operation (always)
  - Output reminder to create findings file after 2 operations

Logging:
  - Inline format: Appends to task's **Notes** section in kanban.md
  - Counter tracking: /tmp/claude-visual-ops-session.txt
  - Session-based: Resets when counter is manually reset

Version: 3.0.0 (Portable for MarkdownTaskManager)
License: MIT
"""

import json
import sys
import os
import re
from pathlib import Path
from datetime import datetime

# Configuration - Auto-detect project directory
PROJECT_DIR = os.getenv("CLAUDE_PROJECT_DIR", os.getcwd())
COUNTER_FILE = "/tmp/claude-visual-ops-session.txt"

# Kanban file locations - customize for your project structure
# Default: Single kanban.md at project root
# Multi-workspace: List multiple paths like ['docs/admin/kanban.md', 'docs/api/kanban.md']
KANBAN_FILES = [
    Path(PROJECT_DIR) / "kanban.md",
]

# Findings directory - where research logs are saved
# Default: Same directory as kanban file
# Custom: 'docs/findings', 'research/findings', etc.
FINDINGS_DIR = None  # None = same directory as kanban file

def get_visual_ops_count():
    """Get current visual operations count"""
    if os.path.exists(COUNTER_FILE):
        with open(COUNTER_FILE, 'r') as f:
            return int(f.read().strip() or "0")
    return 0

def increment_visual_ops():
    """Increment visual operations counter"""
    count = get_visual_ops_count() + 1
    with open(COUNTER_FILE, 'w') as f:
        f.write(str(count))
    return count

def reset_visual_ops():
    """Reset visual operations counter (called after findings file creation)"""
    if os.path.exists(COUNTER_FILE):
        os.remove(COUNTER_FILE)

def get_current_task():
    """Extract current TASK-XXX and kanban file from in-progress tasks"""
    for kanban_file in KANBAN_FILES:
        if not kanban_file.exists():
            continue

        with open(kanban_file, 'r') as f:
            content = f.read()

            # Look for in-progress tasks (MarkdownTaskManager format)
            if "**Status**: in-progress" in content:
                for line in content.split('\n'):
                    if "**Status**: in-progress" in line:
                        # Look backwards for TASK-XXX header
                        idx = content.index(line)
                        before = content[:idx]
                        for prev_line in reversed(before.split('\n')):
                            if prev_line.startswith('### TASK-'):
                                task_id = prev_line.split('|')[0].strip().replace('### ', '')
                                return task_id, kanban_file

    return None, None

def append_log_to_kanban(kanban_file, task_id, log_line):
    """Append log entry to task's Notes section in kanban"""
    try:
        with open(kanban_file, 'r') as f:
            content = f.read()

        # Find task block (from ### TASK-XXX until next task or end)
        task_pattern = rf'(### {re.escape(task_id)} \|[^\n]*\n.*?)(\n### TASK-|\n<!-- Config:|\Z)'
        match = re.search(task_pattern, content, re.DOTALL)

        if not match:
            print(f"Warning: Could not find task {task_id} in {kanban_file}", file=sys.stderr)
            return False

        task_block = match.group(1)

        # Check if Notes section exists
        if '**Notes**:' in task_block:
            # Append to existing Notes section
            notes_pattern = r'(\*\*Notes\*\*:\n)(.*?)(\n\*\*|$)'
            notes_match = re.search(notes_pattern, task_block, re.DOTALL)

            if notes_match:
                existing_notes = notes_match.group(2).rstrip()

                # Check if "Visual Operations Log:" header exists
                if '**Visual Operations Log**:' in existing_notes:
                    # Append to existing log
                    log_header_pattern = r'(\*\*Visual Operations Log\*\*:\n)(.*?)(\n\*\*|$)'
                    log_match = re.search(log_header_pattern, existing_notes, re.DOTALL)

                    if log_match:
                        existing_log = log_match.group(2).rstrip()
                        new_log = f"{existing_log}\n{log_line}"
                        new_notes = existing_notes.replace(
                            f"**Visual Operations Log**:\n{existing_log}",
                            f"**Visual Operations Log**:\n{new_log}"
                        )
                    else:
                        new_notes = f"{existing_notes}\n{log_line}"
                else:
                    # Add log header and first entry
                    new_notes = f"{existing_notes}\n\n**Visual Operations Log**:\n{log_line}"

                new_task_block = task_block.replace(
                    f"**Notes**:\n{existing_notes}",
                    f"**Notes**:\n{new_notes}"
                )
            else:
                # Notes section exists but is empty
                new_task_block = task_block.replace(
                    "**Notes**:",
                    f"**Notes**:\n\n**Visual Operations Log**:\n{log_line}"
                )
        else:
            # Add Notes section with log
            # Insert before next section (Subtasks, Resources, etc.) or at end
            insert_point = task_block.rfind('\n**')
            if insert_point > 0:
                new_task_block = (
                    task_block[:insert_point] +
                    f"\n\n**Notes**:\n\n**Visual Operations Log**:\n{log_line}" +
                    task_block[insert_point:]
                )
            else:
                new_task_block = task_block + f"\n\n**Notes**:\n\n**Visual Operations Log**:\n{log_line}"

        # Replace in full content
        new_content = content.replace(task_block, new_task_block)

        # Write back to file
        with open(kanban_file, 'w') as f:
            f.write(new_content)

        return True

    except Exception as e:
        print(f"Error appending log to kanban: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return False

def main():
    try:
        # Read tool input from stdin
        tool_input = json.loads(sys.stdin.read())
        tool_name = tool_input.get("tool_name", "")
        tool_params = tool_input.get("tool_input", {})

        # Only track WebFetch and WebSearch (visual/browser operations)
        if tool_name not in ["WebFetch", "WebSearch"]:
            sys.exit(0)

        # Get current count before incrementing
        count = increment_visual_ops()
        task_id, kanban_file = get_current_task()

        # Format log entry
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if tool_name == "WebFetch":
            url = tool_params.get("url", "unknown")
            log_line = f"- {timestamp} - WebFetch: {url}"
        else:  # WebSearch
            query = tool_params.get("query", "unknown")
            log_line = f'- {timestamp} - WebSearch: "{query}"'

        # Append to kanban Notes section if task found
        if task_id and kanban_file:
            success = append_log_to_kanban(kanban_file, task_id, log_line)
            if success:
                print(f"✅ Logged to {task_id} Notes section: {log_line}", file=sys.stderr)

        # Reminder after every 2 operations
        if count % 2 == 0:
            print("\n" + "="*70, file=sys.stderr)
            print("🔔 MANUS 2-ACTION RULE: TIME TO PRESERVE RESEARCH", file=sys.stderr)
            print("="*70, file=sys.stderr)
            print(f"\n📊 Visual operations count: {count}", file=sys.stderr)

            if task_id:
                print(f"📋 Current task: {task_id}", file=sys.stderr)
                print(f"📝 Logs appended to: {kanban_file.name} → {task_id} Notes", file=sys.stderr)

                # Determine findings path
                if FINDINGS_DIR:
                    findings_path = f"{FINDINGS_DIR}/{task_id}.md"
                else:
                    findings_path = f"{kanban_file.parent}/findings/{task_id}.md"
            else:
                print("⚠️  No in-progress task found in kanban", file=sys.stderr)
                findings_path = "findings/TASK-XXX.md"

            print(f"\n✅ NEXT STEP: Create or update findings file", file=sys.stderr)
            print(f"   Location: {findings_path}", file=sys.stderr)
            print("\n📝 Template sections:", file=sys.stderr)
            print("   - Visual Analysis (timestamped observations)", file=sys.stderr)
            print("   - Technical Decisions (with rationale)", file=sys.stderr)
            print("   - Issues Discovered (impact + resolution)", file=sys.stderr)
            print("   - Resources (links to screenshots, docs)", file=sys.stderr)

            print("\n💡 Why this matters:", file=sys.stderr)
            print("   Multimodal content (screenshots, PDFs, browser results)", file=sys.stderr)
            print("   doesn't persist across sessions. Text persists forever.", file=sys.stderr)

            print("\n📖 Reset counter after creating findings:", file=sys.stderr)
            print(f"   rm {COUNTER_FILE}", file=sys.stderr)
            print("="*70 + "\n", file=sys.stderr)

        # Always allow operation (exit 0)
        sys.exit(0)

    except Exception as e:
        # Log error but don't block operation
        print(f"Hook error (non-blocking): {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(0)

if __name__ == "__main__":
    main()
