# Proposal

## Why

Currently, the workspace layout duplicates user profile details, Settings, and Sign Out across both the bottom of the left sidebar and the top utility bar. This creates visual redundancy and consumes valuable vertical screen space in the sidebar that should be dedicated to task navigation, custom categories, and team spaces. Additionally, on smaller screens or during focused task work, the sidebar cannot be collapsed to maximize the task board and calendar view areas.

Consolidating account identity and preferences into an interactive top-bar profile dropdown, stripping account controls from the sidebar, and making the sidebar collapsible into a compact icon rail streamlines navigation and aligns ViDo with high-productivity SaaS workspace standards.

## What Changes

- **Collapsible Sidebar**:
  - Add a collapse toggle button in the sidebar header beside the ViDo brand (`PanelLeftClose` / `PanelLeftOpen`).
  - Support a collapsed icon-rail state (64px width) where brand text, section headers, and labels hide while icon buttons remain accessible with hover tooltips and count badges.
  - Retain the compact `+` button in collapsed mode for the "New Task" action.
  - Persist collapsed state (`vido_sidebar_collapsed`) in `localStorage` across page reloads.
  - Restore user's custom dragged width (`vido_sidebar_width`) upon expanding.
  - Disable the resize gutter drag handle while collapsed.
- **Dedicated Task Navigation**:
  - Remove the user profile card, Settings button, and Sign Out button from the bottom of the left sidebar.
  - Ensure the sidebar solely hosts task views (All Tasks, Today, Upcoming, Needs Attention, Completed, Calendar, Analytics), custom categories, and team spaces.
- **Top Bar Profile Avatar & Dropdown**:
  - Replace the horizontal profile text banner and separate logout button in `WorkspaceTopBar` with a clean circular avatar trigger showing user initials and focus ring.
  - Clicking the avatar opens an accessible floating glass dropdown menu.
  - Include within the dropdown:
    - User identity header (name, email, interactive preview or live workspace badge).
    - Quick theme atmosphere switcher (Auto, Light, Evening, Dark) integrating with `useTheme()`.
    - Navigation actions for Workspace Settings (opening `SettingsModal` or navigating to `/settings`) and Theme & Palette Lab (`/style-lab`).
    - Sign Out / Exit Demo button with destructive hover styling.
  - Implement outside-click and `Escape` key dismissal.

## Capabilities

### New Capabilities
<!-- No new durable system capability is required; this refines existing workspace shell interactions -->

### Modified Capabilities
- `workspace-shell`: Modifies sidebar navigation to support collapsible icon-rail mode and removes account controls from the sidebar; updates top bar controls to replace static profile info and standalone logout with a circular avatar dropdown menu containing profile details, quick theme toggles, settings, and sign-out.

## Impact

- **UI Components**:
  - `src/features/workspace/WorkspaceSidebar.tsx`: Collapse toggle, icon rail layout, removal of bottom account footer.
  - `src/features/workspace/WorkspaceTopBar.tsx`: Avatar button trigger, interactive dropdown menu with theme switcher and settings/logout actions.
  - `src/features/workspace/WorkspaceLayout.tsx`: Coordinate settings modal opening from top bar dropdown and sidebar width/collapsed state.
- **State & Storage**:
  - `localStorage` key `vido_sidebar_collapsed` (`'true'` | `'false'`).
  - Seamless interoperability with existing `vido_sidebar_width` and `vido_theme_mode`.
- **Tests**:
  - `WorkspaceSidebar.test.tsx` and `WorkspaceTopBar.test.tsx` updated to verify collapse toggle, icon rail presentation, avatar click, dropdown visibility, theme switching, and sign-out triggers.
