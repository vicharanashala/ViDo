# ViDo — Idea Register

Every idea discussed, whether implemented or not. Use this before proposing new work.

Status labels: `Implemented`, `In progress`, `Planned`, `Exploring`, `Deferred`, `Rejected`.

---

## Implemented

| ID | Idea | Notes |
|---|---|---|
| I-001 | Local-first ViDo app | React 19 + Vite + TypeScript + Tailwind v4. No backend required. |
| I-002 | Real task lifecycle | Create, edit, complete, reopen, archive, restore, delete. |
| I-003 | One-field quick capture | Type and press Enter; defaults to today, medium priority, personal. |
| I-004 | Natural-language capture | Parses today/tomorrow/next week, times, `!high`/`!medium`/`!low`, `#work`/`#home`/`#personal`; shows preview chips. |
| I-005 | Progress 0–100 | Task carries `progress`; 100 completes; reopening caps at 99. |
| I-006 | Checkpoint history | Timestamped note + progress snapshot per update. |
| I-007 | Pace vs deadline | Expected progress from elapsed time vs actual progress; Ahead / On track / At risk / Behind / Delivered. |
| I-008 | Real-date views | Today, Later, Still here, Done, Put away derived from the current clock. |
| I-009 | Home shape | Greeting, one focus task, seven-day momentum, and a five-row today list. |
| I-010 | Search and filters | Keyword, priority, deadline; filters appear on demand. |
| I-011 | Focus mode | Full-screen one-task view; progress ring; checkpoint input; complete/reopen; Esc closes. |
| I-012 | Delivered state | Completion preserves checkpoint history and shows delivered state. |
| I-013 | Today ordered queue | Overdue first, then due today. Overdue: high → medium → low, then earliest deadline. Due today: time first, priority breaks ties. |
| I-014 | Priority feedback | One summary line; high-priority marker only; completion copy names priority only for high. |
| I-015 | Start next | Opens the first queued task in Focus mode. |
| I-016 | Three-signal task row | Title, due cue, progress cue. High priority gets one subtle dot. |
| I-017 | Hover/focus Focus action | Reveals a Focus button on row hover/focus. |
| I-018 | Keyboard actions | `Enter` open, `Space` complete, `F` focus, `Esc` close. |
| I-019 | Progress chips | Focus mode: 25 / 50 / 75 / Done update directly. |
| I-020 | Shared ProgressRing | Reusable ring primitive in `src/components/ui`. |
| I-021 | 7-day momentum strip | Visual completion history for the last seven days. |
| I-022 | Calm colour psychology | Sage canvas, warm white, muted clay action, green progress, amber attention, muted clay-red overdue, forest ink. |
| I-023 | Slim icon rail | Replaces the text sidebar; reduces scanning and feels app-like. |
| I-024 | Mobile bottom nav + FAB | App-like mobile navigation and floating add action. |
| I-025 | Bold sans workspace headings | Removes the editorial/course-page feel inside the app. |
| I-026 | Calm completion motion | Check-pop animation; respects `prefers-reduced-motion`. |
| I-027 | Local persistence | `localStorage` key `vido.tasks.v1`; delete-all stays empty; seed restores only when storage is cleared. |
| I-028 | Relative seed data | Demo workspace dates are generated relative to today. |
| I-029 | Empty-state handling | Calm empty states for views and queues. |
| I-030 | Tests for core logic | Filters, queue ordering, pace, repository, parser, components, layout. 53 tests at last run. |
| I-031 | Issue naming convention | `feat:` for features; `Issue:` for general work. Added to `AGENTS.md`. |
| I-032 | Journal folder | `journal/` with conversation log, idea register, and guide. |
| I-033 | Image + title task labels | Recognised tasks show an open-source image next to the task title, so the image is never the only meaning. |
| I-034 | Task image catalog | 36 task image kinds in `taskImageCatalog.ts`, grouped by sport, learning, home, health, work, and life. Different sports have their own Twemoji image; reading uses an open book; writing composes paper + pencil; work/study tasks fall back to the desk image. Laundry and dishes share a basket composition. Unrecognised tasks fall back to text. Sources: Twemoji (CC-BY 4.0), rawpixel/Openverse (CC0), Wikimedia Commons (CC0), Tabler (MIT). |
| I-035 | Cartoon-sticker doodles | Early image experiment; replaced by open-source images. |
| I-036 | Personal welcome card | Optional name, saved on this device, or skip. |
| I-037 | Daily intention | One optional line per day, explicitly not a task. |
| I-038 | Gentler navigation | `Still here`, `Later`, `Done`, `Put away`; no numeric counts in the sidebar. |
| I-039 | Smaller task titles | Task titles reduced to 10px in rows and smaller in focus/detail views. |
| I-043 | “That's enough for today” rest state | Collapses the Today list into a calm rest state with an undo. |
| I-044 | Small-win focus selection | Prefers a task already in progress on today’s list. |
| I-045 | Calm carried-over language and colours | `Carried over`, amber cues, no red progress bars, no pressure counts. |
| I-046 | Partial progress check-in | “Worked on it — a little further” adds 25% and writes a checkpoint. |
| I-041 | Specific HVAC, hose, and laundry images | Heat pump photo for HVAC; rubber washer/O-ring photo for hose repair; laundromat photo for high-priority laundry. |

---

## Reverted

| ID | Idea | Reason |
|---|---|---|
| I-040 | Priority-based image styles | Changing image style by priority made tasks harder to read. The workspace now uses one style. |
| I-042 | Priority image legend | Removed with the priority-style experiment. The workspace uses image + title instead. |

---

## In progress

None at the moment.

---

## Planned

| ID | Idea | Notes |
|---|---|---|
| I-080 | Supabase auth | Google sign-in, session restore, protected routes. |
| I-081 | Supabase Postgres + RLS | Private task storage with row-level ownership; verify with two accounts. |
| I-082 | Cross-device sync | Requires Supabase or another backend. |
| I-083 | Shared workspaces | Teams, invitations, assignment, membership management. |
| I-084 | Comments / threaded replies | On task checkpoints. |
| I-085 | Reminders | One calm reminder per task at a chosen lead time. |
| I-086 | Recurring tasks | Daily/weekly routines; must not create clutter. |
| I-087 | Tags / custom lists | Deferred until canonical types or grouping prove insufficient. |
| I-088 | Drag-and-drop ordering | Manual queue order; conflicts with computed priority ordering, so needs a model. |
| I-089 | Command palette | `Cmd/Ctrl+K` for create, search, views, focus. Only if it reduces steps. |
| I-090 | Focus session timer | Optional count-up session in Focus mode; no pressure countdown. |
| I-091 | Daily reflection | One-line “What moved today?” at end of day. |
| I-092 | Landing page redesign | Align the marketing page with the app’s doodle/colour-psychology direction. |
| I-093 | Dark mode | Optional low-light theme; not required for the current direction. |
| I-094 | Data export | CSV/JSON backup. |
| I-095 | PWA / offline | Installable, offline-first. |
| I-096 | CI | Typecheck, tests, build on push. |
| I-097 | Accessibility audit | Keyboard paths, contrast, screen-reader labels. |
| I-098 | Focus blocks with pause/resume | Time-block model; split current task, insert new task, resume with checkpoints. Explore first. |
| I-099 | AI agent | Task generation, follow-up suggestions, risk detection, summaries. Grounded in user-approved data. |

---

## Exploring

| ID | Idea | Notes |
|---|---|---|
| I-055 | Opt-in non-overlap scheduling | Do not enforce overlap rules. Offer Split / Move / Keep. Never auto-apply. |
| I-056 | Doodle/plain-text toggle | Some users may prefer text; consider a profile or view setting. |
| I-057 | Focus “studio” visuals | Ambient visuals, session timer, or a physical-planner metaphor. |
| I-058 | Momentum garden | A visual metaphor for completed work; must avoid gamification pressure. |

---

## Deferred

| ID | Idea | Notes |
|---|---|---|
| I-059 | Tags | Canonical categories may be enough. |
| I-060 | Attachments | Needs storage and retention policy. |
| I-061 | Calendar view | Useful later; risk of calendar creep. |
| I-062 | Monthly reports | Samagra already covers this; not core to ViDo. |
| I-063 | Team load view | Borrowed from HMS review; later. |

---

## Rejected

| ID | Idea | Reason |
|---|---|---|
| I-064 | Hard non-overlap constraint | Too controlling; creates thrashing and false precision. Use opt-in split/resume instead. |
| I-065 | Points, streaks, leaderboards | Contradicts the calm, non-guilt philosophy. |
| I-066 | Confetti-heavy celebrations | Too intense; a subtle check is enough. |
| I-067 | Guilt-driven copy | “Overdue” is a fact, not a scolding. |
| I-068 | Wall of red overdue tasks | Overwhelms; use muted clay-red and one summary line. |
| I-069 | Auto-applied AI changes | Agent suggestions must be explainable and approved. |
| I-070 | Pure black / pure white | Harsh contrast; use forest ink and warm white. |
| I-071 | Serif headings inside the app | Made the workspace feel like a course page. Keep serif for landing only. |
| I-072 | Text sidebar in the app | Too much scanning; replaced by an icon rail. |
| I-073 | Binary checkbox as the core model | ViDo’s differentiator is progress + checkpoints. |

---

## Open questions

1. Which image kinds should be added next?
2. Should there be a picture-only mode, or keep image + title as the default?
3. Should the landing page match the workspace more closely?
4. Should focus blocks be a design spike?
5. Should Supabase/auth be the next foundation step?
6. Should we add a focus session timer?
7. Do we need a dark theme?
8. What should follow #7 — more image coverage or the landing page?
