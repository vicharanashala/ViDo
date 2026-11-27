# Spec Delta

## MODIFIED Requirements

### Requirement: Top bar controls and user placeholder
The workspace shell SHALL render a persistent, uniform top utility bar across all workspace views containing search with keyboard shortcuts, a live synchronized date badge, an interactive team invitation notification bell, and user identity profile controls without per-route title/subtitle duplication.

#### Scenario: Interacting with top bar controls
- **WHEN** the user focuses or enters text into the search or filter placeholders
- **THEN** the system maintains visible focus indicators and signals preview-only status without mutating task data.

#### Scenario: Interacting with notification bell
- **WHEN** the user clicks the top-bar notification bell
- **THEN** the system toggles an accessible notification menu displaying pending team invitations with Accept and Reject actions.

#### Scenario: Navigating across workspace views
- **WHEN** the user navigates between workspace subroutes (/tasks, /today, /upcoming, /calendar, /analytics)
- **THEN** the top utility bar maintains a consistent, steady layout and does not render redundant or fluctuating view titles.
