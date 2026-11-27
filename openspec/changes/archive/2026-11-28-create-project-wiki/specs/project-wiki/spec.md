# Spec Delta: project-wiki

## Purpose

Provides a standalone, dual-track public documentation wiki hosted on GitHub Pages (`/docs`), guiding visitors through ViDo product concepts or engineering contribution rules with interactive widgets and client-side routing.

## ADDED Requirements

### Requirement: Public GitHub Pages Hosting Structure
The system SHALL provide a static site in `/docs` containing `index.html`, `style.css`, `app.js`, and `.nojekyll` capable of serving directly on GitHub Pages without any compilation or build step.

#### Scenario: Static file delivery on GitHub Pages
- **WHEN** a visitor loads the `/docs/` entrypoint on GitHub Pages
- **THEN** the browser delivers `index.html` alongside `style.css` and `app.js` with `.nojekyll` preventing Jekyll processing.

### Requirement: Common Orientation Hero
The documentation site SHALL render an introductory hero section introducing the ViDo philosophy, the problem with binary checkbox task tools, and the North Star principle.

#### Scenario: Initial orientation presentation
- **WHEN** a visitor navigates to the documentation home
- **THEN** the site displays the ViDo mission, the contrast between binary checkboxes and measurable progress, and the five core workspace questions.

### Requirement: Animated Pathway Selection
The documentation site SHALL present two animated pop-up cards immediately after the orientation hero allowing visitors to choose between User and Developer exploration pathways.

#### Scenario: Selecting an exploration pathway
- **WHEN** the visitor views the pathway selector section
- **THEN** two animated cards appear with entrance effects for "Explore as a User" and "Explore as a Developer", updating the view and URL hash upon selection.

### Requirement: User Track Content Scoping
When the User pathway is active, the site SHALL display product workflows, calm dashboard limits, task lifecycles, and team coordination while strictly omitting developer contribution and PR rules.

#### Scenario: Viewing documentation as a user
- **WHEN** the visitor activates the User track
- **THEN** the site displays everyday life contexts, calm 5/3/3/3 section limits, progress tracking, checkpoints, and live preview links, while hiding GitHub Discussions, PR guidelines, and backend architecture.

### Requirement: Developer Track Content Scoping
When the Developer pathway is active, the site SHALL display full-stack architecture, folder boundaries, GitHub Discussions rules, PR workflow standards, emulator setup, and verification commands.

#### Scenario: Viewing documentation as a developer
- **WHEN** the visitor activates the Developer track
- **THEN** the site displays technical architecture, `FOLDER_STRUCTURE.md` invariants, mandatory GitHub Discussions rules for UI changes, PR checklists, emulator setup, and verification commands.

### Requirement: Mandatory OpenSpec Workflow for Major Changes
The Developer track SHALL explicitly mandate that any major feature, architectural change, or substantial capability update MUST use OpenSpec before writing code, keeping development structured and on track.

#### Scenario: OpenSpec workflow instructions for contributors
- **WHEN** a contributor consults the Developer track for building a significant feature or architectural update
- **THEN** the documentation directs them to initiate an OpenSpec change (`openspec propose`), complete planning artifacts, and review before writing code.

### Requirement: Client-Side Hash Routing and Mode Switching
The site SHALL support client-side hash routes (`#/`, `#/user`, `#/developer`, `#/all`) and a persistent top-navigation mode toggle pill to switch tracks without full page reloads.

#### Scenario: Hash navigation and track toggling
- **WHEN** the visitor clicks the mode toggle pill or navigates directly to `#/developer`
- **THEN** the view updates to the selected track, updates the active sidebar links, and synchronizes the browser address bar hash.

### Requirement: Embedded Interactive Widgets
The site SHALL embed interactive demonstration widgets for a progress and checkpoint simulator, a calm dashboard limiter, and a clickable repository directory explorer.

#### Scenario: Progress slider simulation
- **WHEN** the visitor drags the progress simulator slider in the documentation
- **THEN** the widget dynamically updates the task percentage and appends corresponding sample checkpoint audit log entries.
