> **Historical roadmap.** The current implementation is the working local-first workspace described in `README.md` and `context.md`. Milestone 1 was extended beyond the original static visual slice. See `journal/CONVERSATIONS.md` for the current state.

# ViDo — Tasks and Milestones

This is the working implementation roadmap for ViDo. It converts the product discussion into small, reviewable slices.

## How We Will Work

- Build one milestone at a time.
- Review the visible result before starting the next milestone.
- Do not silently introduce features from later milestones.
- Keep unresolved ideas in the backlog rather than guessing.
- Every milestone must pass its acceptance checks before it is considered complete.

## Status Legend

- `[x]` Discussed or completed
- `[ ]` Not started
- `🔎 Review gate` User review is required before continuing

---

## Milestone 0 — Product Discovery

**Status:** Completed for the initial build

### Tasks

- [x] Define ViDo as a universal task manager for personal, household, student, professional, and future business use.
- [x] Establish the principle: simple enough for anyone, organized enough for serious work.
- [x] Choose a professional and minimal visual direction.
- [x] Choose desktop-first design with mobile adaptation later.
- [x] Define the public landing-page concept.
- [x] Choose Google-only sign-in.
- [x] Choose Supabase for authentication and task storage.
- [x] Define private tasks as the first product experience.
- [x] Define the initial task fields and lifecycle.
- [x] Define the Home dashboard sections and limits.
- [x] Record unresolved decisions separately instead of guessing.
- [x] Create and maintain `concept.html` as the living visual brief.
- [x] Create `context.md` as the universal agent handoff.
- [x] Initialize OpenSpec with universal agent skills and project-specific rules.

### Deliverables

- `README.md`
- `Idea.md`
- `concept.html`
- `MILESTONES.md`
- `context.md`
- `openspec/`
- `.agents/skills/`

### Acceptance Check

- The product direction is understandable without reading the original meeting transcript.
- Initial scope and future scope are clearly separated.

---

## Milestone 1 — Static Visual Foundation

**Goal:** Validate how ViDo looks and feels before connecting authentication or a database.

### 1.1 Project Foundation

- [x] Create a clean Vite + React + TypeScript application.
- [x] Set up a maintainable source-folder structure.
- [x] Add formatting, linting, and production-build scripts.
- [x] Add a simple application route structure.
- [x] Keep secrets and Supabase configuration out of this milestone.

### 1.2 Visual Design System

- [x] Define typography, spacing, borders, radii, shadows, and neutral colors.
- [x] Create a small set of reusable buttons, inputs, badges, cards, and modal styles.
- [x] Prepare several restrained accent-color samples before choosing one.
- [x] Build the light theme only.
- [x] Add visible keyboard focus states.

### 1.3 Public Landing Page

- [x] Create a professional navigation header.
- [x] Create a universal hero message.
- [x] Add a non-functional **Continue with Google** button.
- [x] Show a realistic ViDo dashboard preview.
- [x] Add Personal, Home, and Work use-case cards.
- [x] Explain the core benefits without promising unbuilt features.
- [x] Add a clear final call to action and footer.

### 1.4 Dashboard Shell

- [x] Create the persistent desktop sidebar.
- [x] Add Home, Today, Upcoming, Needs Attention, Completed, and Archived navigation items.
- [x] Create the dashboard top bar with search, filter placeholder, and sample user profile.
- [x] Show Today, Needs Attention, Upcoming, and Recently Completed sections.
- [x] Use sample tasks only.
- [x] Limit dashboard sections according to the agreed rules.
- [x] Create a centered, non-functional task-detail concept modal.
- [x] Create a centered, non-functional task-creation concept modal.

### Explicitly Excluded

- Google OAuth
- Supabase connection
- Real task creation or editing
- Persistence
- Recurring tasks
- Shared tasks

### Acceptance Check

- Landing page clearly explains ViDo before sign-in.
- Dashboard looks professional without feeling chaotic.
- Large task counts do not dominate or discourage the user.
- Visual hierarchy works at common desktop widths.
- Lint and production build pass.

### 🔎 Review Gate 1

Review:

- Visual direction
- Accent color
- Landing-page story
- Dashboard density
- Sidebar and modal appearance

Do not start authentication until this review is approved.

---

## Milestone 2 — Google Authentication

**Goal:** Add secure identity without implementing the task database yet.

### Tasks

- [ ] Create or connect a Supabase project.
- [ ] Configure environment variables safely.
- [ ] Configure Google OAuth in Supabase and Google Cloud.
- [ ] Connect the landing-page sign-in button.
- [ ] Handle OAuth callback and session restoration.
- [ ] Protect private application routes.
- [ ] Display the signed-in user’s Google name and profile photo.
- [ ] Add sign-out behavior.
- [ ] Add loading, cancellation, and authentication-error states.
- [ ] Document local OAuth setup and authorized redirect URLs.

### Security Checks

- [ ] No service-role key is exposed in frontend code.
- [ ] Secrets are ignored by Git.
- [ ] Signed-out users cannot access private routes.
- [ ] Sessions persist safely across refreshes.

### Acceptance Check

- A user can sign in only through Google.
- The private dashboard loads after successful authentication.
- Refreshing preserves the session.
- Signing out returns the user to the landing page.

### 🔎 Review Gate 2

Confirm the full sign-in and sign-out experience before creating persistent tasks.

---

## Milestone 3 — Private Task Storage

**Goal:** Establish secure user-owned tasks in Supabase.

### Proposed Task Data

- Title — required
- Description — optional
- Due date — required
- Due time — optional; defaults to end of day
- Priority — optional: High, Medium, or Low
- State — Active or Completed
- Completion timestamp
- Archive timestamp
- Created and updated timestamps
- Authenticated owner ID

### Tasks

- [ ] Design the initial PostgreSQL task schema.
- [ ] Create schema migrations.
- [ ] Add user ownership to every task.
- [ ] Create Row-Level Security policies.
- [ ] Build a typed frontend data-access layer.
- [ ] Fetch only the authenticated user’s tasks.
- [ ] Add loading, empty, error, and retry states.
- [ ] Verify user data isolation with two test accounts.

### Acceptance Check

- A signed-in user sees only their own task records.
- Direct database/API attempts cannot access another user’s tasks.
- Empty and failed states are understandable.

### 🔎 Review Gate 3

Inspect the schema and verify privacy before implementing all task actions.

---

## Milestone 4 — Core Task Lifecycle

**Goal:** Implement the smallest complete private-task workflow.

### Task Creation

- [ ] Open the complete task form in a centered modal.
- [ ] Validate the required title and due date.
- [ ] Support an optional description.
- [ ] Support optional due time with an end-of-day default.
- [ ] Support optional priority.
- [ ] Save to Supabase.
- [ ] Prevent accidental duplicate submissions.
- [ ] Show clear success and failure feedback.

### Task Details and Editing

- [ ] Open task details in a centered modal.
- [ ] Edit task fields.
- [ ] Preserve original creation metadata.
- [ ] Recalculate derived views after deadline changes.

### Completion

- [ ] Ask for confirmation before completion.
- [ ] Record the completion timestamp.
- [ ] Show brief, restrained completion feedback.
- [ ] Move the task to Completed.
- [ ] Offer a short Undo action.
- [ ] Label completion as on time or after the deadline.
- [ ] Allow reopening after confirmation.
- [ ] Clear the completion timestamp when reopened.
- [ ] Recalculate overdue state after reopening.

### Acceptance Check

- Create → view → edit → complete → undo/reopen works reliably.
- Date-only tasks receive a consistent end-of-day deadline.
- Completion timing is calculated correctly.

### 🔎 Review Gate 4

Test the complete task journey before building more views and controls.

---

## Milestone 5 — Dashboard and Derived Views

**Goal:** Organize task information without overwhelming users.

### Derived Views

- [ ] Home
- [ ] Today
- [ ] Upcoming
- [ ] Needs Attention
- [ ] Completed
- [ ] Archived

### Home Rules

- [ ] Show up to 5 Today tasks.
- [ ] Show up to 3 Needs Attention tasks.
- [ ] Show up to 3 Upcoming tasks.
- [ ] Show up to 3 Recently Completed tasks.
- [ ] Recently Completed includes tasks completed within the last 7 days.
- [ ] Hide Recently Completed when empty.
- [ ] Display total counts and **View all** links.
- [ ] Keep large overdue backlogs visually contained.

### Ordering

- [ ] Create realistic task datasets for ordering tests.
- [ ] Compare deadline-first and calculated ordering approaches.
- [ ] Select an understandable default ordering rule.
- [ ] Document the rule so the interface does not feel arbitrary.

### Acceptance Check

- Every task appears in the correct derived view.
- Deadline boundaries behave consistently.
- Large task counts remain manageable on Home.

### 🔎 Review Gate 5

Approve information hierarchy and ordering before adding search and filters.

---

## Milestone 6 — Search and Filters

**Goal:** Help users find tasks without introducing advanced organization yet.

### Search

- [ ] Search task titles.
- [ ] Search descriptions.
- [ ] Debounce or otherwise avoid wasteful database requests.
- [ ] Show a useful no-results state.

### Filters

- [ ] Priority: High, Medium, Low, and No priority.
- [ ] Deadline: Today, Tomorrow, This week, Overdue, and Custom range.
- [ ] State: Active and Completed.
- [ ] Clear all filters.
- [ ] Make active filters visible.
- [ ] Ensure search and filters work together predictably.

### Acceptance Check

- Search and filters return correct results together.
- Clearing filters restores the expected view.
- Controls remain understandable without tags or advanced query builders.

### 🔎 Review Gate 6

Review search speed, filter clarity, and empty states.

---

## Milestone 7 — Archive, Delete, and Reliability

**Goal:** Complete the task lifecycle safely.

### Archive

- [ ] Archive active or completed tasks.
- [ ] Remove archived tasks from normal views.
- [ ] Restore archived tasks.
- [ ] Preserve task data and timestamps while archived.

### Permanent Delete

- [ ] Keep permanent deletion inside a secondary action menu.
- [ ] Explain that deletion cannot be undone.
- [ ] Require confirmation.
- [ ] Remove the record securely from Supabase.

### Reliability

- [ ] Handle offline or interrupted requests gracefully.
- [ ] Prevent duplicate writes.
- [ ] Add useful retry actions.
- [ ] Test expired sessions.
- [ ] Test empty, loading, partial failure, and permission-error states.

### Acceptance Check

- Archive is reversible.
- Permanent deletion is deliberate and clearly different from archive.
- Failure states do not silently lose user actions.

### 🔎 Review Gate 7

Approve lifecycle safety and reliability before Phase 1 polish.

---

## Milestone 8 — Phase 1 Polish and Release Readiness

**Goal:** Make the private-task experience cohesive and presentable.

### Tasks

- [ ] Adapt the approved desktop experience for mobile.
- [ ] Verify keyboard navigation.
- [ ] Verify focus management inside modals.
- [ ] Check color contrast and readable text sizing.
- [ ] Add restrained motion with reduced-motion support.
- [ ] Review copy for universal, non-corporate language.
- [ ] Add automated tests for critical task rules.
- [ ] Run lint, type-check, tests, and production build.
- [ ] Update README setup instructions.
- [ ] Document Supabase schema and OAuth setup.
- [ ] Capture Phase 1 screenshots and demonstration steps.

### Phase 1 Completion Criteria

- Google sign-in works.
- Every task is private to its owner.
- Users can create, edit, complete, reopen, archive, restore, and permanently delete tasks.
- Deadlines and completion timing are correct.
- Dashboard sections remain clear with realistic task volumes.
- Search and filters work together.
- Desktop experience is polished; mobile experience is usable.
- Security policies and quality checks pass.

### 🔎 Final Phase 1 Review

Only after this review should the team plan shared tasks.

---

## Future Backlog — Not Part of Initial Phase 1

### Organization

- Custom lists
- Tags
- Recurring and periodic tasks
- Manual ordering
- Saved filters
- Dark mode
- Reminders and notifications

### Collaboration

- Shared tasks
- Invitations
- Ownership and assignment
- Comments and threaded replies
- Team workspaces
- Real-time updates

### Intelligence

- Embedded AI agent
- Task generation
- Scheduling recommendations
- Deadline-risk prediction
- Workload analysis
- Context-aware summaries

---

## Immediate Next Step

Start **Milestone 1 only** after approval:

1. Scaffold Vite + React + TypeScript.
2. Build the design system.
3. Build the landing page.
4. Build the static dashboard shell with sample data.
5. Stop for Review Gate 1.
