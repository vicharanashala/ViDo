# Design: Redesign the Documentation Site

## Context

GitHub Pages serves `docs/` from the default branch with no build step. The first site placed every section in one document and used `app.js` to show or hide tracks by URL hash. See `proposal.md` for the motivation.

## Goals / Non-Goals

**Goals:**
- Give each audience its own page, with stable URLs and section anchors that work without JavaScript.
- Keep the site dependency-free: hand-written HTML, one shared stylesheet, one small script.
- Give contributors a handbook that covers coordination, OpenSpec, coding agents, and file placement.
- Keep product claims honest by separating what is available today from what is planned.

**Non-Goals:**
- Changing application or backend code. Repository guides change only to describe the storage migration (Decision 5).
- Introducing a documentation framework or a build pipeline (see Follow-up suggestions).

## Decisions

### Decision 1: Separate static pages instead of hash routing
- **Choice**: `index.html`, `user.html`, `developer.html`, and `developer/*.html`, linked through a shared masthead.
- **Rationale**: Each page loads only its own content and works with JavaScript disabled. Section anchors (`developer.html#setup`) are ordinary fragment links that search engines and readers can share.
- **Trade-off**: The masthead, navigation, and footer are repeated in each page and must be kept in sync by hand.

### Decision 2: One stylesheet and one script
- **Choice**: `guide.css` holds all styles. `guide.js` runs the weekday planner, copies the setup prompt, and adds copy buttons to command and prompt blocks in handbook chapters.
- **Rationale**: Every page shares a single cached stylesheet and script, and a page without the planner or prompts does not break when the script runs.

### Decision 3: Native disclosure for navigation and detail
- **Choice**: Use `<details>`/`<summary>` for the page outline, milestones, troubleshooting, and the manual contribution steps.
- **Rationale**: Keyboard and screen reader support come from the browser with no script.

### Decision 4: Prompts alongside manual steps
- **Choice**: Each handbook chapter ends with a prompt for a coding agent. The contribution chapter leads with a setup prompt and keeps the manual steps in a collapsed section.
- **Rationale**: Contributors increasingly work through coding agents. The prompts ask the agent for evidence such as the diff, check results, and scenarios to review, instead of asking it to finish the task unchecked.

### Decision 5: Describe the NestJS storage migration
- **Choice**: The developer guide describes signed-in tasks, calendar events, categories, and planning targets stored by the NestJS backend under `/api/user/*` through Prisma, scoped to the signed-in user. `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `FOLDER_STRUCTURE.md`, `context.md`, `server/README.md`, and `.env.example` are updated in the same change to match.
- **Rationale**: The maintainers confirmed that user data storage has moved from Firestore to the NestJS backend. The repository guides still described Firestore, so the site and the guides would otherwise contradict the code and each other.

## Risks / Trade-offs

- **[Risk] Old hash links stop selecting a track** → **Mitigation**: They still load the home page, which links to both guides.
- **[Risk] Docs drift from `README.md`, `CONTRIBUTING.md`, and `AGENTS.md`** → **Mitigation**: Link to the source file next to each rule restated on the site.
- **[Risk] Local-only links** → The user guide links to `http://localhost:5173/preview` because there is no hosted preview. Readers on GitHub Pages must run the app locally first.

## Follow-up Suggestions

These are outside this change and should be proposed separately:

1. **Site basics**: per-page meta descriptions, a favicon, Open Graph tags, a skip-to-content link, a `404.html`, consistent heading levels, a dark color scheme, and `sitemap.xml`.
2. **Docs as code**: move the pages to Markdown built with VitePress, which shares the project's Vite toolchain. This adds generated navigation, search, dark mode, "edit this page" links, and last-updated dates.
3. **Automation**: build and deploy the site with a GitHub Actions workflow to GitHub Pages, and check links in CI.
