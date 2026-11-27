# project-wiki Specification

## Purpose

Provides the public documentation site hosted on GitHub Pages from `/docs`: separate static pages for a documentation home, a user guide, a developer guide, and a developer handbook, sharing one stylesheet and one script with no build step.

## Requirements

### Requirement: Public GitHub Pages Hosting Structure
The system SHALL provide a static site in `/docs` made of separate HTML pages (`index.html`, `user.html`, `developer.html`, and handbook chapters under `developer/`) that share `guide.css`, `guide.js`, and `stack-logos.svg`, with `.nojekyll`, serving directly on GitHub Pages without any compilation or build step. Pages SHALL reference assets and each other with relative URLs.

#### Scenario: Static file delivery on GitHub Pages
- **WHEN** a visitor loads any documentation page on GitHub Pages
- **THEN** the browser receives that page with `guide.css` and `guide.js` from relative paths, and `.nojekyll` prevents Jekyll processing.

#### Scenario: Reading without JavaScript
- **WHEN** a visitor opens a guide with JavaScript disabled
- **THEN** all guide content, navigation, and section anchors remain available.

### Requirement: User Track Content Scoping
The user guide (`user.html`) SHALL explain everyday task work, planning, shared work, what is available today versus in development, and how to get started, while omitting contribution rules, pull request guidance, and backend architecture.

#### Scenario: Viewing the user guide
- **WHEN** a visitor opens the user guide
- **THEN** the page covers creating and completing tasks, the calendar and analytics, team spaces, current availability, and a getting-started walkthrough that uses the product's UI labels, without contribution or pull request instructions.

### Requirement: Developer Track Content Scoping
The developer guide (`developer.html`) SHALL present design principles, implementation milestones and status, workspace architecture, the technology stack, local setup, and the required verification commands, and SHALL link to the developer handbook.

#### Scenario: Viewing the developer guide
- **WHEN** a visitor opens the developer guide
- **THEN** the page displays the architecture from route to storage, local setup for the frontend, emulators, and backend API, the `typecheck`, `test`, and `build` commands, and links to each handbook chapter.

### Requirement: Mandatory OpenSpec Workflow for Major Changes
The developer handbook SHALL include a chapter stating that any major feature, architectural change, or substantial capability update uses OpenSpec before writing code, and SHALL walk through a change from proposal to archive.

#### Scenario: OpenSpec workflow instructions for contributors
- **WHEN** a contributor opens the OpenSpec chapter
- **THEN** the chapter explains how to propose a change, review its scenarios, apply and verify its tasks, and archive it, with CLI commands and an archived change from this repository as an example.

### Requirement: Documentation Home
The documentation home (`index.html`) SHALL introduce ViDo with a sample team task, link to the user guide and developer guide, and describe the product direction for intelligent scheduling as in development.

#### Scenario: Choosing a guide from the home page
- **WHEN** a visitor opens the documentation home
- **THEN** the page shows a sample task with its owner, due date, progress, and latest checkpoint, and links to both guides.

### Requirement: Shared Page Navigation
Every documentation page SHALL include the same masthead linking to the home page, the user guide, and the developer guide, marking the current section with `aria-current`. Guide pages SHALL provide an outline of their sections built with `<details>` and `<summary>`.

#### Scenario: Moving between guides
- **WHEN** a visitor is on any documentation page
- **THEN** the masthead links to all three top-level pages and identifies the current one.

### Requirement: Developer Handbook Chapters
The site SHALL provide handbook chapters for contributing to ViDo, working with OpenSpec, working with coding agents, and the repository structure, each linked from the developer guide and from every other chapter.

#### Scenario: Following the contribution chapter
- **WHEN** a contributor opens the contribution chapter
- **THEN** it explains coordinating in issues and GitHub Discussions, forking and branching, developing and verifying, and opening a pull request against `vicharanashala/ViDo:main`.

### Requirement: Copyable Commands and Agent Prompts
Handbook chapters SHALL provide prompts for coding agents, and command and prompt blocks SHALL offer a copy button that announces whether copying succeeded.

#### Scenario: Copying a prompt
- **WHEN** a contributor selects the copy button for a prompt or command block
- **THEN** the text is copied to the clipboard and a status message confirms it, or tells the contributor to select the text manually if the clipboard is unavailable.

### Requirement: Weekday Planner Sample
The user guide SHALL include a weekday planner sample in which selecting a day shows that day's summary and sample schedule.

#### Scenario: Selecting a day
- **WHEN** a visitor selects a weekday button in the planner sample
- **THEN** that button is marked pressed, the others are not, and the day's title, summary, and sample tasks update in a polite live region.

### Requirement: Repository-Aligned Guidance
Rules restated on the site SHALL match the repository's guides and link to them, including storage rules from `AGENTS.md` and the verification commands.

#### Scenario: Reading the storage rules
- **WHEN** a contributor reads the developer guide's architecture section
- **THEN** it describes signed-in tasks, calendar events, categories, and planning targets stored by the NestJS backend under `/api/user/*` through Prisma and scoped to the signed-in user, with preview planning in browser storage, and links to `AGENTS.md`.
