# AGENTS.md — Instructions for AI Coding Agents & LLMs

> **MANDATORY INSTRUCTION FOR ALL AI MODELS & AGENTS:**
> If you are an AI assistant (Google Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, Aider, OpenAI Codex, or similar) operating in this repository, you **MUST** read and adhere to this file and [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) before writing, modifying, or creating any files.

---

## 1. Required Reading Order

Before proposing changes, creating files, or editing code, read these documents in order:

1. **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** — Architectural layout and file placement rules.
2. **[context.md](./context.md)** — Current product direction, constraints, and task model.
3. **[README.md](./README.md)** — Public overview, routes, and setup.
4. **[journal/CONVERSATIONS.md](./journal/CONVERSATIONS.md)** — Session story and current state.
5. **[journal/IDEAS.md](./journal/IDEAS.md)** — Implemented, planned, deferred, and rejected ideas.
6. **[MILESTONES.md](./MILESTONES.md)** — Historical roadmap; do not treat it as current scope.

---

## 2. Strict File Placement Invariants

You must strictly maintain the directory structure documented in `FOLDER_STRUCTURE.md`:

- **UI Primitives**: Place generic, domain-agnostic components (Buttons, Cards, Badges, Inputs, Modals) in `src/components/ui/` and export them in `src/components/ui/index.ts`. Never import domain models (`Task`, `Checkpoint`, `User`) into `src/components/ui/`.
- **Feature Code**: Group product functionality into feature slices under `src/features/<feature-name>/`:
  - `src/features/landing/` — Public marketing page (`/`).
  - `src/features/workspace/` — Working task workspace (`/app`).
  - `src/features/style-lab/` — Theme and palette lab (`/style-lab`).
- **Data & Pure Logic**: Place data models, types, sample fixtures, and pure filtering/calculation functions in `src/data/`.
- **Tests**: Colocate tests alongside the files they verify (e.g., `TaskRow.tsx` -> `TaskRow.test.tsx` or `src/features/workspace/WorkspaceViewsAndModals.test.tsx`).
- **Never create loose folders in the project root**: Root is strictly for configuration files and top-level documentation markdown.
- **Never dump ad-hoc files in `src/`**: Only `App.tsx`, `main.tsx`, `index.css`, and `vite-env.d.ts` belong directly in `src/`.

---

## 3. Product Presentation Rules

- **Product, Not a School Project**: ViDo is presented as a high-end, distraction-free SaaS product. **Never** include references to "Milestone 1", "Milestone 2", "Student Project", "Homework", or "Review Gates" in any user-facing UI text.
- **Workspace Route**: The working app is hosted at `/app/*` with subroutes (`/app/today`, `/app/upcoming`, `/app/paths`, `/app/trail`, `/app/profile`, `/app/needs-attention`, `/app/completed`, `/app/archived`, `/app/tasks/:taskId/path`). Legacy `/preview/*` links redirect to `/app/*`.
- **No Demo Framing**: There is no demo banner, "Demo User", or preview badge. The workspace is a real local-first app.
- **Local-First Identity**: Tasks are stored in `localStorage` under `vido.tasks.v1`. No account is required.
- **Real Dates**: Views are calculated from the current date. Seed data is generated relative to today by `createSeedTasks()`, never a fixed benchmark date.
- **Progress Is Real**: Tasks carry `progress` (0–100) and a checkpoint timeline. The pace-vs-deadline signal is part of the product, not decoration.
- **Gentle Language**: Use motivating sidebar labels with standard-name hints (`Today's move` / Today, `What's next` / Upcoming, `Pick up again` / Past, `Wins so far` / Completed, `Resting` / Archived). Avoid pressure counts, red progress bars, and accountability language.

---

## 3.1 Issue Naming

Every GitHub issue raised for this repository must follow:

- `feat: <title>` — feature implementation, feature-related bug, or anything that changes product behavior.
- `Issue: <title>` — general issues: docs, tooling, process, maintenance, or questions.

Examples:

- `feat: Today view: focused priority-aware queue`
- `Issue: Update local setup instructions`

---

## 3.2 Image and Journal Rules

- **Image + title**: Every recognised task must show its image **and** its task title. Never render an image-only task label.
- **Text fallback**: If no image fits, render the task in words.
- **No priority-based style switching**: The main workspace uses one image style. The style lab is experimental and must not drive the workspace.
- **Custom images**: User-uploaded images are local to the browser; reuse is keyword-based and must remain optional.
- **Path assistant**: AI may draft steps, but nothing is added until the user approves. No auto-applied changes.
- **Assets**: Put images in `public/doodles/` (and line doodles in `public/doodles/doodle/`). Update `public/doodles/README.md` when adding or replacing assets.
- **Components**: Use `DoodleTitle` and `Doodle`; do not hardcode image paths in feature components.
- **Credits**: Only add assets with a clear license and attribution.
- **Journal**: After a meaningful decision or implementation slice, update `journal/CONVERSATIONS.md` and `journal/IDEAS.md`.

---

## 4. Design & Styling Conventions

- **Tailwind CSS v4**: Use utility classes with CSS custom properties.
- **Theme Variables**: Always use the defined CSS variables rather than hardcoded hex colors:
  - `var(--accent)` & `var(--accent-soft)` for primary accents.
  - `var(--surface)` for card and component backgrounds.
  - `var(--canvas)` for main page background.
  - `var(--ink)`, `var(--muted)`, and `var(--faint)` for text hierarchy.
  - `var(--line)` for borders and dividers.
- **Desktop-First & Light Theme First**: Maintain clean, generous whitespace, sharp borders, and high contrast.
- **Boards, not tables**: Task and step collections use a disciplined two-column card grid; avoid falling back to long list rows.

---

## 5. Verification Commands (Mandatory Before Ending Turns)

Before concluding any task or turn, every agent **MUST** run and pass all three verification checks:

```bash
# 1. Typecheck: Must exit with 0 errors
npm run typecheck

# 2. Test Suite: All tests must pass (never disable or delete failing tests)
npm test

# 3. Production Build: Must compile cleanly without errors
npm run build
```

---

## 6. Common Agent Traps to Avoid

1. ❌ **Do not bypass `FOLDER_STRUCTURE.md`** by creating temporary or duplicate utility folders.
2. ❌ **Do not remove or weaken existing tests** to make a command pass.
3. ❌ **Do not commit secrets, environment variables, or build folders** (`.env`, `dist/`, `node_modules/`).
4. ❌ **Do not hardcode Windows backslashes** in markdown links; always format file links with forward slashes (e.g. `[link text](file:///path/to/file)`).
5. ❌ **Do not remove task titles in favour of image-only labels.** Images are anchors, not the only meaning.
6. ❌ **Do not add unlicensed images.** Every asset needs a known license and a credit entry.
