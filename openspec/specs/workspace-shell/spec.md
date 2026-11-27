# workspace-shell Specification

## Purpose

Provides a persistent desktop workspace shell featuring sidebar navigation, derived task views, section-limited backlog displays, and modal concepts.

## Requirements

### Requirement: Desktop sidebar navigation
The workspace shell SHALL provide a persistent left navigation sidebar dedicated exclusively to task views, custom categories, and team spaces. The sidebar SHALL provide a collapse toggle button in its header to collapse into a 64px compact icon rail or expand to the user's custom width, persisting collapse state across sessions.

#### Scenario: Navigating between workspace views
- **WHEN** the user selects any personal or team navigation item in the sidebar
- **THEN** the shell updates the active route and renders the corresponding view content with active navigation styling.

#### Scenario: Accessing a team space from sidebar
- **WHEN** the user clicks on an accepted team name under the Teams section
- **THEN** the shell routes to that team's shared workspace view and highlights the active team navigation link.

#### Scenario: Collapsing the sidebar into an icon rail
- **WHEN** the user clicks the collapse toggle button in the sidebar header
- **THEN** the sidebar width animates to a 64px icon rail, hides text labels, preserves icon buttons with hover tooltips, and disables the resizable drag gutter.

#### Scenario: Expanding the sidebar from the icon rail
- **WHEN** the user clicks the expand toggle button on the collapsed icon rail
- **THEN** the sidebar width animates back to the previously stored custom width and restores full navigation labels and section headers.

#### Scenario: Removing account actions from sidebar
- **WHEN** the user inspects the sidebar footer
- **THEN** the sidebar displays solely task and workspace navigation items, omitting user profile info, settings, and sign-out controls.

### Requirement: Top bar controls and user placeholder
The workspace shell SHALL render a top utility bar containing search and filter controls, a date indicator, an interactive team invitation notification bell, and an interactive circular user avatar trigger that opens an account dropdown menu.

#### Scenario: Interacting with top bar controls
- **WHEN** the user focuses or enters text into the search or filter placeholders
- **THEN** the system maintains visible focus indicators and signals preview-only status without mutating task data.

#### Scenario: Interacting with notification bell
- **WHEN** the user clicks the top-bar notification bell
- **THEN** the system toggles an accessible notification menu displaying pending team invitations with Accept and Reject actions.

#### Scenario: Opening and closing the profile dropdown
- **WHEN** the user clicks the circular profile avatar in the top bar
- **THEN** the system toggles an accessible floating glass menu containing user identity, atmosphere theme switchers, settings links, and sign-out actions, and dismisses it when clicking outside or pressing Escape.

#### Scenario: Switching atmosphere theme mode from profile dropdown
- **WHEN** the user selects an atmosphere theme mode (Auto, Light, Evening, or Dark) in the profile dropdown
- **THEN** the system immediately updates the active theme attribute on the document root and persists the mode in storage.

#### Scenario: Signing out from profile dropdown
- **WHEN** the user clicks the Sign Out action within the profile dropdown
- **THEN** the system invokes the session sign-out handler and clears user state.

### Requirement: Home dashboard section limits
The Home dashboard view SHALL constrain visible tasks per section to prevent cognitive overload while providing view-all links and item counts.

#### Scenario: Rendering Home sections with larger fixture counts
- **WHEN** the user views the Home dashboard
- **THEN** the system displays at most 5 tasks in Today, at most 3 tasks in Needs Attention, at most 3 tasks in Upcoming, and at most 3 tasks in Recently Completed, each displaying its total count and a "View all" link.

### Requirement: Recently completed section visibility
The Recently Completed section on the Home dashboard SHALL include only tasks completed within the last 7 relative days of the benchmark date, and SHALL be hidden when empty.

#### Scenario: Empty recently completed tasks
- **WHEN** there are no tasks completed within the last 7 days of the benchmark date
- **THEN** the system omits the Recently Completed section from the Home dashboard.

### Requirement: Task creation concept modal
The workspace shell SHALL provide a centered modal dialog demonstrating the task-creation flow with fields for title, description, due date, due time, and priority.

#### Scenario: Opening and closing task creation modal
- **WHEN** the user clicks the "New Task" button or triggers the shortcut
- **THEN** the system opens an accessible centered modal with visible focus trapped inside, and dismisses it when Escape or Cancel is triggered.

### Requirement: Task detail concept modal
The workspace shell SHALL provide a centered modal dialog displaying comprehensive task information including title, description, deadline, priority, and timestamps.

#### Scenario: Inspecting task details
- **WHEN** the user clicks on a sample task card
- **THEN** the system opens an accessible centered modal displaying the task's full attributes and a non-functional status checkpoint timeline.

### Requirement: Standalone unmapped route fallback
The system SHALL provide a dedicated full-screen fallback view for any unmapped route at the application root, within live workspace subpaths, or within demo preview subpaths.

#### Scenario: Navigating to an unmapped workspace subpath
- **WHEN** the user navigates to an undefined URL beneath `/workspace/` or `/preview/`
- **THEN** the system renders the standalone fallback view without mounting the workspace sidebar or top bar chrome.

#### Scenario: Navigating to an unmapped root path
- **WHEN** the user navigates to an undefined URL at the root of the application
- **THEN** the system renders the standalone fallback view.

### Requirement: Animated task-searching presentation
The standalone fallback view SHALL render an animated vector character searching for missing tasks alongside calm, non-technical recovery messaging.

#### Scenario: Displaying the unmapped route illustration and message
- **WHEN** the standalone fallback view is displayed
- **THEN** the system renders an animated SVG character searching with an empty task clipboard, floating empty task items, and the text "You've wandered off the scheduled horizon" without referencing technical "404" errors.

### Requirement: Authentication-gated fallback navigation
The standalone fallback view SHALL conditionally display workspace recovery actions based on user authentication status.

#### Scenario: Authenticated user visits unmapped path
- **WHEN** an authenticated user or active demo preview session views the standalone fallback view
- **THEN** the system displays a "Back to Workspace" primary button that navigates to the active workspace dashboard, alongside a "Return to Home" button.

#### Scenario: Unauthenticated visitor visits unmapped path
- **WHEN** an unauthenticated visitor views the standalone fallback view
- **THEN** the system hides the "Back to Workspace" button and displays only the "Return to Home" button navigating to the landing page.

### Requirement: Frosted glass workspace chrome and navigation
The workspace shell SHALL render the left navigation sidebar and top utility bar with frosted glass styling (`backdrop-filter: blur(...)`) and semi-transparent backgrounds, displaying the celestial horizon canvas underneath.

#### Scenario: Rendering workspace sidebar with glass styling
- **WHEN** the user views the workspace shell in either live or preview mode
- **THEN** the sidebar displays a frosted glass translucent background with subtle border highlights over the celestial canvas while maintaining legible navigation labels and counts.

#### Scenario: Rendering workspace top bar with glass styling
- **WHEN** the user views the workspace shell
- **THEN** the top utility bar displays a frosted glass translucent surface with search and profile controls clearly scannable.

### Requirement: Frosted glass task cards and interactive feeds
The workspace shell SHALL render task rows, summary dashboard cards, and interactive modals using frosted glass panels with hover illumination and high-contrast typography.

#### Scenario: Hovering over glass task rows
- **WHEN** the user hovers over a task row in the dashboard or task feed
- **THEN** the task row increases in glass surface opacity and displays an elevated translucent border highlight.

#### Scenario: Opening modals in glass mode
- **WHEN** the user opens the task creation, task detail, or settings modal
- **THEN** the modal dialog renders with heavy backdrop blur (`backdrop-blur-xl`) and an opaque-enough glass surface (`rgba(..., 0.88)`) to maintain strict focus and readability.
