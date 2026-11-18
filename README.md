<div align="center">

# ViDo

### See the work. Share the progress. Deliver together.

A calm, local-first task workspace where every task carries a deadline, progress, and a checkpoint history.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[Vision](./Idea.md) · [Living Concept](./concept.html) · [Folder Structure](./FOLDER_STRUCTURE.md) · [Agent Guidelines](./AGENTS.md) · [Journal](./journal/README.md)

</div>

---

## Why ViDo?

A checkbox tells you that something is done. It does not tell you **how the work is going**.

ViDo gives every responsibility a precise deadline, measurable progress, and a chronological checkpoint history. The workspace answers “What is the status?” before anyone has to ask.

---

## What works today

- **One-field capture** — type a task and press Enter.
- **Natural-language capture** — `Renew insurance tomorrow 5pm !high #home` becomes a real task with a date, time, priority, and category.
- **Real task lifecycle** — create, edit, complete, reopen, archive, restore, and delete.
- **Progress 0–100%** with a **pace vs deadline** signal.
- **Checkpoint timeline** — every update can carry a note, blocker, or decision.
- **Today priority-aware queue** — carried-over work first, then today by time.
- **Focus mode** — one task, a progress ring, quick progress updates, and a note to yourself.
- **Calm views** — Home, Today, Later, Still here, Done, Put away.
- **Search and filters** — keyword, priority, deadline.
- **Welcome card and daily intention** — optional name and a one-line intention that is not a task.
- **Momentum strip** — a gentle seven-day view of what was finished.
- **“That’s enough for today”** — puts the Today list away with an undo.
- **Small-win focus** — prefers a task you are already moving forward.
- **Gentle carried-over language** — `Carried over`, amber cues, and no red progress bars.
- **Gentler navigation** — icon rail, mobile bottom nav, no numeric backlog counts.
- **Keyboard actions** — `Enter`, `Space`, `F`, `Esc`.
- **Persistence** — tasks are saved in the browser (`localStorage`) and survive refresh.
- **Landing page, theme lab, and image library**.

No account, server, or external service is required.

---

## Images and task titles

Task images are **visual anchors**, not the only label.

- If a task is recognised, the image and the task title appear together.
- If no image fits, the task stays as plain text.
- The main workspace does **not** change image style by priority; that experiment was reverted because it made tasks harder to read.
- The style lab remains a design sandbox; it does not drive the workspace.

Image sources and attribution live in [`public/doodles/README.md`](./public/doodles/README.md):

- Twemoji — CC-BY 4.0
- OpenMoji — CC BY-SA 4.0
- rawpixel via Openverse — CC0
- Wikimedia Commons — CC0
- Tabler Icons — MIT

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/app` | Home: greeting, focus card, momentum, and today’s list |
| `/app/today` | Priority-aware queue: carried over, then due today |
| `/app/upcoming` | Later |
| `/app/needs-attention` | Still here |
| `/app/completed` | Done |
| `/app/archived` | Put away |
| `/style-lab` | Accent palettes, components, and image library |

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

Last verified: **67 tests across 21 suites**, typecheck pass, production build pass.

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
- **Still here**: active and past the due date.
- **Later**: active and due after today.
- **Done**: completed and not archived.
- **Put away**: has an `archivedAt` timestamp.

The Today queue orders carried-over work by priority, then earliest deadline. Due-today work is ordered by time; priority breaks ties.

---

## Persistence

- First run seeds a realistic workspace with dates relative to the current day.
- Tasks are stored under `vido.tasks.v1` in `localStorage`.
- Profile and daily intention use `vido.profile.v1` and `vido.intention.<date>`.
- The per-day rest state uses `vido.rest.<date>`.
- Deleting all tasks keeps the workspace empty; it does not re-seed.
- Clearing browser storage restores the seed on the next load.

Supabase authentication and shared workspaces are planned, not built.

---

## Project structure

```
vido-app/
├── public/doodles/       # Open-source task images + attribution
├── journal/              # Session log, idea register, image prompts
├── src/
│   ├── components/ui/    # Button, Badge, Card, Input, ProgressRing, NoticeModal
│   ├── data/             # Types, dates, seed data, filters, quick-add parser
│   ├── features/
│   │   ├── landing/      # Public landing page
│   │   ├── style-lab/    # Accent lab + image library
│   │   └── workspace/    # Shell, views, modals, focus, welcome, doodles
│   ├── lib/              # localStorage task + welcome stores
│   ├── test/             # Test setup
│   ├── App.tsx           # Router
│   ├── index.css         # Design tokens (Tailwind v4)
│   └── main.tsx          # Bootstrap
├── AGENTS.md
├── FOLDER_STRUCTURE.md
├── README.md
└── context.md
```

---

## Tech stack

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · React Router 7 · Lucide React · Vitest + Happy DOM + Testing Library.

---

## Journal

`journal/` is the project memory:

- `CONVERSATIONS.md` — session story and decisions
- `IDEAS.md` — implemented, planned, exploring, deferred, and rejected ideas
- `IMAGE_PROMPTS.md` — prompt and workflow for generating a consistent image set

Update it after any meaningful decision.

---

## Roadmap

1. **Now** — local-first lifecycle, Today queue, Focus mode, image + title labels, welcome/intention, rest state, small-win focus, calm visual system.
2. **Next** — more image coverage and a landing-page pass.
3. **Then** — Supabase Auth, Postgres, Row-Level Security, cross-device sync.
4. **Later** — shared workspaces, assignments, comments, reminders.
5. **Long term** — the embedded AI agent from `Idea.md`.

---

**ViDo** · Progress made visible
