# Proposal: ViDo Project Documentation Wiki

## Why

ViDo currently has comprehensive product, architectural, and design knowledge distributed across multiple files (`context.md`, `concept.html`, `FOLDER_STRUCTURE.md`, `CONTRIBUTING.md`, `Idea.md`, and `MILESTONES.md`). However, there is no centralized, visually cohesive public wiki hosted for the repository.

Visitors, evaluators, and contributors need a structured, accessible knowledge portal hosted on GitHub Pages (`/docs`). Different audiences arrive with different goals: end-users want to understand workflows, philosophy, and features without being overwhelmed by technical specs; developers and contributors require strict architectural boundaries, GitHub Discussion etiquette, PR standards, and local emulator setup. A dual-track documentation wiki solves this by offering an initial common orientation followed by targeted user and developer journeys.

## What Changes

- **GitHub Pages Infrastructure**:
  - Create the `/docs` directory at the repository root containing `index.html`, `style.css`, `app.js`, and `.nojekyll`.
  - Ensure zero external runtime build dependencies—pure modern HTML5, CSS3, and vanilla JavaScript.
- **Interactive Orientation & Pathway Fork**:
  - Render an introductory Hero section explaining ViDo's mission, the problem with binary checkboxes, and the North Star principle ("Simple enough for anyone. Structured enough for serious work.").
  - Immediately following the intro, present two animated pop-up cards prompting the visitor to select their journey:
    - **👤 Explore as a User**: Product & Experience.
    - **💻 Explore as a Developer**: Codebase & Open Source Contribution.
- **Strict Content Separation**:
  - **User Track**: Focuses strictly on real-world life contexts (Personal, Home, Work), calm dashboard limits (5 Today, 3 Attention, 3 Upcoming, 3 Delivered), 0–100% incremental progress, timestamped checkpoints, team workspaces with milestones, notification alerts, and links to the live interactive demo (`/preview`) and theme lab (`/style-lab`). All contribution, PR, and backend architecture details are omitted.
  - **Developer Track**: Focuses on GitHub Discussions forum rules (mandatory for UI changes), bug reporting standards, Pull Request (PR) workflow and branch rules, mandatory verification gates (`npm run typecheck`, `npm test`, `npm run build:server && npm run build`), full-stack architecture (React 19 + NestJS 11 + Prisma ORM + SSE), `FOLDER_STRUCTURE.md` invariants, Firebase Auth Emulator setup (port 9099), and the mandatory OpenSpec workflow (`openspec propose` -> `specs` -> `design` -> `tasks` -> `openspec apply`) for any major feature or update to keep progress strictly on track.
- **Navigation & Routing**:
  - Client-side hash routing (`#/`, `#/user`, `#/developer`, `#/all`) supporting direct link sharing and section deep links.
  - Persistent top-bar track switcher pill (`[ 👤 User View | 💻 Developer View ]`) allowing seamless mode switching without page reloads.
  - Responsive 3-column layout with sticky navigation sidebar and "On This Page" table of contents.
- **Interactive Demonstrations**:
  - Interactive Progress & Checkpoint Simulator (0–100% slider demonstrating chronological audit logs).
  - Calm Dashboard Limit Simulator (visualizing how backlog capping eliminates cognitive overload).
  - Interactive Codebase Architecture Tree (clickable visual directory explorer for `FOLDER_STRUCTURE.md`).

## Capabilities

### New Capabilities

- `project-wiki`: Manages the public project wiki hosted on GitHub Pages (`/docs`), including the dual-track user/developer pathways, animated entrance selector, strict content separation, client-side hash routing, and interactive demonstration widgets.

### Modified Capabilities

None. Existing runtime features (`landing-page`, `workspace-shell`, `team-workspaces`, `nestjs-backend`) are unaffected.

## Impact

- **Files Created**: `docs/index.html`, `docs/style.css`, `docs/app.js`, `docs/.nojekyll`.
- **Dependencies**: 0 new npm packages; relies exclusively on standard web APIs and CSS custom properties.
- **Build & CI**: Compatible with GitHub Pages serving from `/docs` on the default branch; does not alter existing frontend or server build pipelines.
