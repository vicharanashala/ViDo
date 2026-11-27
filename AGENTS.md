# AGENTS.md — Instructions for AI Coding Agents & LLMs

> **MANDATORY INSTRUCTION FOR ALL AI MODELS & AGENTS:**
> If you are an AI assistant (Google Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf, Aider, OpenAI Codex, or similar) operating in this repository, you **MUST** read and adhere to this file and [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) before writing, modifying, or creating any files.

---

## 1. Required Reading Order

Before proposing changes, creating files, or editing code, read these documents in order:

1. **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)** — Architectural layout and file placement rules.
2. **[context.md](./context.md)** — Product requirements, UX constraints, and task models.
3. **[MILESTONES.md](./MILESTONES.md)** — Roadmap phases and delivery boundaries.
4. **[README.md](./README.md)** — Public product overview and setup instructions.
5. The active OpenSpec change in `openspec/changes/<change-name>/` (if currently working under a spec change).

---

## 2. Strict File Placement Invariants

You must strictly maintain the directory structure documented in `FOLDER_STRUCTURE.md`:

- **UI Primitives**: Place generic, domain-agnostic components (Buttons, Cards, Badges, Inputs, Modals) in `src/components/ui/` and export them in `src/components/ui/index.ts`. Never import domain models (`Task`, `Checkpoint`, `User`) into `src/components/ui/`.
- **Feature Code**: Group product functionality into feature slices under `src/features/<feature-name>/`:
  - `src/features/landing/` — Public marketing page (`/`).
  - `src/features/auth/` — Auth session provider and sign-in/sign-out state (`AuthProvider`).
  - `src/features/workspace/` — Dashboard shell shared by the live workspace (`/workspace`) and the demo (`/preview`).
  - `src/features/style-lab/` — Theme and palette lab (`/style-lab`).
- **Data & Pure Logic**: Place data models, types, sample fixtures, and pure filtering/calculation functions in `src/data/`.
- **Firebase & Persistence**: Keep Firebase initialization, auth helpers, and Firestore task/calendar/target reads and writes in `src/lib/` (never inside view components).
- **Backend Service (`server/`)**: Place backend controllers, services, DTOs, and Prisma schemas inside `server/`.
- **Tests**: Colocate tests alongside the files they verify (e.g., `TaskRow.tsx` -> `TaskRow.test.tsx` or `src/features/workspace/WorkspaceViewsAndModals.test.tsx`).
- **Never create loose folders in the project root**: Root is strictly for configuration files and top-level documentation markdown.
- **Never dump ad-hoc files in `src/`**: Only `App.tsx`, `main.tsx`, `index.css`, and `vite-env.d.ts` belong directly in `src/`.

---

## 3. Product Presentation Rules

- **Product, Not a School Project**: ViDo is presented as a high-end, distraction-free SaaS product. **Never** include references to "Milestone 1", "Milestone 2", "Student Project", "Homework", or "Review Gates" in any user-facing UI text.
- **Preview Route**: The dashboard demo is hosted at `/preview/*` with subroutes (`/preview/today`, `/preview/upcoming`, `/preview/needs-attention`, `/preview/completed`, `/preview/archived`, `/preview/calendar`, `/preview/analytics`).
- **Live Route**: `/workspace/*` mirrors those subroutes but requires sign-in and reads/writes Firestore through the local emulator. Demo components must accept `mode`/`basePath` so links never leak between the two shells.
- **Planning Persistence**: Calendar events live at `users/{uid}/calendarEvents`, while weekly/monthly targets live on `users/{uid}`. Preview equivalents are stored in `localStorage`.
- **Demo Banner & Exit Button**: The preview shell **must always** retain the persistent top demo preview banner with the **left-aligned** `Back to Landing Page` button.
- **User Identity**: The default preview user profile is `"Demo User"`.
- **Deterministic Fixtures**: All sample dates and timelines are anchored around **Tuesday, 17 November 2026**.

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
(If the backend service is in scope for your change, also run `npm run build:server`.)

---

## 6. Common Agent Traps to Avoid

1. ❌ **Do not bypass `FOLDER_STRUCTURE.md`** by creating temporary or duplicate utility folders.
2. ❌ **Do not remove or weaken existing tests** to make a command pass.
3. ❌ **Do not commit secrets, environment variables, or build folders** (`.env`, `dist/`, `node_modules/`).
4. ✅ **Pushing to remote repositories (`git push`)**: AI agents are authorized to run `git push` when all verification checks (`npm run typecheck`, `npm test`, `npm run build`) pass and the agent determines the changes are complete, verified, and ready to be pushed.
5. ❌ **Do not hardcode Windows backslashes** in markdown links; always format file links with forward slashes (e.g. `[link text](file:///path/to/file)`).
