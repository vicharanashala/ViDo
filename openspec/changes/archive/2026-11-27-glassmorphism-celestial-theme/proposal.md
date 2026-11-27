# Proposal

## Why

ViDo's visual experience is currently limited to a solid white/gray canvas with fixed light-mode tokens and no atmospheric immersion or dark mode support. Users working across morning, afternoon, and evening need a visually comfortable, distraction-free environment that adapts naturally to the time of day, paired with a modern, cohesive glassmorphic aesthetic that maintains high contrast and scannability across both the public landing page and authenticated workspaces.

## What Changes

- **Celestial Horizon Canvas (Option C)**: Introduce an atmospheric horizon sky gradient background across both the public landing page (`/`) and workspace shells (`/preview`, `/workspace`, `/style-lab`). In light mode, it renders a crisp daytime cerulean sky with a warm golden dawn/sun horizon glow; in dark mode, it renders a deep cosmic midnight sky with a luminous twilight/moon horizon glow.
- **Dynamic Time-of-Day Theme Engine**: Implement automatic theme switching by default based on local device time (06:00 to 18:00 = Day/Sun/Light; 18:00 to 06:00 = Night/Moon/Dark) with live minute-interval updates.
- **Theme Settings & Override Control**: Add a 3-way theme selector (`Auto (Celestial Clock)`, `Light (Sun)`, `Dark (Moon)`) in Settings (`SettingsView.tsx` under Theme & Appearance) and `StyleLab.tsx`, persisted in `localStorage` (`vido_theme_mode`).
- **Universal Glassmorphism Design System**: Transform cards, task rows, topbars, sidebars, modals, summary tiles, and inputs into frosted glass surfaces utilizing `backdrop-filter: blur(...)`, translucent backgrounds, subtle specular border reflections, and dark-mode compliant high-contrast typography tokens (`--ink`, `--muted`, `--surface`, `--line`).

## Capabilities

### New Capabilities
- `theme-system`: Establishes the celestial day/night sky horizon engine, automated clock-driven theme calculation with manual override persistence, and glassmorphic CSS token variables supporting light and dark modes.

### Modified Capabilities
- `workspace-shell`: Updates the workspace sidebar, topbar, modal dialogs, and task feed surfaces to render as multi-tiered frosted glass elements over the celestial background while maintaining accessibility and contrast.
- `style-lab`: Extends the theme evaluation laboratory to preview and toggle the celestial theme modes (Auto, Light/Sun, Dark/Moon) alongside candidate accent palettes.

## Impact

- **Frontend Styling**: Updates `src/index.css` to add CSS custom variables for `[data-theme="dark"]`, glassmorphic surface tokens (`--surface-glass`, `--line-glass`, `--canvas-gradient`), and backdrop blur utilities.
- **State Management**: Adds a centralized theme hook/provider (`useTheme` or `themeStore`) to calculate time-of-day modes, listen for changes, and synchronize `document.documentElement` attributes (`data-theme="light|dark"`).
- **Workspace Layout & Components**: Modifies `WorkspaceLayout.tsx`, `WorkspaceSidebar.tsx`, `WorkspaceTopBar.tsx`, `LandingPage.tsx`, `TaskRow.tsx`, `TaskCard.tsx`, and `SettingsView.tsx` to apply glass styles and mount the celestial canvas.
- **Tests**: Updates existing workspace and component tests to ensure all elements remain accessible, test IDs are preserved, and theme switching works predictably.
