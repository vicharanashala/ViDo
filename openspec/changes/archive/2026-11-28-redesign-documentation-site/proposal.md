# Proposal: Redesign the Documentation Site

## Why

The first documentation site (`create-project-wiki`) was a single page whose user and developer tracks were switched with `#/user` and `#/developer` hash routes. In practice the single page was long to scan and deep links depended on JavaScript. The demo widgets also explained an earlier product model, such as fixed dashboard section limits, that no longer matches the workspace. Contributors also lacked step-by-step guidance for the workflow the repository now expects: coordinating in Discussions, planning with OpenSpec, and verifying a coding agent's work before opening a pull request.

## What Changes

- Replace the single hash-routed page with separate static pages that link to each other: a documentation home (`index.html`), a user guide (`user.html`), a developer guide (`developer.html`), and four developer handbook chapters under `docs/developer/`.
- Share one stylesheet (`guide.css`) and one script (`guide.js`) across every page, plus `stack-logos.svg` for the technology stack icons.
- **BREAKING (docs only)**: Remove the `#/user`, `#/developer`, and `#/all` hash routes, the mode switch pill, the animated pathway cards, the light/dark theme toggle, and the three demo widgets (progress simulator, dashboard limiter, directory explorer). Delete `docs/app.js` and `docs/style.css`.
- Add a home page with a sample team task and two guide cards in place of the animated pathway selector.
- Rewrite the user guide around everyday work, planning, shared work, what is available today, and a getting-started walkthrough that names the real UI labels.
- Rewrite the developer guide around design principles, milestones, implementation status, architecture, the technology stack, local setup, and required checks.
- Add the developer handbook chapters: Contributing to ViDo, Working with OpenSpec, Working with coding agents, and Repository structure. Each provides copyable commands and prompts for a coding agent.
- Keep one interactive sample: a weekday planner in the user guide.
- Describe signed-in storage as implemented and specified in `AGENTS.md`: the NestJS backend stores tasks, calendar events, categories, and planning targets through Prisma.

## Out of Scope

- Changes to application or backend code in `src/` and `server/src/`. Only the storage descriptions in the repository guides change.
- Site basics such as per-page meta descriptions, a favicon, social preview tags, a skip link, a `404.html`, dark mode, and search.
- Moving the site to a static site generator or deploying it with GitHub Actions.

These are recorded as follow-up suggestions in `design.md`.

## Capabilities

### Modified Capabilities

- `project-wiki`: The site becomes static pages that link to each other, drops hash routing and the earlier demo widgets, and adds a documentation home, a developer handbook, copyable commands and agent prompts, and a weekday planner sample.

## Impact

- **Files changed**: `docs/index.html`, `docs/user.html`, `docs/developer.html`.
- **Files added**: `docs/guide.css`, `docs/guide.js`, `docs/stack-logos.svg`, `docs/developer/contribution.html`, `docs/developer/openspec.html`, `docs/developer/working-with-agents.html`, `docs/developer/folder-structure.html`.
- **Files removed**: `docs/app.js`, `docs/style.css`.
- **Guides updated for the storage migration**: `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `FOLDER_STRUCTURE.md`, `context.md`, `server/README.md`, `.env.example`.
- **Links**: Old hash links such as `index.html#/developer` load the home page instead of a guide.
- **Dependencies and build**: None. GitHub Pages continues to serve `/docs` from the default branch with `.nojekyll`.
