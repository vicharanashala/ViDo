# Spec Delta

## Purpose

Provides a dynamic celestial theme engine featuring time-based daylight and nightfall transitions, an atmospheric horizon canvas, and universal glassmorphic design tokens across ViDo.

## ADDED Requirements

### Requirement: Celestial horizon sky canvas
The system SHALL render an atmospheric horizon sky background canvas across the application canvas. In light mode, the canvas SHALL display a daytime sky gradient featuring a warm golden horizon glow. In dark mode, the canvas SHALL display a midnight sky gradient featuring a luminous cool twilight horizon glow.

#### Scenario: Rendering light mode celestial horizon
- **WHEN** the application is active in light mode
- **THEN** the system renders the daytime cerulean-to-dawn horizon gradient background canvas behind all glass elements.

#### Scenario: Rendering dark mode celestial horizon
- **WHEN** the application is active in dark mode
- **THEN** the system renders the deep midnight-to-twilight horizon gradient background canvas behind all glass elements.

### Requirement: Time of day automatic theme switching
The system SHALL calculate the active theme mode automatically based on the user's local clock time when theme preference is set to auto. Local hours between 06:00 and 17:59 inclusive SHALL activate light mode (Sun). Local hours between 18:00 and 05:59 inclusive SHALL activate dark mode (Moon).

#### Scenario: Automatic daytime activation
- **WHEN** the theme mode is set to auto and local time is between 06:00 and 17:59
- **THEN** the system sets `data-theme="light"` on the document root and displays the Sun horizon canvas.

#### Scenario: Automatic nighttime activation
- **WHEN** the theme mode is set to auto and local time is between 18:00 and 05:59
- **THEN** the system sets `data-theme="dark"` on the document root and displays the Moon horizon canvas.

#### Scenario: Live minute interval check
- **WHEN** the application remains open across a day-night boundary in auto mode
- **THEN** the system transitions the active theme smoothly without requiring a page reload.

### Requirement: Theme mode override and persistence
The system SHALL provide user controls to override automatic switching with explicit 'light' or 'dark' selections, and SHALL persist the selection in local storage (`vido_theme_mode`).

#### Scenario: Overriding auto theme with explicit selection
- **WHEN** the user selects "Always Dark (Moon)" or "Always Light (Sun)" in settings
- **THEN** the system overrides the clock calculation, applies the chosen theme mode immediately, and saves the preference to local storage.

#### Scenario: Re-enabling automatic clock theme
- **WHEN** the user switches the theme selector back to "Auto (Celestial Clock)"
- **THEN** the system restores time-based evaluation based on current local clock time.

### Requirement: Glassmorphic surface design tokens
The system SHALL provide frosted glass CSS tokens for surfaces, borders, and shadows that adjust dynamically across light and dark themes while maintaining text contrast and accessibility.

#### Scenario: Applying light mode glass tokens
- **WHEN** light mode is active
- **THEN** glass surfaces utilize high-translucency white surfaces (`rgba(255, 255, 255, 0.72)` to `0.88`), translucent borders (`rgba(227, 229, 233, 0.45)`), and dark text tokens (`--ink`).

#### Scenario: Applying dark mode glass tokens
- **WHEN** dark mode is active
- **THEN** glass surfaces utilize dark slate translucent surfaces (`rgba(28, 32, 40, 0.72)` to `0.88`), translucent borders (`rgba(255, 255, 255, 0.12)`), and light text tokens (`--ink: #f1f3f7`).
