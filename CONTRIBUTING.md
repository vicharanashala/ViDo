# Contributing to ViDo

Thank you for your interest in contributing to **ViDo**! 

ViDo is a calm, distraction-free task-management workspace built for focused individuals and transparent teams. We welcome contributions that maintain our high standards of design cohesion, code modularity, and test reliability.

---

## 📌 Table of Contents

- [Code of Conduct & Etiquette](#code-of-conduct--etiquette)
- [How to Propose Changes](#how-to-propose-changes)
  - [1. Fixing Bugs or Broken Features](#1-fixing-bugs-or-broken-features)
  - [2. UI Redesigns & New Features](#2-ui-redesigns--new-features)
- [Development Workflow](#development-workflow)
  - [Step 1: Fork and Clone](#step-1-fork-and-clone)
  - [Step 2: Create a Branch](#step-2-create-a-branch)
  - [Step 3: Local Setup & Running](#step-3-local-setup--running)
  - [Step 4: Making Changes](#step-4-making-changes)
- [Engineering & Design Standards](#engineering--design-standards)
  - [Architecture & Directory Boundaries](#architecture--directory-boundaries)
  - [Design Tokens & Styling Rules](#design-tokens--styling-rules)
  - [Testing Standards](#testing-standards)
- [Mandatory Verification Checks](#mandatory-verification-checks)
- [Pull Request Guidelines & Checklist](#pull-request-guidelines--checklist)

---

## Code of Conduct & Etiquette

- **Respect and Calm**: Keep all issue, PR, and discussion interactions constructive, welcoming, and professional.
- **Clarity over Complexity**: Propose minimal, elegant solutions over sprawling rewrites.
- **Single Source of Truth**: Coordinate before building to avoid duplicated efforts.

---

## How to Propose Changes

Before writing code or opening a pull request, determine which path your change falls under:

### 1. Fixing Bugs or Broken Features

1. **Check Existing Issues First**:
   - Browse open and closed issues on [GitHub Issues](https://github.com/vicharanashala/ViDo/issues).
   - Verify that no open issue or pull request already reports or addresses the same bug.
2. **Open an Issue (if none exists)**:
   - Provide a clear, descriptive title.
   - Outline steps to reproduce, expected vs. actual behavior, and relevant console errors.
   - Mention your environment (browser, OS).
3. **Reference the Issue**:
   - In your PR, link the issue using GitHub keyword syntax (e.g., `Fixes #12` or `Closes #15`).

### 2. UI Redesigns & New Features

ViDo is crafted with intentional visual restraint and strict design principles. To prevent wasted effort:

1. **Open a GitHub Discussion First**:
   - Navigate to [GitHub Discussions](https://github.com/vicharanashala/ViDo/discussions).
   - Start a discussion in the **Ideas** or **UI/UX** category.
   - Explain the motivation, UX rationale, and propose wireframes or mockups.
2. **Align with Maintainers**:
   - Discuss design token compatibility, route integration, and scope with the project maintainers.
   - Only proceed with implementation once aligned.
3. **Mandatory PR Requirements for UI Changes**:
   - **Discussion Link**: Your PR must include the link to the approved GitHub Discussion.
   - **Screenshots / Recordings**: Provide clear before/after screenshots or screen recordings showing the visual change in action.
   - **Endpoint / Route Specification**: Explicitly document which route was modified (e.g., `/`, `/workspace`, `/preview/today`, `/style-lab`).

---

## Development Workflow

### Step 1: Fork and Clone

1. Fork the official repository to your GitHub account:
   `https://github.com/vicharanashala/ViDo/fork`
2. Clone your personal fork locally:
   ```bash
   git clone https://github.com/<your-username>/ViDo.git
   cd ViDo
   ```
3. Set up the upstream remote:
   ```bash
   git remote add upstream https://github.com/vicharanashala/ViDo.git
   ```

### Step 2: Create a Branch

Always branch off a clean, up-to-date `main` branch:

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-number-bug-description
```

### Step 3: Local Setup & Running

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. The development server runs at `http://localhost:5173`.
   - **Firebase Auth Emulator**: Vite automatically checks port `9099` and starts the emulator in the background with project `demo-vido`.
   - Ensure Java (JRE 11+) is installed (`java -version`).
   - If you prefer running the emulator manually in a separate window, run:
     ```bash
     npm run emulators
     ```
   - **Signed-in data**: The `/workspace` routes store tasks, calendar events, categories, and planning targets through the NestJS backend. Run `npm run dev:all` to start Vite and the backend together (see the [server README](./server/README.md) for first-time Prisma setup). Without the backend, signed-in changes are kept only in memory and disappear on reload.

### Step 4: Making Changes

- Keep commits focused on a single responsibility.
- Use conventional commit messages:
  - `feat: add new filter options to upcoming view`
  - `fix: resolve keyboard navigation trap in NoticeModal`
  - `docs: update setup steps for Windows PowerShell`
  - `refactor: extract date calculation helpers into pure utility`
  - `test: add unit coverage for task status transitions`

---

## Engineering & Design Standards

### Architecture & Directory Boundaries

All code contributions must strictly adhere to **[FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md)**:

- **UI Primitives (`src/components/ui/`)**:
  - Must remain strictly domain-agnostic (`Button`, `Card`, `Badge`, `Input`, `NoticeModal`).
  - **Never** import domain models (`Task`, `Checkpoint`, `User`).
  - Must be exported through `src/components/ui/index.ts`.
- **Feature Code (`src/features/`)**:
  - Place code in its appropriate vertical slice (`landing/`, `workspace/`, `style-lab/`, `auth/`).
- **Data & Logic (`src/data/`)**:
  - Keep state calculation, date filters, and sample models in `src/data/`.
- **Clean Root & Source Invariants**:
  - Do not create arbitrary top-level folders or dump loose utilities directly into `src/`.

### Design Tokens & Styling Rules

ViDo uses **Tailwind CSS v4** with semantic CSS custom properties:

- **Always use CSS variables** rather than hardcoded hex codes:
  - `var(--canvas)`: Main background.
  - `var(--surface)`: Card, panel, and modal containers.
  - `var(--ink)`: High-contrast primary headings and text.
  - `var(--muted)`: Secondary labels, metadata, and timestamps.
  - `var(--line)`: Subtle card strokes and dividers.
  - `var(--accent)` & `var(--accent-soft)`: Interactive brand highlights.
- **Maintain High Contrast**: Light-theme first with generous whitespace, crisp borders, and accessible WCAG AA ratios.

### Testing Standards

- **Colocate Tests**: Tests must live alongside the files they verify (e.g. `TaskRow.tsx` $\rightarrow$ `TaskRow.test.tsx`).
- **Never weaken existing assertions**: If an existing test fails, fix your code or explain why the test requirements genuinely need updating.
- **Write Tests for New Features**: Add unit or integration tests for every new component or logic helper.

---

## Mandatory Verification Checks

Before pushing your branch or opening a pull request, you **must run and pass all three verification commands**:

```bash
# 1. TypeScript Strict Typecheck (Must exit with code 0)
npm run typecheck

# 2. Vitest Test Suite (All tests must pass)
npm test

# 3. Production Build (Must bundle cleanly without errors)
npm run build
```

Run them in one line:
```bash
npm run typecheck && npm test && npm run build
```

---

## Pull Request Guidelines & Checklist

When opening your pull request to `vicharanashala/ViDo:main`:

1. **Title**: Follow conventional commit conventions (`feat: ...`, `fix: ...`).
2. **Description**: Complete the pull request checklist below:

```markdown
### Summary
<!-- Brief description of the problem solved or feature added -->

### Related Links
- Issue / Discussion: Fixes #<issue-number> or [Discussion Link](<url>)

### UI Changes (if applicable)
- Route / Endpoint: /preview/today (or /workspace, etc.)
- Before / After Screenshots:
  <!-- Drag and drop images or GIF here -->

### Verification Checklist
- [ ] Checked for conflicting or duplicate open issues/PRs
- [ ] For UI/feature changes: linked to an approved GitHub Discussion
- [ ] Adheres to `FOLDER_STRUCTURE.md` and `AGENTS.md`
- [ ] `npm run typecheck` exits with 0 errors
- [ ] `npm test` passes completely
- [ ] `npm run build` compiles with 0 errors
- [ ] Added or updated test coverage for new functionality
```

---

Thank you for helping make ViDo a better workspace for everyone!

