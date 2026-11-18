<div align="center">

# ViDo

### See the work. Share the progress. Deliver together.

A calm, local-first task workspace where tasks can carry an optional deadline, progress, and a checkpoint history.

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

ViDo gives responsibilities an optional deadline, measurable progress, and a chronological checkpoint history. The workspace answers “What is the status?” before anyone has to ask.

---

## What works today

- **One-field capture** — type a task and press Enter.
- **Natural-language capture** — `Renew insurance tomorrow 5pm !high #home` becomes a real task with a date, time, priority, and category. Dates after **by** or **date is** are treated as deadlines, e.g. `Project submission by 14th December 2026`; dates after **on** become the planned task date, e.g. `Go out for a walk on 1st December 2026`. Quick add also has a **Calendar** dropdown for planned dates and deadlines.
- **Real task lifecycle** — create, edit, complete, reopen, archive, restore, and delete.
- **Progress 0–100%** with a **pace vs deadline** signal.
- **Checkpoint timeline** — every update can carry a note, blocker, or decision.
- **Today, until the deadline** — due-today tasks, future-deadline work you can start now, plus a few suggestions from earlier.
- **Focus mode** — one task, a progress ring, quick progress updates, and a note to yourself.
- **Clear, motivating views** — Home base, Today's move, What's next, Pick up again, Wins so far, Resting; the standard names stay underneath as hints.
- **Search and filters** — keyword, priority, deadline.
- **Welcome card and daily intention** — optional name and a one-line intention that is not a task.
- **Professional address** — optional prefix (Mr., Ms., Dr., etc.) plus name for the greeting and sidebar.
- **Pick up again** — deferring a task no longer forces tomorrow; it is set aside without a date until you choose to bring it back.
- **Repeat until deadline** — choose Daily, Weekdays, or Weekly; finishing one occurrence schedules the next until the deadline date.
- **Task board** — tasks and path steps sit in a disciplined two-column card grid, not a long list.
- **Quest path** — Task Path highlights the current step, gives completed steps a stamp, and celebrates a complete quest without points or streaks.
- **Momentum trail** — a snake-and-ladder board moves your token with completed tasks, logs every ladder lift and gentle reset, and reaches the goal when all tasks are done.
- **Profile** — edit prefix, name, email, date of birth, and phone from the sidebar footer or the profile button in the top bar.
- **Local account** — register with name, email, and date of birth; sign in with email + a one-time code. No password is stored.
- **Reminders** — optional reminder date/time; an in-app reminder fires while ViDo is open.
- **Task sharing** — share a task with an email address or phone number, see collaborators, and remove access. Sharing is local to this browser for now.
- **System clock** — live date and time beside the quick-add row, using the device clock.
- **Task paths** — open **Your paths** from the sidebar, choose a today/future task, add subtask steps, and check them off; each task also links to its path from Task details. Steps also appear inside Task details.
- **Automatic completion** — when every path step is done, the task is completed and a completion checkpoint is logged. Adding a new step reopens it.
- **Move a pending task** — Past tasks have **Will do it today** and a date picker to push them to the right day; pending cards also link straight to **Break into steps**.
- **Collapsible sidebar** — open/close it with the sidebar icon; working in the main area closes it.
- **Path assistant** — on a task path, ask for help breaking the work down; the assistant drafts steps and the user approves them before they are added.
- **Momentum strip** — a gentle seven-day view of what was finished.
- **“That’s enough for today”** — puts the Today list away with an undo.
- **Small-win focus** — prefers a task you are already moving forward.
- **Partial progress check-in** — “Worked on it — a little further” adds 25% and keeps it in Today.
- **Optional deadline, midnight grace** — leave the deadline blank if there is no hard time. A future deadline stays in Today every day until that deadline day passes; after it passes the task becomes Pending but stays editable until midnight.
- **Past list** — earlier tasks live there; choose what to do today instead of seeing all of them in Today.
- **Custom task images** — when no built-in image matches, add one from the task detail view; ViDo remembers the keyword and reuses it for similar tasks on that device.
- **Gentler navigation** — icon rail, mobile bottom nav, no numeric backlog counts.
- **Keyboard actions** — `Enter`, `Space`, `C`, `F`, `Esc`.
- **Persistence** — tasks are saved in the browser (`localStorage`) and survive refresh.
- **Walking, sport, reading, writing, and home images** — growing tasks get a relevant anchor, with custom uploads for gaps.
- **Landing page, theme lab, and image library**.

No account, server, or external service is required.

---

## Images and task titles

Task images are **visual anchors**, not the only label.

- If a task is recognised, the image and the task title appear together.
- If no image fits, the task stays as plain text.
- The keyword-to-image directory lives in `src/features/workspace/doodles/taskImageCatalog.ts`; it covers sports, reading, writing, home, health, work, and life tasks.
- Custom images are local to the browser: each device keeps its own library, so different users do not overwrite each other. Sharing a library across users would need a backend/account layer.
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
| `/app/today` | Only tasks due today, plus a few suggestions from earlier |
| `/app/upcoming` | Later |
| `/app/needs-attention` | Past: earlier tasks; choose what to do today |
| `/app/completed` | Done |
| `/app/paths` | Your paths: choose a today/future task |
| `/app/tasks/:taskId/path` | Task path: steps, progress, and path assistant |
| `/app/trail` | Momentum trail: snake-and-ladder productivity board |
| `/app/profile` | Edit prefix and name |
| `/app/archived` | Put away |
| `/auth` | Email + OTP sign-in and registration |
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

Last verified: **124 tests across 32 suites**, typecheck pass, production build pass.

---

## Data model

```ts
Task {
  id, title, description?,
  dueDate, deadlineDate?, dueTime?,
  recurrence?: 'daily' | 'weekdays' | 'weekly',
  priority: 'high' | 'medium' | 'low',
  category: 'personal' | 'home' | 'work',
  state: 'active' | 'completed',
  progress: 0..100,
  customImageKey?,
  parkedAt?,
  createdAt, updatedAt, completedAt?, archivedAt?,
  checkpoints: { id, createdAt, note, progress }[],
  subtasks?: { id, title, done, createdAt }[]
}
```

Views are derived from the data:

- **Today**: due-today tasks, plus non-recurring work with a future deadline; recurring tasks appear on their scheduled days.
- **Past**: active tasks whose effective deadline has passed.
- **Upcoming**: all active tasks due after today, including work with a future deadline.
- **Completed**: completed and not archived.
- **Archived**: has an `archivedAt` timestamp.

The Today board keeps future-deadline work visible until the deadline day passes. Earlier tasks are suggested in small numbers, and you can move one into Today with **Do today**.

---

## Path assistant

The task path assistant ships with a local draft generator so it works without a backend. Nothing is added until the user approves.

To use a hosted model, set:

```bash
VITE_PATH_ASSISTANT_URL=https://your-endpoint.example/path
```

The endpoint receives:

```json
{ "taskTitle": "Project submission", "messages": [{ "role": "user", "text": "Make it smaller" }] }
```

and should return:

```json
{ "reply": "Here is a smaller path…", "steps": ["Open the file", "Write one sentence"] }
```

If the request fails or the variable is empty, ViDo falls back to the local assistant.

---

## Persistence

- First run seeds a realistic workspace with dates relative to the current day.
- Tasks are stored under `vido.tasks.v1` in `localStorage`.
- Profile and daily intention use `vido.profile.v1` and `vido.intention.<date>`.
- The per-day rest state uses `vido.rest.<date>`.
- Deleting all tasks keeps the workspace empty; it does not re-seed.
- Clearing browser storage restores the seed on the next load.

Local authentication exists. Supabase cross-device auth and shared workspaces are still planned.

---

## Project structure

```
vido-app/
├── public/doodles/       # Open-source task images + attribution
├── journal/              # Session log, idea register, image prompts
├── src/
│   ├── components/ui/    # Button, Badge, Card, Input, ProgressRing, NoticeModal
│   ├── data/             # Types, dates, seed data, filters, quick-add parser, path assistant
│   ├── features/
│   │   ├── landing/      # Public landing page
│   │   ├── style-lab/    # Accent lab + image library
│   │   └── workspace/    # Shell, views, modals, focus, welcome, paths, doodles
│   ├── lib/              # localStorage task + welcome stores
│   ├── test/             # Test setup
│   ├── App.tsx           # Router
│   ├── index.css         # Design tokens (Tailwind v4)
│   └── main.tsx          # Bootstrap
├── AGENTS.md
├── FOLDER_STRUCTURE.md
├── README.md
├── REVIEW_FEEDBACK.md
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

1. **Now** — local-first lifecycle, Today board, Focus mode, task paths, image + title labels, deadlines, recurrence, custom images, calm visual system.
2. **Next** — mood/vent check-in, calm rewards, more hosted-model options for the path assistant, and a landing-page pass.
3. **Then** — Supabase Auth, Postgres, Row-Level Security, cross-device sync.
4. **Later** — shared workspaces, assignments, comments, reminders.
5. **Long term** — the embedded AI agent from `Idea.md`.

---

**ViDo** · Progress made visible
