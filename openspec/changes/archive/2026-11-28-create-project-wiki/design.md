# Design: ViDo Project Documentation Wiki

## Context

ViDo contains rich documentation spanning product philosophy (`context.md`, `concept.html`), engineering contribution rules (`CONTRIBUTING.md`), AI invariants (`AGENTS.md`), and directory rules (`FOLDER_STRUCTURE.md`). Currently, this documentation is consumed as raw markdown inside the repository.

To provide a polished, self-hosted public wiki on GitHub Pages, we introduce a dedicated static web application in `/docs`. See `proposal.md` for problem background and motivation.

## Goals / Non-Goals

**Goals:**
- Provide a zero-dependency, pure vanilla HTML5/CSS3/JS documentation hub in `/docs`.
- Serve immediately from GitHub Pages (`/docs` directory source) with `.nojekyll` bypass.
- Offer a common Orientation Hero that explains the core ViDo philosophy and North Star.
- Display two animated pop-up cards immediately after orientation allowing visitors to select "Explore as a User" or "Explore as a Developer".
- Enforce strict content separation: the User track is a distraction-free product manual; the Developer track provides architecture, GitHub Discussions guidelines, issue/PR rules, mandatory OpenSpec workflows for major changes, and quality gates.
- Implement client-side hash routing (`#/`, `#/user`, `#/developer`, `#/all`) with deep section anchors.
- Embed interactive widgets: Progress & Checkpoint Simulator, Calm Dashboard Limit Preview, and Clickable Codebase Tree.

**Non-Goals:**
- No changes to existing React application code (`src/`) or NestJS backend code (`server/`).
- No build pipelines or node build steps required to compile the documentation.
- No heavy third-party documentation frameworks (e.g. Docusaurus, VitePress) that generate bloated build churn in git.

## Decisions

### Decision 1: Pure Vanilla Web Stack (HTML5 + CSS3 + JS)
- **Choice**: Handcraft `docs/index.html`, `docs/style.css`, and `docs/app.js`.
- **Rationale**: Guarantees zero maintenance overhead, zero version conflicts with the root project dependencies, instant page loading, and clean git history without minified bundle diffs.
- **Alternatives Considered**: 
  - *VitePress/Astro*: Requires an extra compilation step, node modules, and git commits containing compiled distribution bundles.
  - *Docsify*: Requires runtime markdown parsing which can introduce layout shift and rendering delays on mobile.

### Decision 2: Single-Page Dynamic Layout with Hash-Based Routing
- **Choice**: Render both User and Developer content structures in a single semantic document, using client-side JavaScript to toggle track visibility and manage active sidebar navigation based on `window.location.hash`.
- **Rationale**: Allows smooth, instant transitions without page flashes, preserves scroll context, and enables direct deep links (e.g., `#/developer/pull-requests`, `#/user/dashboard`).
- **Alternatives Considered**:
  - *Separate HTML pages (`user.html`, `developer.html`)*: Breaks smooth topbar switching and duplicates shared navigation and header elements.

### Decision 3: CSS Token Architecture & Dark/Light Mode
- **Choice**: Implement modern CSS custom properties (`--bg`, `--surface`, `--ink`, `--accent`, `--line`, `--muted`) with automatic light/dark mode support and manual toggle.
- **Rationale**: Matches high-contrast developer tool aesthetics while remaining accessible (WCAG AA).

### Decision 4: Interactive Demonstration Widgets
- **Choice**: Embed three lightweight vanilla JS widgets:
  1. *Progress & Checkpoint Simulator*: An interactive slider from 0% to 100% that dynamically renders timestamped checkpoint updates and audits on-time vs. late status.
  2. *Calm Dashboard Limiter*: A togglable view showing how ViDo caps tasks at 5 Today and 3 Upcoming/Attention compared to overwhelming uncurated lists.
  3. *Architecture Tree Explorer*: An interactive clickable directory browser visually demonstrating `FOLDER_STRUCTURE.md` rules.

## Risks / Trade-offs

- **[Risk] GitHub Pages Jekyll parsing conflicts** → **Mitigation**: Add an empty `docs/.nojekyll` file so GitHub serves raw assets without Jekyll preprocessing.
- **[Risk] Broken relative asset paths on custom domain vs. GitHub subpath (`https://<user>.github.io/<repo>/`)** → **Mitigation**: Use strictly relative URLs (`./style.css`, `./app.js`) and hash-based navigation (`#/route`) rather than absolute pathing.
- **[Risk] Mobile viewport layout overflow** → **Mitigation**: Responsive CSS with media queries collapsing the 3-column layout into a single column with an off-canvas mobile drawer.
