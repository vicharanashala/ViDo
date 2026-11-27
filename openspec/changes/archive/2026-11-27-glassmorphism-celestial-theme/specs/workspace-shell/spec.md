# Spec Delta

## ADDED Requirements

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
