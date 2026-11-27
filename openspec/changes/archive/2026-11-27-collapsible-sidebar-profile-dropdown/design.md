# Design

## Context

See `proposal.md` for problem context and user motivations.

Currently:
- `WorkspaceSidebar` manages resizable width (`MIN_SIDEBAR_WIDTH = 240`, `MAX_SIDEBAR_WIDTH = 480`, `DEFAULT_SIDEBAR_WIDTH = 256`) with drag-to-resize persisted in `vido_sidebar_width`. At the bottom, it mounts a user profile badge, a Settings button, and a Sign Out button.
- `WorkspaceTopBar` renders a horizontal user badge (`[Initials circle] [User Name] [Email / Subtitle] [Demo badge]`) and a standalone Sign Out button on the far right.
- `theme.ts` provides `useTheme()` with `mode: 'auto' | 'light' | 'evening' | 'dark'`, `resolvedTheme`, and `setMode()`.
- `SettingsModal` is controlled by `WorkspaceLayout` via `showSettingsModal`.

## Goals / Non-Goals

**Goals:**
- Provide a responsive, collapsible sidebar that switches cleanly between custom resizable width and a 64px icon rail with hover tooltips and count badges.
- Clean up the sidebar so all vertical real estate is focused entirely on task views, custom categories, and team spaces.
- Consolidate user identity, atmosphere/theme quick toggles, workspace settings, style lab shortcut, and session termination into an accessible top-right dropdown anchored to a circular avatar button.
- Ensure seamless keyboard accessibility (`Escape` dismissal, focus trapping / tab flow) and click-outside dismissal for the dropdown.

**Non-Goals:**
- Redesigning the entire Settings modal content or underlying authentication mechanics.
- Removing the drag-to-resize feature for the expanded sidebar; collapsing will coexist with resizing.

## Decisions

### Decision 1: Icon Rail vs Full 0px Hide for Collapsed State
- **Choice**: Icon rail (`64px` / `w-16`).
- **Rationale**: ViDo is a focused task productivity dashboard. Users frequently jump between Today, Upcoming, and Calendar views. An icon rail preserves immediate 1-click access with intuitive hover tooltips, while freeing up significant horizontal width for complex task boards, calendar matrices, and analytics charts.
- **Alternative considered**: Full 0px drawer requiring a top-bar hamburger button. Rejected because it adds an extra click for every navigation event on desktop viewports.

### Decision 2: Sidebar Header Toggle Placement & Resizing Interaction
- **Choice**: Place toggle button in sidebar header beside the ViDo brand (`PanelLeftClose` when expanded, `PanelLeftOpen` when collapsed). Disable mouse drag resize handle when collapsed.
- **Rationale**: Placing the toggle in the sidebar keeps the action colocated with the component it manipulates. Suppressing the resize handle during collapsed mode prevents accidental dragging of the mini rail. When expanded, width returns to the exact width previously set in `localStorage` (`vido_sidebar_width`).
- **Storage key**: `vido_sidebar_collapsed` (`'true'` | `'false'`).

### Decision 3: Top Bar Profile Dropdown Structure & Theme Integration
- **Choice**: Replace static profile and standalone logout in `WorkspaceTopBar` with an interactive button `<button aria-haspopup="menu" aria-expanded={isOpen}>` rendering initials inside an accent circle. Clicking opens a glass popover card.
- **Sections inside Dropdown**:
  1. Profile Identity Header: User name, email, workspace badge (Interactive Preview vs Live).
  2. Atmosphere Theme Switcher: Auto, Light, Evening, Dark buttons calling `setMode()` from `useTheme()`.
  3. Action Links: Settings (invokes `onOpenSettings`), Theme & Palette Lab (`/style-lab`).
  4. Sign Out button: Calls `onSignOut`.
- **Dismissal**: Window `mousedown` listener for click-outside and `keydown` for `Escape`.

## Risks / Trade-offs

- **[Risk]** Tooltip overflow in collapsed rail when items are hovered.
  - *Mitigation*: Use pure CSS or floating positioning with `z-50`, pointer-events-none, and `whitespace-nowrap` placed to the right of the icon rail (`left-full ml-2`).
- **[Risk]** Layout jumping during width transition.
  - *Mitigation*: Apply `transition-[width] duration-200 ease-in-out` and ensure `overflow-hidden` is active so long text labels do not wrap or cause layout jitter during the 200ms transition.
- **[Risk]** Interrupted dragging if collapse state toggles.
  - *Mitigation*: The resize handle is hidden (`hidden`) when `isCollapsed` is true.
