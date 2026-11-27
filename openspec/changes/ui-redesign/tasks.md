# Tasks: UI Redesign — Consistent Global Header & Decoupled Page Views

## 1. TopBar Component Refactoring

- [x] 1.1 Remove `title` and `subtitle` props from `WorkspaceTopBarProps` in `src/features/workspace/WorkspaceTopBar.tsx` and streamline the top bar into a persistent, uniform utility header (search with shortcut hint, live date badge, team notification bell, user identity profile, and sign-out controls).
- [x] 1.2 Update unit tests in `src/features/workspace/WorkspaceTopBar.test.tsx` to assert global utility elements and verify test suite passes.

## 2. Workspace Shell Layout Decoupling

- [x] 2.1 Remove the `getHeaderInfo()` mapping function in `src/features/workspace/WorkspaceLayout.tsx` and pass only global session properties to `WorkspaceTopBar`.
- [x] 2.2 Verify that navigating across all workspace subroutes maintains a steady top bar without header flashing or title duplication.

## 3. View Headings & Layout Cleanup

- [x] 3.1 Refine page headings and filter bars in `src/features/workspace/views/ListView.tsx` and `src/features/workspace/views/HomeView.tsx` so each view cleanly owns its visual hierarchy without expecting a duplicate topbar title.
- [x] 3.2 Update integration tests in `src/features/workspace/WorkspaceViewsAndModals.test.tsx` to match the decoupled view structure and verify all tests pass.

## 4. Full Quality Verification

- [x] 4.1 Run `npm run typecheck` and confirm 0 TypeScript compiler errors.
- [x] 4.2 Run `npm test` and confirm all test suites pass with zero regressions.
- [x] 4.3 Run `npm run build:server` and `npm run build` to confirm production bundles compile cleanly.
