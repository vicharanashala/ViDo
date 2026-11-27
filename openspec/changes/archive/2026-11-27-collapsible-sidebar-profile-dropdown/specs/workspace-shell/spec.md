# Spec Delta

## MODIFIED Requirements

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
