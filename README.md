<div align="center">

# ViDo

### See the work. Share the progress. Deliver together.

A local-first task workspace where every task carries a deadline, a progress percentage, and a checkpoint history.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[Vision](./Idea.md) · [Living Concept](./concept.html) · [Folder Structure](./FOLDER_STRUCTURE.md) · [Agent Guidelines](./AGENTS.md)

</div>

---

## Why ViDo?

A checkbox tells you that something is done. It does not tell you **how the work is going**.

ViDo gives every responsibility a precise deadline, measurable progress, and a chronological checkpoint history. The workspace answers "What is the status?" before anyone has to ask.

---

## What works today

- **One-field quick capture** — type a task and press Enter.
- **Real task lifecycle** — create, edit, complete, reopen, archive, restore, and delete.
- **Progress 0–100%** with a **pace vs deadline** signal (`Ahead`, `On track`, `At risk`, `Behind`, `Delivered`).
- **Checkpoint timeline** — every progress update can carry a note, blocker, or decision.
- **Real dates** — Today, Upcoming, Needs Attention, Recent 7 days are calculated from the clock.
- **Calm views** — Home, Today, Upcoming, Needs Attention, Completed, Archived.
- **Search and filters** — keyword, priority, deadline.
- **Persistence** — tasks are saved in the browser (`localStorage`) and survive refresh.
- **Working landing page + theme lab**.

No account, server, or external service is required.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/app` | Home overview with 4 summary tiles and a task feed |
| `/app/today` | Tasks due today |
| `/app/upcoming` | Tasks due after today |
| `/app/needs-attention` | Tasks past their deadline |
| `/app/completed` | Delivered tasks |
| `/app/archived` | Shelved tasks with preserved history |
| `/style-lab` | Accent palette and component lab |

Old `/preview/*` links redirect to `/app/*`.

---

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

### Verification

```bash
npm run typecheck
npm test
npm run build
```

---

## Data model

```ts
Task {
  id, title, description?,
  dueDate, dueTime?,
  priority: 'high' | 'medium' | 'low',
  category: 'personal' | 'home' | 'work',
  state: 'active' | 'completed',
  progress: 0..100,
  createdAt, updatedAt, completedAt?, archivedAt?,
  checkpoints: { id, createdAt, note, progress }[]
}
```

Views are derived from the data:

- **Today**: active and due today.
- **Needs Attention**: active and past the due date.
- **Upcoming**: active and due after today.
- **Completed**: completed and not archived.
- **Archived**: has an `archivedAt` timestamp.

Home limits: Today 5, Needs Attention 3, Upcoming 3, Recently Completed 3.

---

## Persistence

- First run seeds a realistic workspace with dates relative to the current day.
- Tasks are stored under `vido.tasks.v1` in `localStorage`.
- Deleting all tasks keeps the workspace empty; it does not re-seed.
- Clearing browser storage restores the seed on the next load.

Supabase authentication and shared workspaces are planned, not built.

---

## Project structure

```
src/
├── components/ui/       # Button, Badge, Card, Input, NoticeModal
├── data/                # Types, seed data, date/pacing helpers, filters
├── features/
│   ├── landing/         # Public landing page
│   ├── style-lab/       # Accent palette lab
│   └── workspace/       # Dashboard, views, modals, quick capture, store
├── lib/                 # localStorage task repository
├── test/                # Test setup
├── App.tsx              # Router
├── index.css            # Design tokens (Tailwind v4)
└── main.tsx             # Bootstrap
```

---

## Tech stack

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · React Router 7 · Lucide React · Vitest + Happy DOM + Testing Library.

---

## Roadmap

1. **Now** — local-first task lifecycle, checkpoints, pace, search, archive.
2. **Next** — Supabase Auth, Postgres, Row-Level Security, cross-device sync.
3. **Later** — shared workspaces, assignments, comments, reminders.
4. **Long term** — the embedded AI agent from `Idea.md`.

---

**ViDo** · Progress made visible
