# Design: Consistent Global Workspace Header & Decoupled Views

## Context
See `proposal.md` for motivation and background.

Currently, `WorkspaceLayout` computes a `headerInfo` object via `getHeaderInfo()` and passes `title` and `subtitle` down into `WorkspaceTopBar`. Because six different routes (`/tasks`, `/today`, `/upcoming`, `/needs-attention`, `/completed`, `/archived`) map to `title: 'Tasks'`, navigating between them causes topbar stagnation while competing with in-page headings (e.g. `ListView`'s `<h2>Today's Work</h2>`).

## Goals / Non-Goals

**Goals:**
- Provide a consistent, steady global top bar across all `/workspace/*` and `/preview/*` routes.
- Remove fluctuating, redundant `title` and `subtitle` props from `WorkspaceTopBar`.
- Eliminate the `getHeaderInfo()` mapping function from `WorkspaceLayout`.
- Allow individual page views (`ListView`, `HomeView`, `CalendarView`, `AnalyticsView`, `TeamSpaceView`) to cleanly own their heading and view controls.
- Reclaim ~80px of vertical space by eliminating stacked headers.

**Non-Goals:**
- Modifying backend endpoints, Prisma models, or Firestore security rules.
- Redesigning the public landing page (`/`) or Style Lab (`/style-lab`).
- Changing task filtering algorithms or data models.

## Decisions

### Decision 1: Refactor `WorkspaceTopBar` as a Pure Global Utility Bar
- **Choice**: Remove `title` and `subtitle` from `WorkspaceTopBarProps`. The component renders:
  1. Global quick search with `Cmd+K` keyboard hint.
  2. Live synchronized date badge.
  3. Team invitation notification bell.
  4. User identity badge, auth mode pill (`Live Firebase` vs `Emulator`), and sign-out action.
- **Alternatives Considered**:
  - *Keep dynamic titles in TopBar and delete in-page headings*: Rejected because pages like `CalendarView` and `AnalyticsView` need view-specific controls (e.g. month/week toggle, target pickers) that belong directly in the canvas.
  - *Keep optional title prop*: Rejected to prevent accidental reintroduction of double-title stacking.

### Decision 2: Remove `getHeaderInfo()` from `WorkspaceLayout`
- **Choice**: Completely remove `getHeaderInfo()` and simplify the `WorkspaceTopBar` JSX call to only pass global session attributes (`user`, `isPreview`, `authMode`, `onSignOut`, `onRespondInvitation`, `currentDate`).
- **Rationale**: Keeps layout orchestration clean and focused on routing and data loading.

### Decision 3: Align Page Views as Autonomous Units
- **Choice**: In `ListView.tsx` and `HomeView.tsx`, ensure headings are crisp and clear without assuming a duplicate title exists above them.
- **Rationale**: Keeps views self-contained and modular per `FOLDER_STRUCTURE.md`.

## Risks / Trade-offs

- **[Risk] Test suite failures on title assertions**: Tests in `WorkspaceTopBar.test.tsx` and `WorkspaceViewsAndModals.test.tsx` that assert `screen.getByRole('heading', { name: /tasks/i })` in the top bar will fail.
  - **Mitigation**: Update test assertions to verify top bar utility components (search input, date badge, user initials) and verify page-level titles in their respective view tests.
