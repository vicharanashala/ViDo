# ViDo — Review Feedback and Professionalism Fix List

## The feedback

> “This project does not look very professional.”

## What the reviewer is reacting to

This is not a judgment that the app needs to become plain, corporate, or Google Tasks. It is a reaction to **credibility signals**: does this feel intentional, coherent, trustworthy, and finished?

The current build already has strong motivational ideas: progress, checkpoints, gentle copy, images, momentum, task paths, and a calm palette. The issue is that too many ideas are visible at the same level, so the product reads as several experiments rather than one finished tool.

## Important distinction

**Professional does not mean boring.**

Google Tasks is a list with dates. That is not the benchmark. The benchmark is:

- Things: calm, precise, personal.
- Linear: fast, opinionated, polished.
- Duolingo: playful, but internally consistent.

ViDo should keep motivation and personality. It needs **coherence, restraint, and finished trust features** around that personality.

---

## Why it currently reads unprofessional

1. **Too many metaphors at once**
   - Calm daily space + doodle stickers + quest path + snake-and-ladder + momentum trail + AI assistant + profile.
   - Each is fine alone. Together they compete.

2. **Mixed visual languages**
   - Twemoji, OpenMoji, CC0 photos, composed SVGs, line icons, gradients, floating background icons.
   - The eye reads “collage” instead of “design system.”

3. **Playful language in serious moments**
   - “Yesss — I did it!”, “Quest complete”, “Wins so far”, “Pick up again”.
   - Warm, but in a work review it can read as a student project.

4. **Non-standard navigation as the primary label**
   - “Today’s move”, “What’s next”, “Pick up again”, “Wins so far”, “Resting”.
   - Standard names are only hints. Reviewers scan the primary labels.

5. **Busy cards**
   - Image + title + progress + percentage + deadline + pending + “Break into steps” + date picker + actions.
   - The next action is not visually obvious.

6. **Game layer conflicts with work**
   - Snake-and-ladder and “quest” language beside “Review Q4 Budget” splits the tone.

7. **Unfinished trust features**
   - Local auth with the OTP shown on screen.
   - No real email delivery, no backend, no cross-device sync, no export.
   - A reviewer sees a demo, not a product.

8. **Decorative noise**
   - Floating task icons, large quote, gradients, several accent colours.
   - These add dopamine but reduce the “quiet, confident software” feeling.

---

## What to keep

- Progress + checkpoints instead of binary checkboxes.
- Gentle, non-guilt copy.
- Soft palette and restrained motion.
- Images as anchors, with titles beside them.
- Task paths and assistant-assisted breakdown.
- Momentum and small-win focus.
- The motivation layer. It is the differentiator.

---

## Fix list, in priority order

### P0 — Credibility and trust

- [ ] Finish real reminders: optional date/time, local notification, in-app fallback.
- [ ] Finish task sharing: email/phone target, owner, shared-with list, remove access.
- [ ] Make auth honest: real email OTP or explicitly label the current build a local prototype. Do not show the OTP on screen in a “professional” build.
- [ ] Add export/import (JSON) so data is not trapped in one browser.
- [ ] Show clear local/synced status in Profile or Settings.
- [ ] Add privacy copy: what is stored, where, and how to erase it.
- [ ] Add real empty, loading, error, and offline states.

### P0 — Visual coherence

- [ ] Pick one image style. Do not mix Twemoji, photos, and line compositions on the same surface.
- [ ] Remove floating background task icons from the working app; keep the soft wash.
- [ ] Remove or reduce the hero quote from the main workspace. It can live on Home only.
- [ ] Use standard primary navigation: Today, Upcoming, Past, Completed, Archived. Keep playful aliases as secondary hints.
- [ ] Simplify cards: title + one progress cue + one date cue + one primary action. Move steps/share/reminders into details.
- [ ] Limit each screen to one primary action and two accent colours.
- [ ] Establish one card size and one spacing scale across every page.

### P1 — Product narrative

- [ ] Pick one metaphor: paths OR quests OR momentum trail. Do not run all three in the main flow.
- [ ] Make the game layer optional (a separate “Momentum trail” page), not part of every task.
- [ ] Keep the path assistant behind an explicit “Break it down” action.
- [ ] Remove “Quest complete” from the core task list; keep it inside the optional path/trail page.
- [ ] Write one sentence that explains ViDo: “A calm task workspace that shows progress, not just checkboxes.”

### P1 — Onboarding and daily flow

- [ ] First-run explanation of the four main surfaces: Today, Upcoming, Past, Completed.
- [ ] Explain progress + checkpoints in one short card.
- [ ] Make “That’s enough for today” discoverable but not dominant.
- [ ] Add a clear next action after sign-in.
- [ ] Make the profile fields and sign-in state understandable at a glance.

### P2 — Engineering polish

- [ ] Accessibility audit: keyboard-only paths, focus states, screen-reader labels, contrast.
- [ ] Performance check: fast initial render and no layout shift.
- [ ] Test coverage for auth, sharing, reminders, filters, and empty states.
- [ ] Data migration path for old `localStorage` shapes.
- [ ] Keep AGENTS.md / README / journal / folder structure current.
- [ ] Reduce demo-looking seed titles where possible; keep realistic but neutral data.

---

## Acceptance checklist for a “base product”

- [ ] A new user understands the app in under one minute.
- [ ] The primary navigation uses standard names.
- [ ] Every screen has one clear next action.
- [ ] No mixed image style on the same screen.
- [ ] No game language in the core task flow.
- [ ] Reminders and sharing work.
- [ ] Auth does not show an OTP on screen unless clearly marked as a prototype.
- [ ] Data can be exported and imported.
- [ ] Typecheck, tests, and production build pass.
- [ ] A reviewer can explain what the product is without being told.

---

## Current status

Implemented:

- Local-first tasks, progress, checkpoints, pace.
- Natural-language capture, deadlines, recurrence.
- Today/Upcoming/Past/Completed/Archived.
- Drag/tap/C check-in.
- Card boards, task paths, subtasks, path assistant.
- Custom images, walking image, prefix profile.
- Local registration/sign-in with email + OTP prototype.
- Profile fields: prefix, name, email, DOB, phone.
- Reminders and sharing are implemented in the current working tree.

Still needs review:

- Visual coherence pass.
- Real email OTP or explicit prototype labelling.
- Export/import.
- Optional game layer separation.
- Accessibility audit.

