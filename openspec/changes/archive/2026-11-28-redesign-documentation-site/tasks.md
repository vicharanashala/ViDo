# Tasks: Redesign the Documentation Site

## 1. Page Structure

- [x] 1.1 Replace the single-page layout with `index.html`, `user.html`, and `developer.html`, sharing one masthead, footer, and `guide.css`. Verify each page loads with relative paths from `docs/`.
- [x] 1.2 Add the developer handbook chapters under `docs/developer/` with a shared chapter outline. Verify each chapter marks itself as the current page.
- [x] 1.3 Delete `docs/app.js` and `docs/style.css`. Verify no page references either file.

## 2. Content

- [x] 2.1 Write the home page with a sample team task and links to both guides.
- [x] 2.2 Write the user guide: everyday work, planning, shared work, availability, and getting started. Verify each named UI label exists in `src/`.
- [x] 2.3 Write the developer guide: principles, milestones, status, architecture, stack, local setup, and required checks. Verify each npm script and file path exists.
- [x] 2.4 Describe signed-in storage through the NestJS `/api/user/*` endpoints, matching `AGENTS.md` and the code in `src/lib/` and `server/src/`.
- [x] 2.5 Update `AGENTS.md`, `README.md`, `CONTRIBUTING.md`, `FOLDER_STRUCTURE.md`, `context.md`, `server/README.md`, and `.env.example` to describe NestJS storage for signed-in user data.
- [x] 2.6 Point feature proposals to the Ideas Discussions category and UI redesigns to General, matching the categories that exist upstream.
- [x] 2.7 Update the OpenSpec chapter to inspect the `project-wiki` spec instead of an active change.

## 3. Interaction

- [x] 3.1 Implement the weekday planner in `guide.js` with `aria-pressed` buttons and a polite live region.
- [x] 3.2 Add copy buttons with status messages to command and prompt blocks in handbook chapters, and a fallback that selects the setup prompt when the clipboard is unavailable.

## 4. Verification

- [x] 4.1 Check every internal link and section anchor across all seven pages.
- [x] 4.2 Check the pages at 375px width for horizontal overflow.
- [x] 4.3 Run `npm run typecheck`, `npm test`, and `npm run build` to confirm no regressions.
