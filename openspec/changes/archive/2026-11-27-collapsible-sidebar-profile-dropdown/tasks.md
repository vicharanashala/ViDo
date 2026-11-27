# Tasks

## 1. Clean Up Left Sidebar & Add Collapsible Icon Rail

- [x] 1.1 Remove user profile card, Settings button, and Sign Out button from the bottom of `WorkspaceSidebar.tsx` to dedicate the sidebar strictly to task views, categories, and teams.
- [x] 1.2 Add `isCollapsed` state with `localStorage` persistence (`vido_sidebar_collapsed`) and header collapse/expand toggle button using `PanelLeftClose` and `PanelLeftOpen` icons.
- [x] 1.3 Implement the collapsed 64px icon rail presentation with a compact `+` button for "New Task", centered navigation icons, and hover tooltips for views, categories, and teams.
- [x] 1.4 Disable the resize drag handle while collapsed and ensure restoring expands to the previously saved custom width (`vido_sidebar_width`).
- [x] 1.5 Update `WorkspaceSidebar.test.tsx` to verify collapse/expand toggling, icon rail rendering, absence of footer account items, and run tests via `npm test -- WorkspaceSidebar.test.tsx`.

## 2. Top Bar Circular Avatar Trigger & Profile Dropdown

- [x] 2.1 Replace the horizontal profile text and separate sign-out button in `WorkspaceTopBar.tsx` with a circular avatar trigger displaying user initials with active hover/focus indicators.
- [x] 2.2 Implement the floating glass profile dropdown menu featuring user identity details (name, email, workspace badge), quick atmosphere switcher buttons (Auto, Light, Evening, Dark) wired to `useTheme()`, Settings action, Style Lab link, and Sign Out button.
- [x] 2.3 Add accessible outside-click and `Escape` key dismissal to the profile dropdown menu.
- [x] 2.4 Wire `onOpenSettings` from `WorkspaceLayout.tsx` into `WorkspaceTopBar.tsx` so clicking Settings in the dropdown opens the `SettingsModal`.
- [x] 2.5 Update `WorkspaceTopBar.test.tsx` to verify avatar clicking, dropdown menu display, theme switching, settings trigger, and sign-out, running tests via `npm test -- WorkspaceTopBar.test.tsx`.

## 3. End-to-End Verification

- [x] 3.1 Run `npm run typecheck` and verify 0 TypeScript errors.
- [x] 3.2 Run `npm test` and verify all test suites across the workspace pass cleanly.
- [x] 3.3 Run `npm run build` and verify production compilation completes without errors.

## Workflow follow-up

- Archive the change after the project's review requirements are satisfied.
- Verify the archived result.
