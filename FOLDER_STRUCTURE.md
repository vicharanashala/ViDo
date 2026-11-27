# ViDo — Repository & Folder Structure Guide

> **MANDATORY FOR ALL CONTRIBUTORS AND AI AGENTS:**
> Before proposing, creating, or moving any files, you **must** read this guide. Adherence to this folder structure is strictly enforced to ensure modularity, maintainability, and clean separation of concerns.

---

## 1. High-Level Architecture Overview

ViDo follows a **feature-driven, modular frontend architecture**. Code is organized by domain responsibilities (*features*) rather than technical types (*e.g., all components in one giant folder, all hooks in another*). Shared, domain-agnostic UI primitives reside in `src/components/ui/`, while core data types and pure calculation logic live in `src/data/`.

```text
ViDo/
├── .agents/                 # Historical OpenSpec agent tooling
├── openspec/                # Historical specification artifacts
├── public/doodles/          # Open-source task images + attribution
├── journal/                 # Local-only; not included in this copy
├── src/
│   ├── components/ui/       # Domain-agnostic reusable UI primitives (Button, Card, Badge, etc.)
│   ├── data/                # Data types, deterministic fixtures, pure filtering & logic
│   ├── features/            # Vertical slices of user-facing functionality
│   │   ├── landing/         # Public landing page (/ route)
│   │   ├── style-lab/       # Theme, accent palette, and visual lab (/style-lab route)
│   │   └── workspace/       # Working task workspace (/app route)
│   │       ├── doodles/     # Task image detection and rendering
│   │       └── views/       # Subroute views (Home, Today, Upcoming, Task paths, Momentum trail, Past, Completed, Archived, Profile)
│   ├── lib/                 # localStorage task + welcome/intention stores
│   ├── test/                # Global test setup and environment configuration
│   ├── App.tsx              # Central client-side routing
│   ├── index.css            # Global CSS variables, theme variables, and Tailwind v4 setup
│   ├── main.tsx             # Application bootstrap & DOM mount
│   └── vite-env.d.ts        # Vite TypeScript type declarations
├── .env.example              # Optional hosted path-assistant endpoint
├── .gitignore               # Ignored build artifacts, dependencies, and caches
├── AGENTS.md                # AI Agent guidelines and execution standards
├── FOLDER_STRUCTURE.md      # This file: Directory layout and placement rules
├── MILESTONES.md            # Historical roadmap (not current scope)
├── README.md                # Public project documentation and quickstart
├── context.md               # Product requirements and agent constraints
├── index.html               # Vite HTML entry point (root of web application)
├── package.json             # Scripts and dependency declarations
├── tsconfig.json            # TypeScript base configuration
├── vite.config.ts           # Vite build and plugin configuration
└── vitest.config.ts         # Vitest test runner configuration
```

---

## 2. Directory Deep-Dive & Purpose

### `src/components/ui/` — Design System Primitives
- **Purpose**: Low-level, domain-agnostic UI building blocks (e.g., `Button`, `Badge`, `Card`, `Input`, `ProgressRing`, `NoticeModal`).
- **Rules**:
  - **Zero domain knowledge**: Components in this folder must *never* import domain types (such as `Task`, `User`, or `Checkpoint`).
  - **Accessible**: Must support keyboard navigation, ARIA attributes, and focus rings.
  - **Exported through index**: Every component must be exported through `src/components/ui/index.ts`.
  - **Tested**: Each component must have unit tests colocated in `src/components/ui/ui.test.tsx` (or dedicated test files).

### `src/data/` — Types, Fixtures & Pure Logic
- **Purpose**: TypeScript interfaces, sample data fixtures, and pure filtering/calculation functions.
- **Current Contents**:
  - `taskTypes.ts`: Task, Checkpoint, priority, category, state, and pace types.
  - `taskDates.ts`: date helpers, overdue detection, completion timing, and pace calculation.
  - `sampleTasks.ts`: relative-date seed generator and new-task factory.
  - `taskFilters.ts`: pure functions for Today, Later, Still here, Done, Put away, search, and filters.
  - `quickAddParser.ts`: natural-language task capture parser, including `by`/`date is` deadlines.
  - `pathAssistant.ts`: local step-drafting assistant plus optional hosted endpoint.
  - `taskFilters.test.ts`, `quickAddParser.test.ts`, and `pathAssistant.test.ts`: derived-view, filter, parser, and assistant tests.
- **Rules**:
  - Keep functions pure and side-effect free.
  - Dates are calculated from the current date; there is no fixed benchmark date.

### `intelligent-layer/` — Offline Intelligence
- **Purpose**: Self-contained, deterministic intelligence modules that run entirely in the browser with no network calls. Each feature gets its own subfolder and a barrel `index.ts`.
- **Rules**:
  - No external runtime dependencies and no network access.
  - Pure, explainable logic with colocated tests.
  - The UI imports only from the module's `index.ts`; internal files stay private.
  - Never send user writing or task text off-device.
- **Current Contents**:
  - `evening-review/`: work-signal analysis for the evening check-in write-up. It deliberately ignores personal-life vocabulary, so personal asides produce no signal.

### `src/lib/` — Browser Persistence
- **Purpose**: Side-effectful infrastructure such as the localStorage task repository.
- **Current Contents**:
  - `taskRepository.ts`: load, save, normalize, and clear tasks under `vido.tasks.v1`.
  - `welcomeStore.ts`: prefix/name/email/DOB/phone, welcome state, and per-day intention.
  - `accountStore.ts`: local registration, session, and email OTP prototype.
  - `customImages.ts`: user-uploaded image rules keyed by keyword.
  - `readImageFile.ts`: resize/encode uploaded task images.
  - `taskRepository.test.ts`, `welcomeStore.test.ts`, and `customImages.test.ts`: persistence tests.

### `src/features/` — Domain Vertical Slices
Each subfolder under `src/features/` encapsulates a complete user-facing product domain:

#### 1. `src/features/landing/`
- **Route**: `/`
- **Components**: `LandingHeader`, `LandingHero`, `LandingPreview`, `LandingUseCases`, `LandingBenefits`, `LandingFooter`.
- **Purpose**: The public marketing face of ViDo explaining the value proposition to personal, household, and work users.

#### 2. `src/features/workspace/`
- **Route**: `/app/*`
- **Components**:
  - `WorkspaceLayout.tsx`: Shell layout with icon rail, top bar, quick capture, focus, and subroute rendering.
  - `WorkspaceTopBar.tsx`: Sticky top navigation bar with title, search, and filters.
  - `WorkspaceSidebar.tsx`: Labelled sidebar with motivating labels and standard view hints.
  - `QuickAdd.tsx`: Quick capture with priority, calendar, deadline, and recurrence controls.
  - `useTaskStore.ts`: Task state and lifecycle actions backed by localStorage.
  - `useWelcome.ts`: Profile name, welcome state, and daily intention.
  - `WelcomeCard.tsx` and `IntentionBar.tsx`: First-run welcome and optional daily intention.
  - `MomentumStrip.tsx`: Seven-day completion view.
  - `FocusMode.tsx`: One-task focus view with progress ring and checkpoints.
  - `TaskRow.tsx`: Disciplined bubble card with image + title, deadline cue, progress cue, and actions.
  - `TaskPathView.tsx`: Per-task path page with step board and assistant entry point.
  - `PathAssistantModal.tsx`: Conversational step drafting with approval.
  - `SystemClock.tsx`: Live date/time shown at the right from 1280px up.
  - `TaskCheckInTray.tsx`: Done / not today / not important / partial progress.
  - `HelpModal.tsx`: Short guide to views, check-in, keyboard, and images.
  - `CustomImageEditor.tsx`: Upload and keyword-reuse editor for unmatched task images.
  - `views/AuthView.tsx`: Registration and email + OTP sign-in page.
  - `TaskCard.tsx`: Older card representation retained for compatibility.
  - `TaskDetailModal.tsx` & `TaskCreateModal.tsx`: Working modals for editing and creating tasks.
  - `doodles/`: `DoodleTitle`, `Doodle`, image detection, and image assets mapping.
  - `views/HomeView.tsx`: Greeting, focus card, momentum, and today’s card board.
  - `views/TodayQueueView.tsx`: Due-today and future-deadline card board with earlier suggestions, quote, and priority note.
  - `views/PathsView.tsx`: Today/future task selector for task paths.
  - `views/TrailView.tsx`: Snake-and-ladder momentum board.
  - `views/ProfileView.tsx`: Prefix and name editing.
  - `views/ListView.tsx`: Card board for Upcoming, Past, Completed, and Archived.
- **Rules**:
  - Data is real and persisted; there is no demo mode.
  - Views must derive from real dates and the task store.
  - Every mutation must go through `useTaskStore`.

#### 3. `src/features/style-lab/`
- **Route**: `/style-lab`
- **Components**: `StyleLab.tsx` and colocated test `StyleLab.test.tsx`.
- **Purpose**: Live sandbox for accent palettes, UI primitives, and the open-source image library. Image-style experiments here do not drive the main workspace.

### `src/test/` — Testing Infrastructure
- `setup.ts`: Configures `@testing-library/jest-dom` matchers and mock polyfills for Happy DOM.
- `noEmoji.test.ts`: Fails if emoji or replaced glyph codepoints appear in `src/` or `index.html`.

### `journal/` — Local Only
- Not included in this copy. Session notes and idea registers stay on the author's machine.

### `openspec/` & `.agents/` — Historical Workflow
- `openspec/` and `.agents/` are historical spec-driven artifacts. Current work is tracked in GitHub issues.

---

## 3. Placement Decision Matrix: "Where Does My File Go?"

When adding or modifying files, follow this decision tree:

| What are you adding? | Target Directory | File Naming Convention |
|---|---|---|
| New reusable UI element (e.g., Tooltip, Dropdown) | `src/components/ui/` | `PascalCase.tsx` + export in `index.ts` |
| New marketing section for landing page | `src/features/landing/` | `Landing<SectionName>.tsx` |
| New dashboard view or workspace component | `src/features/workspace/` | `<ComponentName>.tsx` |
| New subroute view under `/app/<route>` | `src/features/workspace/views/` | `<RouteName>View.tsx` |
| Data type, interface, or sample fixture | `src/data/` | `camelCase.ts` |
| Pure business logic or filtering algorithm | `src/data/` | `camelCase.ts` |
| Browser persistence or storage adapter | `src/lib/` | `camelCase.ts` |
| Offline intelligent feature | `intelligent-layer/<feature>/` | `camelCase.ts` + `index.ts` barrel |
| Future API client, backend integration, or Supabase client | `src/lib/` or `src/services/` | `camelCase.ts` |
| Unit / integration test | Colocated with feature/component | `<TargetName>.test.tsx` or `.test.ts` |
| Task image asset | `public/doodles/` | kebab-case `.svg` / `.png` |
| Global CSS or styling tokens | `src/index.css` | kebab-case variables |

---

## 4. Strict Anti-Patterns & Rules (DO NOT DO)

1. **DO NOT dump files into `src/` root**: Only `App.tsx`, `main.tsx`, `index.css`, and global type declaration files belong directly in `src/`.
2. **DO NOT create arbitrary folders at the project root**: Project root is strictly reserved for standard tooling configs (`vite.config.ts`, `package.json`, etc.) and root markdown guides (`README.md`, `AGENTS.md`, `FOLDER_STRUCTURE.md`, `context.md`, `MILESTONES.md`).
3. **DO NOT import domain types into `src/components/ui/`**: UI primitives must remain generic and reusable.
4. **DO NOT hardcode raw hex colors or ad-hoc Tailwind colors**: Use semantic CSS variables defined in `src/index.css` (`var(--accent)`, `var(--surface)`, `var(--canvas)`, `var(--ink)`, `var(--muted)`, `var(--line)`).
5. **DO NOT create orphan components without tests**: Every new component or calculation function must have a colocated test.
6. **DO NOT expose secrets or service-role keys**: All client code runs in the browser. Never commit `.env` or paste private backend tokens.
7. **DO NOT reintroduce demo framing**: no demo banner, "Demo User", preview badge, or fixed benchmark date. The app at `/app` is real and persisted.
8. **DO NOT render image-only task labels**: recognised tasks always show image + title; unrecognised tasks stay as text.
9. **DO NOT add unlicensed images**: update `public/doodles/README.md` with source and license.
