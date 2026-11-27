# ViDo — Repository & Folder Structure Guide

> **MANDATORY FOR ALL CONTRIBUTORS AND AI AGENTS:**
> Before proposing, creating, or moving any files, you **must** read this guide. Adherence to this folder structure is strictly enforced to ensure modularity, maintainability, and clean separation of concerns.

---

## 1. High-Level Architecture Overview

ViDo follows a **feature-driven, modular frontend architecture**. Code is organized by domain responsibilities (*features*) rather than technical types (*e.g., all components in one giant folder, all hooks in another*). Shared, domain-agnostic UI primitives reside in `src/components/ui/`, while core data types and pure calculation logic live in `src/data/`.

```text
ViDo/
├── .agents/                 # OpenSpec local skills and agent tooling
├── intelligent-layer/       # Placeholder for future intelligent layer (agents & ML models)
├── openspec/                # OpenSpec specification and change tracking
├── public/                  # Static assets served untouched by Vite
├── server/                  # NestJS backend application with Prisma ORM and SSE
│   ├── prisma/              # Prisma schema, SQLite local database, and migrations
│   ├── src/                 # NestJS modules (auth, teams, invitations, milestones, tasks, events)
│   ├── package.json         # Backend dependencies and scripts
│   └── tsconfig.json        # Backend TypeScript configuration
├── src/
│   ├── components/ui/       # Domain-agnostic reusable UI primitives (Button, Card, Badge, etc.)
│   ├── data/                # Data types, deterministic fixtures, pure filtering & logic
│   ├── features/            # Vertical slices of user-facing functionality
│   │   ├── auth/            # Auth provider and session state
│   │   ├── landing/         # Public landing page (/ route)
│   │   ├── style-lab/       # Theme, accent palette, and visual lab (/style-lab route)
│   │   └── workspace/       # Dashboard shell for the live app (/workspace) and demo (/preview)
│   │       └── views/       # Subroute view components (Home, Today, Upcoming, etc.)
│   ├── lib/                 # Firebase init, auth helpers, task/calendar/settings stores
│   ├── test/                # Global test setup and environment configuration
│   ├── App.tsx              # Central client-side routing
│   ├── index.css            # Global CSS variables, theme variables, and Tailwind v4 setup
│   ├── main.tsx             # Application bootstrap & DOM mount
│   └── vite-env.d.ts        # Vite TypeScript type declarations
├── .env.example             # Firebase/emulator environment overrides
├── .firebaserc              # Firebase project alias (demo-vido)
├── firebase.json            # Emulator ports and rules/index references
├── firestore.rules          # Per-user Firestore security rules
├── firestore.indexes.json   # Firestore composite indexes
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
  - `sampleTasks.ts`: Deterministic task dataset, priorities, tags, categories, and checkpoints.
  - `taskFilters.ts`: Pure functions for filtering tasks into *Today*, *Upcoming*, *Needs Attention*, *Completed*, and *Archived*.
  - `calendar.ts`: ISO date helpers, week/month grids, sample calendar events, and event sorting.
  - `analytics.ts`: Weekly/monthly completion stats, target progress, and cumulative monthly roll-ups.
  - `taskFilters.test.ts`, `calendar.test.ts`, `analytics.test.ts`: Colocated pure-logic tests.
- **Rules**:
  - Keep functions pure and side-effect free.
  - The deterministic base date for preview fixtures is **Tuesday, 17 November 2026**.

### `src/features/` — Domain Vertical Slices
Each subfolder under `src/features/` encapsulates a complete user-facing product domain:

#### 1. `src/features/landing/`
- **Route**: `/`
- **Components**: `LandingHeader`, `LandingHero`, `LandingPreview`, `LandingUseCases`, `LandingBenefits`, `LandingFooter`.
- **Purpose**: The public marketing face of ViDo explaining the value proposition to personal, household, and work users.

#### 2. `src/features/workspace/`
- **Routes**: `/preview/*` and `/workspace/*`
- **Components**:
  - `WorkspaceLayout.tsx`: Shared shell layout with persistent banner, sidebar, topbar, and subroutes.
  - `WorkspaceTopBar.tsx`: Sticky top navigation bar with title, search, filter, and user profile.
  - `WorkspaceSidebar.tsx`: Left navigation sidebar with view links, badges, and theme link.
  - `LiveWorkspace.tsx`: Authenticated live shell wired to Firestore task, calendar, and target hooks.
  - `useUserTasks.ts`: Live task subscription and write helpers.
  - `useCalendar.ts` / `usePlanningTargets.ts`: Mode-aware hooks selecting Firestore or preview `localStorage`.
  - `TaskRow.tsx`: Horizontal, scannable task row with priority badge, progress bar, and checkpoint counts.
  - `TaskCard.tsx`: Detailed card representation of a task.
  - `TaskDetailModal.tsx` & `TaskCreateModal.tsx`: Interactive modals for inspecting and creating tasks.
  - `views/HomeView.tsx`: Dashboard command center with 4 interactive summary tiles and task feed.
  - `views/ListView.tsx`: Category-filterable list view for specific subroutes.
  - `views/CalendarView.tsx`: Weekly/monthly unified tasks-and-events calendar with two-way actions.
  - `views/AnalyticsView.tsx`: Completion percentages, target progress, and monthly roll-up charts.
- **Rules**:
  - Preview mode must remain clearly designated as an **interactive preview** with sample data.
  - Live mode requires Firebase emulator sign-in and stores data under `users/{uid}`.
  - Must provide the left-aligned **Back to Landing Page** navigation on the persistent top banner.

#### 3. `src/features/teams/`
- **Route**: `/workspace/team/:teamId`, `/preview/team/:teamId`
- **Components & Modules**:
  - `types.ts`: Team models (`Team`, `TeamMember`, `TeamInvitation`, `TeamMilestone`, `TeamTask`, `UserProfile`).
  - `teamRepository.ts`: Dual-mode storage interface and environment-aware factory (`getTeamRepository()`).
  - `MockTeamRepository.ts`: In-memory and `localStorage` mock repository supporting zero-credential offline testing.
  - `SupabaseTeamRepository.ts`: Production Supabase PostgreSQL and Realtime client.
  - `NotificationBell.tsx`: Top utility bar invitation alert with interactive Accept and Reject controls.
  - `InviteMemberModal.tsx`: Google email member invitation modal with duplicate prevention.
  - `CreateTeamModal.tsx`: Team workspace creation dialog with automatic Team Lead designation.
  - `MilestoneRoadmap.tsx`: Phased roadmap component displaying project milestones, sequence, and status.
  - `TeamTaskRow.tsx`: Shared task deliverable with lead-driven permission enforcement (assignee/lead editable, member read-only).
  - `TeamTaskCreateModal.tsx`: Milestone-linked team task creation for Team Leads.
  - `TeamSpaceView.tsx`: Comprehensive team dashboard with milestone roadmap, member roster, and filtered task backlog.

#### 4. `src/features/style-lab/`
- **Route**: `/style-lab`
- **Components**: `StyleLab.tsx` and colocated test `StyleLab.test.tsx`.
- **Purpose**: Live sandbox allowing users and developers to test the three core design palettes (`Cobalt Blue`, `Deep Indigo`, and `Forest Green`).

### `src/test/` — Testing Infrastructure
- `setup.ts`: Configures `@testing-library/jest-dom` matchers and mock polyfills for Happy DOM.

### `server/` — Dedicated NestJS Backend & Prisma ORM
- **Purpose**: Enterprise backend application providing REST endpoints, Prisma ORM modeling, Firebase token validation, and Server-Sent Events (SSE).
- **Subdirectories**:
  - `server/prisma/`: SQLite schema (`schema.prisma`) for zero-setup local development and PostgreSQL production configuration.
  - `server/src/auth/`: Firebase ID token decoder and `FirebaseAuthGuard` supporting the local Firebase Auth Emulator (`127.0.0.1:9099`).
  - `server/src/teams/`, `invitations/`, `milestones/`, `tasks/`: Domain controllers and services.
  - `server/src/events/`: Real-time SSE event broadcaster (`/api/events/stream`).

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
| New subroute view under `/preview/<route>` | `src/features/workspace/views/` | `<RouteName>View.tsx` |
| Data type, interface, or sample fixture | `src/data/` | `camelCase.ts` |
| Pure business logic or filtering algorithm | `src/data/` | `camelCase.ts` |
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
7. **DO NOT label the product as a student or homework project in the UI**: Present ViDo as a refined SaaS product with an interactive `/preview` demo.
