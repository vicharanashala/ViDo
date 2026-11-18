# ViDo Journal

This folder is the project memory for ViDo. It exists so a new session can recover context quickly without replaying the entire conversation.

## Files

| File | Purpose |
|---|---|
| `CONVERSATIONS.md` | The full session log: what was discussed, decided, built, rejected, and verified. |
| `IDEAS.md` | The idea register: every idea, implemented, planned, exploring, deferred, or rejected. |
| `IMAGE_PROMPTS.md` | Master prompt, task list, workflow, and copyright notes for generating a consistent image set. |
| `README.md` | This guide. |

## How to use it

1. Read `CONVERSATIONS.md` first for the story and current state.
2. Read `IDEAS.md` before proposing new work so we do not re-open decided items.
3. Append to both files after each meaningful session.
4. Keep status labels accurate: `Implemented`, `In progress`, `Planned`, `Exploring`, `Deferred`, `Rejected`.

## Current snapshot

- App folder: `vido-app/`
- Base repo: `https://github.com/vicharanashala/ViDo` (cloned locally)
- Branch: `feat/local-first-vido`
- State: committed through `889280d`; later work is in the local working tree
- Fork: `https://github.com/NAGASHREE1/ViDo` (public)
- PR #9 was closed: https://github.com/vicharanashala/ViDo/pull/9
- Issues:
  - `#3 feat: Calm interactivity: reduce effort per action across the workspace`
  - `#4 feat: Today view: focused priority-aware queue with calm feedback`
  - `#7 feat: Make ViDo a gentle daily space, not an accountability tool`
  - `#10 feat: Make ViDo navigation and task labels understandable`
  - `#11 feat: Drag-to-check-in with calm image reactions`
- Assignment to `@NAGASHREE1` requested in comments; pending maintainer action.
- Verification at last run: typecheck pass, 118 tests pass across 31 suites, production build pass.
- Dev server: `http://127.0.0.1:5173` (started locally).

## GitHub identity

- Canonical account for this work: **NAGASHREE1**
- Commit author: `Nagashree Venkatesh <nagu95@gmail.com>`
- Backup verified email: `nagashree.mysore03@gmail.com`
- Web-based Git operations are linked to `35187195+NAGASHREE1@users.noreply.github.com`
- College account `22f2000618` is kept separate; do not mix its email into this repo.
- The PR itself is authored by `NAGASHREE1`; GitHub does not allow changing an existing PR creator.

## New-session checklist

```bash
cd vido-app
npm run typecheck
npm test
npm run build
npm run dev
```

Then open `/app` and `/app/today`.

## Current product direction

- Local-first task workspace.
- One clear next action.
- Calm, low-arousal visual system.
- Progress and checkpoint history over binary checkboxes.
- Natural-language capture.
- Recognised tasks show an open-source image **plus the task title**, so the image never has to carry the meaning alone.
- If no image fits, the user can upload one and reuse it by keyword.
- Walking has its own image; sports, reading, writing, home, health, work, and life tasks have a growing catalog.
- The main workspace uses one image style. Priority-based image-style switching was reverted because it made tasks harder to read.
- Images: Twemoji (CC-BY 4.0), OpenMoji (CC BY-SA 4.0), CC0 photos from Openverse/Wikimedia, Tabler (MIT).
- Task titles are readable at 12px in the card board.
- Personal welcome card with optional prefix and a daily intention line.
- “That’s enough for today” rest state with undo.
- Small-win focus selection.
- Past / Pick up again language, amber cues, optional deadlines, and no red progress bars.
- Motivating sidebar labels with standard-name hints and no pressure counts.
- Disciplined two-column card board, task paths, subtasks, recurrence, the path assistant, the Momentum trail, and an editable profile.
- No points, streaks, guilt language, or urgency inflation. Mood/vent analysis and calm rewards remain planned.
