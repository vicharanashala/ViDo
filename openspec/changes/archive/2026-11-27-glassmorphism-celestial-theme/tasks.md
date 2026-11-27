# Tasks

## 1. Celestial Theme Tokens & Horizon Canvas

- [x] 1.1 Add light and dark mode CSS variables, Option C horizon sky gradients, and glassmorphic surface tokens in `src/index.css` and verify compile validity with `npm run typecheck`
- [x] 1.2 Create the celestial background component (`src/components/ui/CelestialCanvas.tsx`) rendering the atmospheric horizon sky and sun/moon glow, and verify rendering with a colocated unit test

## 2. Time-of-Day Theme Engine & Persistence

- [x] 2.1 Implement `useTheme` and clock calculation helpers in `src/lib/theme.ts` supporting auto clock evaluation (06:00-18:00 = Sun/Light, 18:00-06:00 = Moon/Dark), 60-second live tick, and `localStorage` persistence, and verify with unit tests in `src/lib/theme.test.ts`
- [x] 2.2 Integrate the theme bootstrap into `src/main.tsx` and `src/App.tsx` ensuring `data-theme` synchronization on the document root element

## 3. Glassmorphic UI Primitives & Components

- [x] 3.1 Update core UI primitives (`Card.tsx`, `Button.tsx`, `Badge.tsx`, `Input.tsx`, `NoticeModal.tsx`) in `src/components/ui/` with frosted glass tokens and specular borders, and verify that `src/components/ui/ui.test.tsx` passes
- [x] 3.2 Update workspace task components (`TaskRow.tsx`, `TaskCard.tsx`, `TaskDetailModal.tsx`, `TaskCreateModal.tsx`) to apply frosted glass styling with hover elevation, and verify tests pass

## 4. Workspace Shell & Landing Page Integration

- [x] 4.1 Update `WorkspaceSidebar.tsx` and `WorkspaceTopBar.tsx` with frosted glass styling over the celestial canvas, and verify workspace shell tests pass
- [x] 4.2 Update `LandingHeader.tsx`, `LandingHero.tsx`, `LandingPreview.tsx`, and `LandingPage.tsx` to render over the celestial canvas with glass cards, and verify landing tests pass
- [x] 4.3 Update `WorkspaceLayout.tsx` to mount the celestial horizon canvas behind all subroute views, and verify `WorkspaceViewsAndModals.test.tsx` passes

## 5. Theme Settings & Style Lab Controls

- [x] 5.1 Update `SettingsView.tsx` Theme & Appearance tab with a 3-way theme selector (`Auto (Celestial Clock)`, `Light (Sun)`, `Dark (Moon)`) and live clock status, and verify `SettingsModal.test.tsx` and `SettingsView.test.tsx` pass
- [x] 5.2 Update `StyleLab.tsx` with celestial theme controls, light/dark mode preview, and verify `StyleLab.test.tsx` passes

## 6. End-to-End Verification

- [x] 6.1 Run full typecheck, test suite, and production build (`npm run typecheck`, `npm test`, `npm run build`) and verify 0 errors
