# GitHub Copilot Instructions for ViDo

When working in this repository:
1. Always read and follow `AGENTS.md` and `FOLDER_STRUCTURE.md`.
2. Keep code modular:
   - UI primitives: `src/components/ui/` (exported via `index.ts`).
   - Domain features: `src/features/<feature-name>/`.
   - Data & filtering logic: `src/data/`.
3. Use CSS variables defined in `src/index.css` for all colors and themes.
4. Maintain test coverage: every feature and component must have tests.
5. Verify changes with `npm run typecheck`, `npm test`, and `npm run build`.
6. Git push: The agent is authorized to run `git push` autonomously when verification checks pass and changes are complete and ready to be pushed.
