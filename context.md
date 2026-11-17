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

Do not infer current scope from the long-term vision alone. `FOLDER_STRUCTURE.md` and the active OpenSpec change define where and how code may be structured.

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

- Professional and minimal
- Desktop-first
- Light theme first
- Dark mode later
- Restrained color and motion
- Clear hierarchy and generous spacing
- No guilt-driven productivity language
- No excessive gamification

The final accent color is deliberately unresolved and should be chosen through visual comparison during Milestone 1.

### Public Experience

Before opening the workspace, users see a complete landing page containing:

- A universal value proposition
- A realistic dashboard preview
- Personal, Home, and Work use cases
- A clear **Open Workspace** call to action

### Authentication and Storage

- No account is required for the current local-first build.
- Tasks are stored in `localStorage` under `vido.tasks.v1`.
- Supabase Auth and PostgreSQL remain the planned path for cross-device sync and shared work.
- When Supabase is introduced, Row-Level Security must enforce task ownership.
- Private tasks come before shared tasks.
- Do not expose a Supabase service-role key or any backend secret in frontend code.

## Initial Task Model

The current task experience is based on:

- Title — required
- Description — optional
- Due date — required
- Due time — optional; when omitted, use a consistent end-of-day deadline
- Priority — optional: High, Medium, or Low
- Category — Personal, Home, or Work
- State — Active or Completed
- Progress — 0 to 100 percent
- Checkpoint history — timestamped note plus the progress at that moment
- Completion timestamp
- Archive timestamp
- Created and updated timestamps

Progress and checkpoints are part of the core build. They are what make ViDo different from a checklist.

## Initial Task Behavior

### Completion

- Ask for confirmation before completing a task.
- Show brief, restrained completion feedback.
- Move the task to Completed.
- Offer a short Undo action.
- Label completion as on time or after the deadline.
- Allow reopening after confirmation.
- Reopening clears the completion timestamp and recalculates deadline state.

### Removal

- Archive is the normal reversible cleanup action.
- Permanent deletion is a separate secondary action.
- Permanent deletion requires clear confirmation.

### Derived Views

Tasks have only Active and Completed states. Views are calculated from task data:

- Home
- Today
- Upcoming
- Needs Attention
- Completed
- Archived

The desktop application uses a persistent left sidebar for these views. The top bar is reserved for search, filters, and account controls.

### Home Dashboard Limits

- Today: up to 5 tasks
- Needs Attention: up to 3 tasks
- Upcoming: up to 3 tasks
- Recently Completed: up to 3 tasks
- Recently Completed includes only tasks completed within the last 7 days
- Hide Recently Completed when empty
- Every limited section shows its total and a **View all** action

The Home dashboard should provide a broad overview without confronting users with an overwhelming backlog.

### Search and Filters

Phase 1 will eventually include:

- Keyword search across title and description
- Priority filters: High, Medium, Low, and No priority
- Deadline filters: Today, Tomorrow, This week, Overdue, and Custom range
- State filters: Active and Completed
- A clear-all action

Search and filters are Milestone 6, not part of the first visual implementation slice.

## Deferred Features

Do not introduce these into the initial milestone unless a new approved OpenSpec change explicitly adds them:

- Custom lists
- Tags
- Recurring or periodic tasks
- Manual drag-and-drop ordering
- Saved filters
- Reminders or notifications
- Dark mode
- Shared tasks
- Invitations and team workspaces
- Comments or threaded replies
- Real-time collaboration
- AI recommendations or task generation

These remain part of the broader vision, not the current build scope.

## Current Milestone

The current build is:

### Milestone 1 — Working Local-First Workspace

Built:

- Vite + React + TypeScript foundation
- Reusable visual design system
- Public landing page
- Working `/app` workspace with real task state
- One-field quick capture
- Create, edit, complete, reopen, archive, restore, and delete
- Progress percentage and checkpoint timeline
- Pace-vs-deadline signal
- Real dates and derived views
- Search and priority/deadline filters
- localStorage persistence

Supabase, Google OAuth, teams, reminders, and AI are not part of this build.

## Development Workflow

ViDo uses OpenSpec for spec-driven changes.

### Before Coding

1. Identify the current milestone in `MILESTONES.md`.
2. Use the OpenSpec exploration workflow when requirements remain unclear.
3. Create an OpenSpec proposal for the specific milestone or bounded change.
4. Review its proposal, requirements, design, and tasks.
5. Obtain approval before applying the change.

### During Implementation

- Implement only the approved OpenSpec change.
- Mark tasks complete as evidence is produced.
- Keep changes small and reviewable.
- Do not begin a later milestone to make the current result look more complete.
- Preserve existing planning artifacts.
- Record assumptions explicitly.

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

### Review Gates

Every milestone in `MILESTONES.md` ends with a review gate. Stop and request review rather than continuing automatically.

## OpenSpec Conventions

- OpenSpec artifacts are written in English.
- One bounded change should map to one clear milestone or small feature.
- Every proposal must state what is out of scope.
- Requirements must be observable and testable.
- Design documents must explain relevant UX, data, security, and failure-state decisions.
- Tasks should be small enough to verify independently.
- Applied changes must include a concise verification summary.
- Archive a change only after implementation and review are complete.

## Source-of-Truth Priority

If project documents conflict, use this priority:

1. The user’s newest explicit decision
2. The approved active OpenSpec change
3. `MILESTONES.md`
4. `context.md`
5. `concept.html`
6. `Idea.md`
7. `README.md`

Update affected planning documents when a decision changes so agents do not inherit contradictory context.

## Current Repository State

At the time this context was updated:

- The workspace is a working local-first application at `/app`.
- Tasks persist in `localStorage` under `vido.tasks.v1`.
- Progress, checkpoints, pace, search, filters, and archive are implemented.
- The verification gates are typecheck, tests, and production build.
- Supabase Auth, shared workspaces, reminders, and the AI agent remain future work.
