> **Historical planning artifact.** Current status, routes, and next work live in `README.md`, `context.md`, and `journal/IDEAS.md`.

# ViDo — Project Tasks

A structured task breakdown derived from [README.md](./README.md) and [Idea.md](./Idea.md).

---

## Milestone 1 — Minimal Task Management Core

> Focused personal to-do experience without authentication.

### Project Setup & Scaffolding
- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure linting, formatting, and TypeScript strictness
- [ ] Set up local persistence layer (for Milestone 1 prior to cloud sync)

### Core Task Lifecycle
- [ ] Create tasks with title, optional details, owner, and precise target date & time
- [ ] Edit existing task details and deadlines
- [ ] Track incremental progress from `0%` to `100%`
- [ ] Automatically record completion timestamp when progress reaches `100%`
- [ ] Flag tasks completed after their deadline as completed late
- [ ] Archive completed or inactive tasks while retaining full history
- [ ] Delete tasks

### Progress Checkpoints
- [ ] Post timestamped checkpoint entries on tasks
- [ ] Record the updated progress percentage at each checkpoint
- [ ] Store comments, decisions, and blockers in chronological order
- [ ] Retain complete checkpoint history after task completion and archiving

### Derived Status Views
- [ ] Compute **Pending** view (incomplete and within deadline)
- [ ] Compute **Overdue** view (incomplete and past deadline)
- [ ] Compute **Completed** view (finished with delivery timing / late flag)

### Milestone 1 Learning Deliverables
- [ ] Preserve working code snapshot for Milestone 1
- [ ] Document key AI prompts used
- [ ] Record build and feature-demonstration video
- [ ] Write standalone Milestone 1 technical article

---

## Milestone 2 — Authentication and Multi-User Support

> Secure sign-in, cloud persistence, and strict user-level isolation.

- [ ] Set up Supabase project (PostgreSQL + Auth)
- [ ] Implement email and password authentication
- [ ] Manage persistent user sessions and profiles
- [ ] Migrate task and checkpoint storage to Supabase PostgreSQL
- [ ] Enforce Row-Level Security (RLS) so personal tasks and archives are isolated by authenticated user ID
- [ ] Preserve Milestone 2 code snapshot, prompts, demo video, and technical article

---

## Milestone 3 — Shared Tasks and Team Collaboration

> Shared workspaces, task delegation, threaded updates, and real-time sync.

- [ ] Design and implement team workspace data model (owner + members)
- [ ] Create and manage team workspaces (`My Tasks` vs `Team Tasks` separation)
- [ ] Invite registered collaborators by email and manage membership
- [ ] Assign team tasks to specific collaborators with clear ownership
- [ ] Support comments and threaded replies on shared task checkpoints
- [ ] Attribute all task updates and checkpoints to their authors
- [ ] Enforce RLS policies for team-scoped visibility and permissions
- [ ] Enable Supabase Realtime subscriptions for live task and checkpoint updates
- [ ] Preserve Milestone 3 code snapshot, prompts, demo video, and technical article

---

## Milestone 4 — AI-Powered Recommendations (Optional)

> Explainable, user-approved AI assistance layered onto a reliable core.

- [ ] Suggest context-aware follow-up tasks from recent checkpoints
- [ ] Detect tasks at risk of missing deadlines
- [ ] Recommend priorities based on workload and due dates
- [ ] Break broad goals into smaller actionable tasks
- [ ] Summarize recent team activity
- [ ] Ensure all AI suggestions require explicit user approval
- [ ] Preserve Milestone 4 code snapshot, prompts, demo video, and technical article
