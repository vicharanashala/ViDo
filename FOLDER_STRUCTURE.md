# ViDo — Repository & Folder Structure Guide

> **MANDATORY FOR ALL CONTRIBUTORS AND AI AGENTS:**
> Before proposing, creating, or moving any files, you **must** read this guide. Adherence to this folder structure is strictly enforced to ensure modularity, maintainability, and clean separation of concerns.

---

## 1. High-Level Architecture Overview

ViDo follows a **feature-driven, modular frontend architecture**. Code is organized by domain responsibilities (*features*) rather than technical types (*e.g., all components in one giant folder, all hooks in another*). Shared, domain-agnostic UI primitives reside in `src/components/ui/`, while core data types and pure calculation logic live in `src/data/`.

```text
ViDo/
├── .agents/                 # OpenSpec local skills and agent tooling
├── openspec/                # OpenSpec specification and change tracking
├── public/                  # Static assets served untouched by Vite
├── src/
│   ├── components/ui/       # Domain-agnostic reusable UI primitives (Button, Card, Badge, etc.)
│   ├── data/                # Data types, deterministic fixtures, pure filtering & logic
│   ├── features/            # Vertical slices of user-facing functionality
│   │   ├── landing/         # Public landing page (/ route)
│   │   ├── style-lab/       # Theme, accent palette, and visual lab (/style-lab route)
│   │   └── workspace/       # Working task workspace (/app route)
│   │       └── views/       # Subroute view components (Home, Today, Upcoming, etc.)
│   ├── lib/                 # Browser persistence (localStorage task repository)
│   ├── test/                # Global test setup and environment configuration
│   ├── App.tsx              # Central client-side routing
│   ├── index.css            # Global CSS variables, theme variables, and Tailwind v4 setup
│   ├── main.tsx             # Application bootstrap & DOM mount
│   └── vite-env.d.ts        # Vite TypeScript type declarations
├── .gitignore               # Ignored build artifacts, dependencies, and caches
├── AGENTS.md                # AI Agent guidelines and execution standards
├── FOLDER_STRUCTURE.md      # This file: Directory layout and placement rules
├── MILESTONES.md            # Product milestones and evolution roadmap
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
- **Purpose**: Low-level, domain-agnostic UI building blocks (e.g., `Button`, `Badge`, `Card`, `Input`, `NoticeModal`).
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
  - `taskFilters.ts`: pure functions for Today, Upcoming, Needs Attention, Completed, Archived, search, and filters.
  - `taskFilters.test.ts`: unit tests for derived views, filtering, and pace.
- **Rules**:
  - Keep functions pure and side-effect free.
  - Dates are calculated from the current date; there is no fixed benchmark date.

### `src/lib/` — Browser Persistence
- **Purpose**: Side-effectful infrastructure such as the localStorage task repository.
- **Current Contents**:
  - `taskRepository.ts`: load, save, normalize, and clear tasks under `vido.tasks.v1`.
  - `taskRepository.test.ts`: persistence and seed behavior tests.

### `src/features/` — Domain Vertical Slices
Each subfolder under `src/features/` encapsulates a complete user-facing product domain:

#### 1. `src/features/landing/`
- **Route**: `/`
- **Components**: `LandingHeader`, `LandingHero`, `LandingPreview`, `LandingUseCases`, `LandingBenefits`, `LandingFooter`.
- **Purpose**: The public marketing face of ViDo explaining the value proposition to personal, household, and work users.

#### 2. `src/features/workspace/`
- **Route**: `/app/*`
- **Components**:
  - `WorkspaceLayout.tsx`: Shell layout with sidebar, top bar, quick capture, and subroute rendering.
  - `WorkspaceTopBar.tsx`: Sticky top navigation bar with title, search, filters, and local profile.
  - `WorkspaceSidebar.tsx`: Left navigation sidebar with view links and counts.
  - `QuickAdd.tsx`: One-field capture form.
  - `useTaskStore.ts`: Task state and lifecycle actions backed by localStorage.
  - `TaskRow.tsx`: Horizontal task row with priority, progress, pace, and checkpoint count.
  - `TaskCard.tsx`: Card representation of a task.
  - `TaskDetailModal.tsx` & `TaskCreateModal.tsx`: Working modals for editing and creating tasks.
  - `views/HomeView.tsx`: Dashboard command center with 4 interactive summary tiles and task feed.
  - `views/ListView.tsx`: Category-filterable list view for specific subroutes.
- **Rules**:
  - Data is real and persisted; there is no demo mode.
  - Views must derive from real dates and the task store.
  - Every mutation must go through `useTaskStore`.

#### 3. `src/features/style-lab/`
- **Route**: `/style-lab`
- **Components**: `StyleLab.tsx` and colocated test `StyleLab.test.tsx`.
- **Purpose**: Live sandbox allowing users and developers to test the three core design palettes (`Cobalt Blue`, `Deep Indigo`, and `Forest Green`).

### `src/test/` — Testing Infrastructure
- `setup.ts`: Configures `@testing-library/jest-dom` matchers and mock polyfills for Happy DOM.

### `openspec/` & `.agents/` — Spec-Driven Workflow
- `openspec/`: OpenSpec directory storing specs, changes, proposals, and tasks.
- `.agents/`: Agent skill files used by automated coding agents.

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
| Future API client, backend integration, or Supabase client | `src/lib/` or `src/services/` | `camelCase.ts` |
| Unit / integration test | Colocated with feature/component | `<TargetName>.test.tsx` or `.test.ts` |
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
