# ViDo — Session Log

This is a faithful, structured log of the working sessions: the questions asked, the analysis given, the decisions made, what was built, what was rejected, and the state at the end.

---

## 1. Starting context

The workspace is:

```
Samagra/
├── to-do-list/   # Samagra daily coaching app (Express + React, Phase 1 built)
├── todo-lab/     # Dataset/forecast lab (Express + React, built)
├── Notes/        # Notes and reviews
└── vido-app/     # New ViDo application (this project)
```

### 1.1 The request

Build a new todo application, entirely new from the existing `to-do-list` and `todo-lab`, using this repository as the base picture:

```
https://github.com/vicharanashala/ViDo
```

The first ask was a complete understanding before writing code.

### 1.2 What ViDo is

ViDo is positioned as:

> See the work. Share the progress. Deliver together.

Its core belief: a task is more useful when its progress and history are visible, not merely whether it is open or done.

The five questions ViDo should answer:

1. What needs to be done?
2. Who is responsible?
3. When exactly is it due?
4. How much progress has been made?
5. What has happened since it was created?

Claimed phases:

1. Minimal personal task core.
2. Authentication and multi-user support.
3. Shared tasks and team collaboration.
4. Embedded AI agent.

### 1.3 What the ViDo repo actually contained

The repository was a static visual prototype, not a working app:

- `/` landing page
- `/preview/*` dashboard with sample data
- `/style-lab` theme lab
- Hardcoded benchmark date: 17 November 2026
- No backend, auth, persistence, real CRUD, or real progress
- Sample tasks in `src/data/sampleTasks.ts`
- Pure filters in `src/data/taskFilters.ts`
- Reusable primitives: `Button`, `Badge`, `Card`, `Input`, `NoticeModal`
- React 19 + Vite 6 + TypeScript + Tailwind v4 + Lucide + Vitest
- Docs contradicted the code: README promised progress bars that did not exist; `context.md` said there was no progress tracker.

### 1.4 Authorship finding

Git showed commits by Jatin Kumar (5) and hegdev13 (1). The repository also contained:

- `AGENTS.md` addressed to AI assistants
- `.cursorrules`
- `.github/copilot-instructions.md`
- `openspec/`
- `.agents/skills/` for OpenSpec
- `Idea.md` explicitly describing “AI-assisted development” and retaining prompts

Conclusion: the host team directed and committed the app, but it was largely AI-generated scaffolding, not conventionally hand-written.

---

## 2. Comparison with the existing apps

### 2.1 Common ground

- All three are task-lifecycle apps in the React/Vite family.
- Same universal personal/home/work task domain.
- Same core fields: title, deadline, completion.
- Same view vocabulary: Today, Upcoming, Overdue, Completed.
- ViDo’s planned AI phase references the exact same household dataset as `todo-lab`: 1,786 records, 20 types, 1,779 completed, 7 incomplete, 966 late, 813 on-time.

### 2.2 Complexity ranking

| Dimension | `to-do-list` | `todo-lab` | `vido-app` |
|---|---|---|---|
| Code files | 31 | 24 | 76 |
| App LOC | ~4,310 | ~2,553 | ~3,393 (+ tests) |
| Largest file | 1,957 LOC | 1,162 LOC | 300 LOC |
| Architecture | root + server + client, JS | root + server + client, JS | single package, TS, feature slices |
| Tests | 0 | 0 | 28 initially, 67 at last run |
| Backend | Express + JWT + JSON + cron + email | Express + dataset engine | none |
| Auth | magic link + Google + JWT | none | none |
| Algorithm depth | high | highest | low initially |
| Runtime complexity | highest | high | lowest initially |
| Maintainability | low (monoliths, no tests) | low (monoliths, no tests) | high (typed, modular, tested) |
| Effort still needed to be real | already real | already real | persistence, CRUD, auth |

Conclusions:

- `to-do-list` = most product-complex, most operational complexity.
- `todo-lab` = most algorithmic complexity.
- `vido-app` = most structurally disciplined, least functional at the start.
- If ViDo were fully built to Phase 1, its complexity would sit between the lab and the product.

### 2.3 Efficiency

Measured bundle sizes:

| App | JS gzip | CSS gzip | Total |
|---|---|---|---|
| `to-do-list` | 161K | 3K | ~164K |
| `todo-lab` | 139K | 3K | ~142K |
| `vido-app` | 100K | 7K | ~107K |

But efficiency depends on the lens:

- Runtime/ops: ViDo wins.
- Functionality per LOC: Samagra wins.
- Development safety: ViDo wins.
- User capture speed: Samagra wins.
- Status comprehension: ViDo, once progress exists.
- Forecast/decision quality: todo-lab.

### 2.4 Real-world usability efficiency

Weighted judgment:

| Factor | Weight | Samagra | todo-lab | ViDo at start |
|---|---|---|---|---|
| Capture speed | 25% | 5 | 4 | 2 |
| Persistence/trust | 20% | 4 | 3 | 1 |
| Daily clarity | 20% | 3 | 2 | 5 |
| Retrieval | 10% | 3 | 5 | 2 |
| Mobile | 10% | 3 | 2 | 3 |
| Reminders | 10% | 4 | 1 | 1 |
| Collaboration | 5% | 2 | 1 | 1 |
| Weighted | | 3.75 | 2.85 | 2.35 |

Conclusions:

- Today: Samagra is the most usable end-to-end; todo-lab is a niche analysis tool; ViDo is a polished prototype.
- Potential: ViDo has the highest ceiling if capture is simplified and persistence added.
- Efficiency as a feature: Samagra has actual/estimated efficiency; todo-lab has model metrics; ViDo had no efficiency concept. The proposed ViDo metric is pace vs deadline.

### 2.5 Superiority

- Neither idea is universally superior.
- Samagra is deeper and more differentiated.
- ViDo is clearer, more universal, more maintainable.
- todo-lab is the evidence engine, not a product competitor.
- ViDo is inferior if it ships as a plain checkbox list.
- ViDo is superior if progress, checkpoints, and calm views are the core.

---

## 3. Decisions that shaped the build

| Decision | Chosen | Reason |
|---|---|---|
| Folder | `vido-app/` | Distinct from existing apps |
| Base | Clone `vicharanashala/ViDo` | Reuse visual foundation |
| Branding | Keep ViDo | User chose |
| Persistence | localStorage first | Fast, no credentials, easy migration |
| Auth | No auth for now | Local-first; Supabase later |
| Scope | Core lifecycle + views + checkpoints | Immediate usable app |
| Progress | 0–100 with checkpoints | ViDo’s differentiator |
| Date handling | Real current date | Remove hardcoded benchmark |
| Routing | `/app/*` | Real app, not preview |
| Demo framing | Removed | No demo banner or Demo User |
| Issue convention | `feat:` for features, `Issue:` for general | User instruction |
| PR | Not until approved and issue assigned | User instruction |

---

## 4. Build history

### 4.1 Foundation

- Cloned ViDo into `vido-app/`.
- `npm install` completed.
- Baseline verified: typecheck, 28 tests, build.
- Git remote remained `vicharanashala/ViDo`.
- Production dependencies had 0 vulnerabilities; 4 dev-only warnings.

### 4.2 Functional core

Built:

- `src/data/taskTypes.ts` — Task, Checkpoint, priorities, categories, state, pace.
- `src/data/taskDates.ts` — date keys, due timestamps, overdue, completion timing, pace.
- `src/data/sampleTasks.ts` — relative-date seed data and task factory.
- `src/lib/taskRepository.ts` — localStorage load/save/normalize/clear under `vido.tasks.v1`.
- `src/features/workspace/useTaskStore.ts` — state and lifecycle actions.
- CRUD: create, edit, complete, reopen, archive, restore, delete.
- Progress changes and checkpoint timeline.
- Real dates; no hardcoded benchmark.
- Views: Today, Upcoming, Needs Attention, Completed, Archived.
- Search and filters: keyword, priority, deadline.
- Empty state for delete-all corrected: an intentionally empty workspace stays empty.
- Tests for filters, repository, dates, pace.

### 4.3 Landing and routes

- Landing CTA changed to **Open Workspace**.
- `/preview/*` redirects to `/app/*` while preserving subpath.
- Demo banner and Demo User removed.
- Sidebar and top bar made real.

### 4.4 Calm pass

User feedback: too much cognitive overload.

Changes:

- Top bar: title + search + one Filters button; filters appear on demand.
- Quick add: one input + Add; removed Details and Enter hint.
- Task row: cut to essentials.
- Home: removed paragraph, tab switching, and duplicate heading.
- Sidebar: removed Themes and save note.
- Added **Focus next** and a daily momentum bar.
- Focus selection changed to highest-priority overdue, not the oldest low-priority task.

### 4.5 Focus mode

Built:

- Full-screen one-task view.
- Big progress ring, later turned into direct chips.
- Checkpoint input.
- Latest updates.
- Mark complete / reopen.
- Delivered state with history preserved.
- `Esc` closes.
- No timer, streaks, or guilt copy.

### 4.6 Today queue

Built from issue #4:

- One ordered queue: overdue first, then due today.
- Overdue order: high → medium → low, then earliest deadline.
- Due-today order: due time first, priority breaks ties.
- Max three signals per row: title, due cue, progress cue.
- One subtle high-priority marker.
- Priority summary line.
- `Start next` opens the first task in Focus mode.
- Keyboard: `Enter` opens, `Space` completes, later `F` focuses.
- Completion copy names priority only for high-priority tasks.
- Today sidebar count includes overdue + due today.

### 4.7 Visual iterations

1. **Original ViDo** — cobalt/gray, light, demo-like.
2. **Warm editorial** — cream, terracotta, Fraunces serif, Inter.
3. **Dark studio (started)** — dark canvas, icon rail, focus dial, momentum strip.
4. **Final direction: colour psychology + less intensity**:
   - Sage canvas for low arousal.
   - Warm white surfaces to avoid glare.
   - Muted clay for action.
   - Green for progress/completion only.
   - Amber for attention only.
   - Muted clay-red for overdue only.
   - Deep forest ink instead of black.
   - Bold sans headings inside the workspace.
   - Slim icon rail instead of text sidebar.
   - Mobile bottom nav + FAB.
   - 7-day momentum strip.
   - Focus dial (progress ring).

### 4.8 Interactive mechanisms

Built:

- Natural-language capture:
  - `tomorrow`, `today`, `next week`
  - `5pm`, `9am`, `17:00`
  - `!high`, `!medium`, `!low`
  - `#personal`, `#home`, `#work`
  - Parsed preview chips before saving.
- Hover/focus `Focus` action on task rows.
- Keyboard: `Enter` open, `Space` complete, `F` focus.
- Focus mode progress chips: 25 / 50 / 75 / Done.
- Shared `ProgressRing` primitive.
- MomentumStrip for last 7 days.
- Check animation with reduced-motion support.

### 4.9 Doodle direction

User request: build it more like doodles and drawings. For example, entering “making laundry” should show a clothesline with clothes instead of the letters “making laundry”.

Decision:

- Introduce a keyword-to-doodle detector.
- Recognised tasks render an inline SVG doodle as the title.
- Unrecognised tasks keep the text title.
- Accessibility comes from `role="img"` and `aria-label` with the real title.
- Start with laundry, then expand to common tasks.

Status: implemented.

- `src/features/workspace/doodles/doodleMap.ts` detects keywords.
- `src/features/workspace/doodles/Doodles.tsx` contains 14 hand-drawn SVGs.
- `src/features/workspace/doodles/DoodleTitle.tsx` renders the doodle or falls back to text.
- Doodles are used in TaskRow, Home focus card, Focus mode, Task detail, and TaskCard.
- Accessibility: the doodle has `role="img"` and the real title as its label.
- Laundry renders a clothesline with a shirt, trousers, sock, clothespins, and a basket.
- Illustrations now use Twemoji (CC-BY 4.0) open-source cartoon SVGs instead of hand-drawn scenes.
- Groceries uses a shopping cart, so it no longer reads as a laundry bag.
- Laundry uses a basket; groceries uses a cart; gym uses a person lifting weights; running uses a treadmill; vehicle registration uses a car; dentist uses a literal CC0 dentist illustration; HVAC uses a heat pump photo; hose repair uses a rubber washer/O-ring photo.
- The priority-based image-style system was reverted in the main workspace because changing styles made the images harder to read.
- Every recognised task now shows the image **and the task title**; the image is a visual anchor, not the only label.
- Laundry and dishes use the same basket composition: clothes for laundry, plates/cups for dishes.
- Partial check-in adds 25% and a checkpoint without completing the task.
- High-priority laundry uses a CC0 laundromat photo; seed `Do the laundry` is high priority so it is visible.
- The style lab now shows a single image library, not a priority-style switcher.
- The user approved the **image + title** direction as the default; keep it.
- Tasks with no clear image fall back to their text (for example, “Review Q4 Budget” and “Renew SSL Certificates”).
- Task titles were reduced to 10px in rows; focus and detail headings are smaller too.
- The doodle library in `/style-lab` shows each image and its meaning.
- Attribution lives in `public/doodles/README.md`.
- Tests cover detection, rendering, and fallback.

---

## 5. Issues raised

### 5.1 Issue naming convention

User instruction from this point:

- `feat: <title>` for feature implementation, feature-related bugs, or product behaviour.
- `Issue: <title>` for docs, tooling, process, maintenance, or questions.

This rule was added to `AGENTS.md` as §3.1.

### 5.2 Issue #3

**Title:** `feat: Calm interactivity: reduce effort per action across the workspace`

URL: `https://github.com/vicharanashala/ViDo/issues/3`

An epic covering:

- One primary action per surface.
- Progressive disclosure.
- Keyboard-first actions.
- Inline progress/checkpoint updates.
- Calm motion and reduced motion.
- Mobile actions.
- Optional command palette.
- Guardrails: no net increase in visible controls, no gamification.
- Acceptance: capture ≤2 actions, complete from Today ≤1 action, enter Focus ≤1 action, keyboard reachable, reduced motion respected, visible controls do not increase.

### 5.3 Issue #7

**Title:** `feat: Make ViDo a gentle daily space, not an accountability tool`

URL: `https://github.com/vicharanashala/ViDo/issues/7`

Covers the lighter direction: optional name, daily intention, gentler labels, no pressure counts, calm progress colours, "That's enough for today", and a small-win focus choice. Owner: @NAGASHREE1.

### 5.4 Issue #4

**Title:** `feat: Today view: focused priority-aware queue with calm feedback`

URL: `https://github.com/vicharanashala/ViDo/issues/4`

Part of #3.

Covers:

- One ordered queue.
- Overdue first, then due today.
- Priority ordering.
- Three signals per row.
- One primary action.
- `Start next`.
- Priority summary line.
- High-priority marker only.
- Priority-aware completion copy.
- Keyboard.
- Tests.

### 5.5 Assignment

- User commented on both issues asking `@Jatin-nicon` to assign them.
- GitHub rejected direct self-assignment because `NAGASHREE1` has read-only access to the host repo.
- Options: collaborator invite, claim comment, fork, or maintainer assignment.
- No assignment yet.
- PR #9 raised: https://github.com/vicharanashala/ViDo/pull/9

### 5.6 Other issues

- Issue #5 `issue: Conflicting tasks.md and milestones.md` exists and belongs to `hegdev13`. Not ours.

---

## 6. Ideas discussed but not built

### 6.1 Focus blocks with pause/resume

Proposal:

> Do not let tasks overlap. If overlap is needed, break the previous task for the time needed for the new task, then resume the original.

Assessment:

- Buildable, medium-high complexity.
- Needs start time + duration, timeline, overlap detection, split model, pause/resume checkpoints.
- Risk: wrong estimates, thrashing, cascading splits, false precision.
- Recommended as an opt-in design spike, not a hard rule.
- Status: not raised as an issue yet; candidate for a design spike.

### 6.2 Other future ideas

- Supabase auth + Postgres + RLS.
- Shared workspaces and teams.
- Comments and threaded replies.
- Recurring tasks.
- Tags and custom lists.
- Drag-and-drop ordering.
- Command palette.
- Focus session timer.
- Daily reflection.
- Reminders.
- PWA/offline.
- AI agent.
- Calendar sync.
- Landing page redesign.

---

## 7. Verification log

| Stage | Typecheck | Tests | Build |
|---|---|---|---|
| Baseline ViDo | pass | 28 | pass |
| Functional core | pass | 39 | pass |
| Focus mode | pass | 40 | pass |
| Home simplification | pass | 41 | pass |
| Today queue | pass | 46 | pass |
| Warm/editorial + interactivity | pass | 52 | pass |
| Colour psychology + icon rail + momentum | pass | 53 | pass |
| Doodle task titles | pass | 60 | pass |
| Cartoon sticker doodles + welcome/intention | pass | 65 | pass |
| Image + title clarity pass | pass | 65 | pass |
| Gentle daily-space pass (#7) | pass | 67 | pass |
| Navigation, check-in, images, paths, assistant | pass | 118 | pass |

Last build at time of writing:

- JS: ~376.84 kB raw / ~110.11 kB gzip
- CSS: ~41.74 kB raw / ~7.85 kB gzip
- Build time: ~2.0s

---

## 8. Current state

- Working app in `vido-app/`.
- Routes: `/`, `/app`, `/app/today`, `/app/upcoming`, `/app/paths`, `/app/trail`, `/app/profile`, `/app/needs-attention`, `/app/completed`, `/app/archived`, `/app/tasks/:taskId/path`, `/style-lab`.
- Data persists in localStorage.
- Branch `feat/local-first-vido` pushed to fork `NAGASHREE1/ViDo`; PR #9 was closed. Latest committed state: `889280d` plus later uncommitted work.
- Commit author: `Nagashree Venkatesh <nagu95@gmail.com>` under `NAGASHREE1`.
- Current version includes labelled motivating navigation, drag/tap/C check-in, optional deadlines, pick-up-again parking, recurrence until deadline, task card boards, task paths, the path assistant, custom images, walking/sport images, prefix-aware welcome, the collapsible sidebar, the Momentum trail, an editable profile, and the workspace atmosphere.
- Open issues: #3, #4, #6, #7, #8, #10, #11. PR #9: https://github.com/vicharanashala/ViDo/pull/9
- Image + title labels cover 37 task kinds; unmatched tasks get a custom-image option.
- Verification: typecheck pass, 118 tests pass, production build pass.
- Dev server runs at `http://127.0.0.1:5173`.

## 9. Open questions for next session

1. Do we add the daily mood/vent check-in with recommendations?
2. What is the right calm reward — a win collection, garden, or nothing?
3. Do we connect the path assistant to a hosted model or keep the local fallback?
4. Should the landing page be redesigned to match the workspace?
5. Should we raise the focus-blocks design spike?
6. Should Supabase/auth be the next foundation step?
7. Should we add a focus session timer or keep Focus mode timeless?
8. Should the app ship with a default light theme, dark theme, or both?
