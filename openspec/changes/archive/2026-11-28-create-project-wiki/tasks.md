# Tasks: ViDo Project Documentation Wiki

## 1. Directory Scaffolding & Design Foundation

- [x] 1.1 Create `/docs` directory and `.nojekyll` marker file, and verify directory presence at repository root
- [x] 1.2 Define design tokens, dark/light theme variables, responsive 3-column layout, and animation keyframes in `docs/style.css`, and verify CSS syntax and token definitions

## 2. Shared Header, Orientation Hero & Animated Pathway Cards

- [x] 2.1 Implement persistent navigation header in `docs/index.html` with ViDo brand mark, GitHub repository link, theme toggle, and mode switcher pill
- [x] 2.2 Construct the Common Orientation Hero introducing ViDo philosophy, binary checkbox critique, North Star principle, and the 5 instant workspace questions
- [x] 2.3 Implement the two animated pathway pop-up cards with CSS entrance effects allowing visitors to select "Explore as a User" or "Explore as a Developer"

## 3. User Pathway Experience

- [x] 3.1 Author the User Guide sections covering real-world life contexts (Personal, Household, Professional, Teams) in `docs/index.html`
- [x] 3.2 Implement the Calm Dashboard guide explaining why section limits (5 Today, 3 Attention, 3 Upcoming, 3 Delivered) eliminate burnout and guilt
- [x] 3.3 Author the Task Lifecycle & Checkpoints guide covering modal creation, 0–100% progress, chronological audit notes, and reversible archive vs permanent deletion
- [x] 3.4 Author the Team Workspaces & Milestones guide detailing phased delivery goals, assignee ownership, and in-app bell (`🔔`) notification workflows
- [x] 3.5 Add direct action links inviting users to test the live product preview (`/preview`) and theme lab (`/style-lab`)

## 4. Developer Pathway & Contribution Manual

- [x] 4.1 Author the GitHub Discussions & Community Forum guide specifying mandatory discussion alignment for all UI redesigns and new features
- [x] 4.2 Author the Issue Reporting and Pull Request (PR) rules covering branch naming (`feature/*`, `fix/*`), conventional commits, PR checklist, and visual proof requirements (screenshots/screen recordings)
- [x] 4.3 Author the Full-Stack Architecture guide covering React 19, NestJS 11, Prisma 6, SSE real-time sync, and strict `FOLDER_STRUCTURE.md` invariants
- [x] 4.4 Author the Testing & Quality Verification guide covering Firebase Auth Emulator on port 9099 and mandatory verification commands (`typecheck`, `test`, `build`)
- [x] 4.5 Author the OpenSpec Contribution Workflow guide detailing mandatory spec-driven planning (propose, specs, design, tasks) for all major features and updates to keep development on track

## 5. Client-Side Routing, State & Interactive Widgets

- [x] 5.1 Implement the client-side hash router in `docs/app.js` supporting `#/user`, `#/developer`, `#/all`, deep section anchors, and dynamic sidebar updates
- [x] 5.2 Implement the interactive Progress & Checkpoint Simulator widget (0–100% slider generating live chronological audit notes)
- [x] 5.3 Implement the Calm Dashboard Limit interactive preview widget (toggling full backlog vs calm capped sections)
- [x] 5.4 Implement the interactive Codebase Directory Tree Explorer widget visually demonstrating `FOLDER_STRUCTURE.md` boundaries

## 6. Verification & Validation

- [x] 6.1 Verify strict content separation: confirm all PR rules, discussions guidelines, and architecture are hidden when viewing as a User
- [x] 6.2 Verify Developer view displays all contribution standards, discussions forum requirements, PR guidelines, and verification commands
- [x] 6.3 Run full repository test and build suite (`npm run typecheck`, `npm test`, `npm run build:server && npm run build`) to ensure zero regressions
