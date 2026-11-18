# ViDo — Agent Context

This file is the starting point for any human or AI agent working in this repository.

## Read This First

Before proposing or implementing a change, read these files in order:

1. `AGENTS.md` — guidelines and invariants for AI agents and LLMs
2. `FOLDER_STRUCTURE.md` — architectural directory map and file placement rules
3. `context.md` — current operating context and constraints
4. `MILESTONES.md` — implementation sequence and review gates
5. `concept.html` — living visual product brief and decision log
6. `Idea.md` — full product vision
7. `README.md` — public project overview
8. The active change under `openspec/changes/<change-name>/`, when one exists

Do not infer current scope from the long-term vision alone. Current code, `AGENTS.md`, `FOLDER_STRUCTURE.md`, and the journal define how code may be structured.

## Product Summary

ViDo is a universal task-management application intended to work for:

- Individuals
- Homemakers and households
- Students
- Professionals
- Businesses and teams in later phases

The product begins with familiar to-do behavior and grows gradually into a carefully organized system suitable for serious work.

### Product North Star

> Simple enough for anyone. Structured enough for serious work.

Power should come from thoughtful information organization, not from placing more controls on every screen.

## Current Product Direction

### Visual Direction

- Calm, low-arousal light theme
- Sage canvas, warm white surfaces, muted clay primary, green progress, amber attention
- Labelled desktop sidebar with motivating labels and standard-name hints; mobile bottom navigation
- Restrained motion with reduced-motion support
- Clear hierarchy, generous spacing, readable contrast
- Disciplined card-grid boards rather than long table-like lists
- No guilt-driven language, urgency inflation, points, or streaks
- Serif only on the landing page; sans headings inside the workspace

### Public Experience

Before opening the workspace, users see a complete landing page containing:

- A universal value proposition
- A realistic dashboard preview
- Personal, Home, and Work use cases
- A clear **Open Workspace** call to action

### Authentication and Storage

- No account is required for the current local-first build.
- Tasks are stored in `localStorage` under `vido.tasks.v1`.
- Tasks also store optional deadlines, recurrence, parked state, custom image keys, and subtasks.
- Profile/welcome data uses `vido.profile.v1`.
- The daily intention uses `vido.intention.<date>`.
- Supabase Auth and PostgreSQL remain the planned path for cross-device sync and shared work.
- When Supabase is introduced, Row-Level Security must enforce task ownership.
- Private tasks come before shared tasks.
- Do not expose a Supabase service-role key or any backend secret in frontend code.

## Initial Task Model

The current task experience is based on:

- Title — required
- Description — optional
- Planned date — required; decides when the task enters Today
- Deadline date — optional; a future deadline keeps the task in Today until that day passes
- Deadline time — optional; after it passes the task shows Pending but stays editable until midnight
- Recurrence — optional: Daily, Weekdays, or Weekly until the deadline
- Priority — optional: High, Medium, or Low
- Category — Personal, Home, or Work
- State — Active or Completed
- Progress — 0 to 100 percent
- Checkpoint history — timestamped note plus the progress at that moment
- Subtasks — optional path steps with done state
- Custom image key — optional user-provided image reuse key
- Parked timestamp — sets a task aside without forcing a new date
- Completion timestamp
- Archive timestamp
- Created and updated timestamps

Progress and checkpoints are part of the core build. They are what make ViDo different from a checklist.

## Initial Task Behavior

### Completion

- Completion is a single action from the task row.
- Show brief, restrained feedback.
- Move the task to Done.
- Allow reopening; reopening clears the completion timestamp and recalculates deadline state.
- Show on-time or after-deadline timing in the task detail.

### Removal

- Archive is the normal reversible cleanup action.
- Permanent deletion is a separate secondary action.
- Permanent deletion requires clear confirmation.

### Derived Views

Tasks have only Active and Completed states. Views are calculated from task data:

- Home
- Today
- Upcoming
- Past / Pick up again
- Completed
- Archived

The desktop application uses a labelled sidebar for these views. Mobile uses a bottom navigation bar. The top bar is reserved for search and filters.

### Home Shape

- Greeting with the optional name from the welcome card.
- One focus task — a small, clear next step.
- A seven-day momentum strip.
- Today’s list, limited to five rows on Home.
- An optional daily intention that is explicitly not a task.
- A “That’s enough for today” rest state with an undo.

Home should provide a calm overview without a wall of backlog or pressure counts.

### Search and Filters

Implemented:

- Keyword search across title and description
- Priority filter: All, High, Medium, Low
- Deadline filter: Any, Today, Upcoming, Overdue, Completed
- A clear-all action

Filters appear on demand behind a single Filters button.

## Deferred Features

Do not introduce these unless a new issue or explicit user decision adds them:

- Custom lists
- Tags
- Manual drag-and-drop ordering
- Saved filters
- Reminders or notifications
- Dark mode
- Shared tasks
- Invitations and team workspaces
- Comments or threaded replies
- Real-time collaboration
- Unapproved AI changes (the path assistant only proposes; the user approves)

These remain part of the broader vision, not the current build scope.

## Current Milestone

The current build is:

### Milestone 1 — Working Local-First Workspace

Built:

- Vite + React + TypeScript foundation
- Calm design system with sage/clay/green/amber colour psychology
- Public landing page
- Working `/app` workspace with real task state
- One-field and natural-language capture
- Create, edit, complete, reopen, archive, restore, and delete
- Progress percentage, checkpoint timeline, and pace-vs-deadline
- Today priority-aware queue and Focus mode
- Image + title labels for recognised tasks; text fallback otherwise
- Welcome card, optional daily intention, momentum strip, and rest state
- Small-win focus selection
- Past / Pick up again language, pending grace, and no red progress bars
- Disciplined task card grid, task paths, and optional subtasks
- Optional deadline dates/times and recurrence until a deadline
- Walking and expanding task image catalog plus user-uploaded images
- Path assistant drafts steps for user approval; hosted model support is optional
- Momentum trail: a snake-and-ladder board driven by completed tasks, with a log of ladder/reset causes
- Editable profile with prefix/name, linked from the sidebar and top bar
- Real dates and derived views
- Search and priority/deadline filters
- localStorage persistence
- Project journal and image prompt guide

Supabase, Google OAuth, teams, and reminders are not part of this build. The path assistant has a local fallback and can use a hosted endpoint when configured.

## Development Workflow

Current work is tracked in `journal/` and GitHub issues. The `openspec/` and `.agents/` directories are historical artifacts from the original prototype and do not define current scope.

### Before Coding

1. Read `journal/README.md`, `journal/CONVERSATIONS.md`, and `journal/IDEAS.md`.
2. Check open issues (#3, #4, #7, #10, #11) and the current branch on the fork.
3. Read the affected source files and tests.
4. Record the intended change and out-of-scope items.

### During Implementation

- Keep changes small and reviewable.
- Update or add tests alongside the code.
- Do not introduce a later-phase feature silently.
- Preserve existing planning artifacts.
- Record assumptions explicitly.
- Update the journal after a meaningful decision or slice.

### Verification

Use the smallest meaningful quality gates for the active change. Depending on the milestone, these may include:

- Lint
- Type-check
- Automated tests
- Production build
- Direct browser inspection
- Responsive inspection
- Accessibility checks
- Supabase policy tests with multiple users

Never claim completion without reporting the verification performed or a named blocker.

### Review Points

Stop for user review at meaningful slices and before any commit or PR. Do not continue into a later phase automatically.

## Current Collaboration Conventions

- Work is tracked in `journal/` and GitHub issues.
- Feature-related issues use `feat:`; general issues use `Issue:`.
- Every change must pass typecheck, tests, and production build.
- Update `journal/CONVERSATIONS.md` and `journal/IDEAS.md` when a decision changes.
- Do not overwrite user decisions with stale roadmap documents.

## Source-of-Truth Priority

If project documents conflict, use this priority:

1. The user’s newest explicit decision
2. Current code and tests
3. `journal/CONVERSATIONS.md` and `journal/IDEAS.md`
4. `AGENTS.md` and `FOLDER_STRUCTURE.md`
5. `context.md` and `README.md`
6. `Idea.md` and `concept.html`
7. Historical `openspec/` artifacts

Update affected planning documents when a decision changes so agents do not inherit contradictory context.

## Current Repository State

At the time this context was updated:

- The workspace is a working local-first application at `/app`.
- Tasks persist in `localStorage` under `vido.tasks.v1`.
- Progress, checkpoints, pace, search, filters, Today queue, Focus mode, welcome, intention, and archive are implemented.
- Recognised tasks show an image **and** their title; unrecognised tasks stay as text.
- The verification gates are typecheck, 118 tests, and production build.
- PR #9 was closed; current work is committed on `NAGASHREE1:feat/local-first-vido`.
- Supabase Auth, shared workspaces, reminders, mood/vent analysis, calm rewards, and the broader AI agent remain future work.
