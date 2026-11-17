# ViDo Journal

This folder is the project memory for ViDo. It exists so a new session can recover context quickly without replaying the entire conversation.

## Files

| File | Purpose |
|---|---|
| `CONVERSATIONS.md` | The full session log: what was discussed, decided, built, rejected, and verified. |
| `IDEAS.md` | The idea register: every idea, whether it was implemented, still planned, deferred, or rejected. |
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
- State: committed and pushed to `NAGASHREE1/ViDo`
- Fork: `https://github.com/NAGASHREE1/ViDo` (public)
- No PR raised
- Issues:
  - `#3 feat: Calm interactivity: reduce effort per action across the workspace`
  - `#4 feat: Today view: focused priority-aware queue with calm feedback`
  - `#7 feat: Make ViDo a gentle daily space, not an accountability tool`
- Assignment to `@NAGASHREE1` requested in comments; pending maintainer action.
- Verification at last run: typecheck pass, 65 tests pass across 21 suites, production build pass.
- Dev server: `http://127.0.0.1:5173` (started locally).

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
- Doodle titles for recognisable everyday tasks, in a cartoon-sticker style.
- Personal welcome card and a daily intention line.
- Gentler navigation labels and no pressure counts in the sidebar.
- No gamification, guilt language, or urgency inflation.
