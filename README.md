# ViDo

A calm, local-first task workspace. Tasks can carry an optional deadline, progress, checkpoints, reminders, and a path of small steps.

## What works

- **Quick add** — type a task and press Enter. Natural-language dates, times, priority, and categories are supported. The Calendar control stays available before typing.
- **Focused navigation** — Home, Today, Upcoming, Past, Completed, and Archived, with Task paths and Momentum trail grouped under Plan.
- **Today queue** — tasks due today, deadline work you can start now, and a few suggestions from earlier.
- **Task paths** — break a task into steps, check them off, and reopen the task by adding another step.
- **Momentum trail** — a gentle board that moves with completed work. No points and no streaks.
- **Progress and checkpoints** — a 0–100% signal with a dated history of notes, blockers, and decisions.
- **Focus mode** — one task, a progress ring, quick updates, and a note to yourself.
- **Images** — a task image catalog plus custom images stored on this device.
- **Local account** — email + one-time code sign-in, profile fields, and local-browser task sharing.
- **Reminders** — in-app reminders while ViDo is open.
- **System clock** — live date and time at the right of the quick-add row on laptop and desktop widths.

## Focused by design

- Standard navigation labels with planning tools kept out of the main views.
- No floating background doodles or oversized quote above Today.
- A practical Today header with task count and one primary action.
- Warm language is kept where it helps; status and actions stay explicit.

## Local prototypes

Auth, sharing, and reminders are browser-local prototypes. There is no backend, email delivery, or cross-device sync yet.

## Run

```bash
npm install
npm run dev
```

## Verify

```bash
npm run typecheck
npm test
npm run build
```

Last verified: **126 tests across 33 suites**, typecheck pass, production build pass.
