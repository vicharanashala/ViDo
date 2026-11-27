# Proposal: UI Redesign — Consistent Global Header & Decoupled Page Views

## Why

Currently, every page in the workspace shell suffers from a "double header" problem: the top utility bar repeatedly renders a generic title (`title: 'Tasks'` on six distinct subroutes) alongside a subtitle, while the page view immediately beneath it renders a second heading (e.g. `<h2>Today's Work</h2>`) and another description. This creates redundant visual noise, causes cognitive dissonance across navigation, and wastes over 80px of critical vertical screen space before the user can see their first task.

Establishing a consistent, persistent application header across all pages and letting each view cleanly own its heading eliminates duplication and aligns with ViDo's core principle of calm, distraction-free productivity.

## What Changes

- **Consistent Global TopBar**: Refactor `WorkspaceTopBar` into a persistent global utility bar containing application branding/context, global search (`Cmd+K`), live synchronized date badge, team invitation alerts, and user identity/auth controls.
- **Remove Redundant TopBar Title Props**: Remove the fluctuating `title` and `subtitle` props from `WorkspaceTopBar`.
- **Decouple Shell from View Titles**: Remove the hardcoded `getHeaderInfo()` mapping in `WorkspaceLayout.tsx`.
- **Autonomous Page View Headings**: Ensure `ListView.tsx`, `HomeView.tsx`, `CalendarView.tsx`, `AnalyticsView.tsx`, and `TeamSpaceView.tsx` render clear, single-origin headings and filters without duplicate stacked topbar titles.
- **Updated Test Suites**: Update `WorkspaceTopBar.test.tsx` and `WorkspaceViewsAndModals.test.tsx` to verify consistent header rendering and view independence.

## Capabilities

### Modified Capabilities
- `workspace-shell`: Refine top utility bar requirements to serve as a steady, consistent global workspace header without per-route title/subtitle duplication.

## Impact

- **Affected Components**:
  - `src/features/workspace/WorkspaceTopBar.tsx`
  - `src/features/workspace/WorkspaceLayout.tsx`
  - `src/features/workspace/views/ListView.tsx`
  - `src/features/workspace/views/HomeView.tsx`
- **Affected Tests**:
  - `src/features/workspace/WorkspaceTopBar.test.tsx`
  - `src/features/workspace/WorkspaceViewsAndModals.test.tsx`
- **APIs & Dependencies**: No breaking changes to backend APIs or external libraries. Pure frontend visual and structural polish.
