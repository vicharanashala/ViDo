<div align="center">

# ViDo

### See the work. Share the progress. Deliver together.

A calm, local-first task workspace where tasks carry an optional deadline, measurable progress, and a checkpoint history.

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)

[Vision](./Idea.md) · [Living Concept](./concept.html) · [Folder Structure](./FOLDER_STRUCTURE.md) · [Agent Guidelines](./AGENTS.md) · [Contributing](./CONTRIBUTING.md) · [Verification Evidence](./review-evidence/README.md)

</div>

---

## 📌 Table of Contents

- [📖 Overview & Philosophy](#-overview--philosophy)
- [🗺️ Application Routes](#️-application-routes)
- [✨ Core Features](#-core-features)
- [🔣 Iconography](#-iconography)
- [⚡ Quick Start](#-quick-start)
- [🧪 Verification](#-verification)
- [🗂️ Architecture](#️-architecture)
- [🎨 Design System](#-design-system)
- [🛠️ Tech Stack](#️-tech-stack)
- [🤝 Contributing](#-contributing)

---

## 📖 Overview & Philosophy

A checkbox tells you that something is done. It does not tell you **how the work is going**.

ViDo gives responsibilities an optional deadline, measurable progress, and a chronological checkpoint history. The workspace answers “What is the status?” before anyone has to ask.

The current build is **local-first**: tasks live in the browser, no account is required, and no request leaves the device. Local sign-in, sharing, and reminders exist as browser-local prototypes for the future account layer.

> **Clarity over complexity.** One calm surface, one accent, and boards rather than dense tables.

---

## 🗺️ Application Routes

| Route | View | Description |
|---|---|---|
| `/` | **Landing** | Product introduction, workspace preview, and audience cards. |
| `/style-lab` | **Design Lab** | Accent palettes, component tokens, and the task image library. |
| `/auth` | **Sign-in** | Local email + one-time-code prototype; no password stored. |
| `/app` | **Home** | Greeting, one small thing, momentum, today’s queue, optional welcome card. |
| `/app/today` | **Today** | Due today, deadline work you can start now, and earlier suggestions. |
| `/app/upcoming` | **Upcoming** | Future work grouped by category. |
| `/app/paths` | **Task paths** | Tasks that benefit from steps; open a path to shape the next moves. |
| `/app/tasks/:taskId/path` | **Task path** | Steps, progress, and the path assistant. |
| `/app/trail` | **Momentum trail** | A gentle progress board; no points or streaks. |
| `/app/needs-attention` | **Past** | Earlier tasks; bring one forward or leave it. |
| `/app/completed` | **Completed** | Finished work with completion timing. |
| `/app/archived` | **Archived** | Put away, still kept, restorable. |
| `/app/profile` | **Profile** | Prefix, name, email, date of birth, phone, and sign-in state. |
| `/app/journal` | **Journal** | Month calendar, timed free writing, and read-only evening reviews. |

Legacy `/preview/*` and `/workspace/*` links redirect to `/app/*`.

---

## ✨ Core Features

### Capture and lifecycle
- One-field quick add with natural-language dates, times, priority, and category.
- Calendar control for planned dates, deadlines, and recurrence; available before typing.
- Create, edit, complete, reopen, archive, restore, and delete.

### Progress and history
- Progress from 0–100 with a pace-vs-deadline signal.
- Checkpoint timeline for notes, blockers, and decisions.
- Completion timing shown as on-time or after deadline.

### Views and focus
- Home, Today, Upcoming, Past, Completed, Archived.
- Task paths with subtasks and an assistant that drafts steps for approval.
- Momentum trail board driven by completed work.
- Focus mode with a progress ring and a private note.
- Check-in tray: done, not today, not important, or partial progress.

### Local-first extras
- System clock at the right of the quick-add row from 1280px up.
- Task images plus titles; custom images stored on the device.
- Local sign-in, profile, reminders, and browser-local sharing prototypes.
- Search and filters across keyword, priority, and deadline.

No account, server, or external service is required.

---

## 🔣 Iconography

Every UI symbol — including task-card artwork — is an SVG icon from [Lucide](https://lucide.dev/). No emoji characters and no typographic glyph substitutes (bullet, arrow, triangle) appear in application UI. Task icons come from `src/features/workspace/doodles/doodleIcons.ts`; the old Twemoji-style files are retained for attribution only.

`src/test/noEmoji.test.ts` scans `src/**/*.{ts,tsx,css}` and `index.html` for emoji and replaced glyph codepoints, and fails with a `file:line` list if any return.

---

## ⚡ Quick Start

```bash
git clone https://github.com/vicharanashala/ViDo.git
cd ViDo
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). No Java, Firebase project, or emulator is required.

---

## 🧪 Verification

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server. |
| `npm test` | Run the Vitest suite — **127 tests across 34 suites**. |
| `npm run typecheck` | Strict TypeScript, zero emit. |
| `npm run build` | Production build into `dist/`. |
| `npm run preview` | Preview the production build. |

Before pushing:

```bash
npm run typecheck && npm test && npm run build
```

Before/after screenshots and the route map live in [`review-evidence/`](./review-evidence/README.md).

---

## 🗂️ Architecture

ViDo uses a feature-driven frontend architecture. For the authoritative tree and placement rules, see [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md).

- **UI primitives (`src/components/ui/`)** — domain-agnostic `Button`, `Card`, `Badge`, `Input`, `NoticeModal`, `ProgressRing`.
- **Feature slices (`src/features/`)** — `landing/`, `workspace/`, `style-lab/`.
- **Data and pure logic (`src/data/`)** — types, dates, filters, quick-add parser, path assistant, seed data.
- **Persistence (`src/lib/`)** — localStorage task, profile, account, and image stores.
- **Colocated tests** — every component and helper has its test alongside it.

---

## 🎨 Design System

Tailwind CSS v4 with semantic CSS custom properties:

| Token | Variable | Purpose |
|---|---|---|
| Canvas | `var(--canvas)` | Main background |
| Surface | `var(--surface)` | Cards, panels, modals |
| Ink | `var(--ink)` | Primary text |
| Muted / Faint | `var(--muted)`, `var(--faint)` | Secondary and placeholder text |
| Line | `var(--line)` | Borders and dividers |
| Accent | `var(--accent)`, `var(--accent-soft)` | Brand and active states |

Explore palettes at `/style-lab`.

---

## 🛠️ Tech Stack

React 19 · Vite 6 · TypeScript · Tailwind CSS v4 · React Router 7 · Lucide React · Vitest + Testing Library.

---

## 🤝 Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

For UI changes, include the approved Discussion link, before/after screenshots, and the routes changed. The redesign in this branch is discussed in [Discussion #18](https://github.com/vicharanashala/ViDo/discussions/18).

---

<div align="center">

**ViDo** · Progress made visible

</div>
