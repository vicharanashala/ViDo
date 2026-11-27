# Design

## Context

See `proposal.md` for motivation. Currently, ViDo's theming is limited to brand accent variations (`data-accent="blue|indigo|green"`) defined in `src/index.css`. The background is a solid static color (`--canvas: #f5f6f8`), and all surfaces are opaque white cards (`--surface: #ffffff`) with fixed light-mode text tokens (`--ink: #16181d`). The settings view in `src/features/workspace/views/SettingsView.tsx` and the style lab in `src/features/style-lab/StyleLab.tsx` only manipulate accent colors.

## Goals / Non-Goals

**Goals:**
- Implement **Option C** (Atmospheric Horizon Sky Gradient): a dynamic celestial canvas providing a daytime cerulean-to-dawn horizon with sun glow in light mode, and a cosmic midnight-to-twilight horizon with moon glow in dark mode.
- Establish an automated time-of-day clock engine defaulting to local time (06:00 to 18:00 = Day/Sun; 18:00 to 06:00 = Night/Moon) with a 60-second tick listener for live day/night transitions.
- Provide user overrides in Settings and Style Lab (`Auto`, `Light / Sun`, `Dark / Moon`) saved to `localStorage` (`vido_theme_mode`).
- Implement an accessible 3-tier glassmorphic token architecture (`--surface-glass`, `--line-glass`, `--surface-glass-card`, `--surface-glass-modal`) using CSS backdrop filters and specular border highlights across both the Landing page and Workspace shells.
- Preserve full compatibility with existing accent color candidates (Cobalt Blue, Deep Indigo, Forest Green).

**Non-Goals:**
- Geolocation or third-party weather API queries (switching relies deterministically on device local clock time).
- Heavy 3D canvas/WebGL rendering (celestial sky and glows are rendered purely using performant CSS gradients and radial light diffusion).
- Breaking existing test suites or snapshot expectations.

## Decisions

### 1. Celestial Horizon Sky Implementation (Option C)
- **Choice**: Render the celestial horizon using fixed background CSS layers featuring multi-stop linear and radial gradients.
- **Light Mode (Sun)**: Deep sky cerulean (`#ebf4ff`) blending down into warm golden dawn (`#fef3c7` / `#fde68a`) with a diffuse radial sun halo.
- **Dark Mode (Moon)**: Deep midnight obsidian (`#0c0f17`) blending into twilight violet/indigo (`#1e1b4b` / `#1e293b`) with a cool luminous moon glow.
- **Alternative considered**: SVG illustration art or bitmap images. *Rejected* because CSS gradients are resolution-independent, load instantaneously, and produce smooth refractive coloring through frosted glass panels.

### 2. Centralized Theme State & Clock Evaluation
- **Choice**: Create a dedicated `useTheme` hook and theme initialization helper in `src/lib/theme.ts`.
- **Logic**:
  - Check `localStorage.getItem('vido_theme_mode')`.
  - If null or `'auto'`, check current device hour: `const isDay = hours >= 6 && hours < 18`.
  - Apply `data-theme="light"` or `data-theme="dark"` directly on `document.documentElement`.
  - Run a 60-second `setInterval` in the provider to detect boundary crossings smoothly.
- **Alternative considered**: Pure OS-level `prefers-color-scheme` query. *Rejected* because the user explicitly specified day/night clock transitions according to current time as the primary default.

### 3. Glassmorphic Elevation & CSS Token Architecture
- **Tokens in `src/index.css`**:
  ```css
  /* Light Theme Glass */
  :root, [data-theme="light"] {
    --canvas-gradient: linear-gradient(180deg, #dbeafe 0%, #fef3c7 65%, #f5f6f8 100%);
    --surface-glass: rgba(255, 255, 255, 0.70);
    --surface-glass-card: rgba(255, 255, 255, 0.78);
    --surface-glass-modal: rgba(255, 255, 255, 0.90);
    --line-glass: rgba(227, 229, 233, 0.60);
    --glass-highlight: rgba(255, 255, 255, 0.40);
  }

  /* Dark Theme Glass */
  [data-theme="dark"] {
    --ink: #f1f3f7;
    --muted: #9aa1ad;
    --faint: #636a75;
    --line: #2a313d;
    --surface: #171b22;
    --canvas: #0d1117;
    --canvas-gradient: linear-gradient(180deg, #090d16 0%, #1e1b4b 60%, #0d1117 100%);
    --surface-glass: rgba(23, 27, 34, 0.70);
    --surface-glass-card: rgba(23, 27, 34, 0.78);
    --surface-glass-modal: rgba(23, 27, 34, 0.92);
    --line-glass: rgba(255, 255, 255, 0.12);
    --glass-highlight: rgba(255, 255, 255, 0.08);
  }
  ```
- **Readability Guard**: Interactive elements apply `backdrop-blur-md` (12px) to `backdrop-blur-xl` (24px) combined with minimum 70-78% surface opacity so background gradients provide ambience without compromising WCAG AAA text contrast.

## Risks / Trade-offs

- **[Risk: Flash of light mode on page load for dark mode users]** → *Mitigation*: Run synchronous theme detection before React DOM hydration in `index.html` or at the very top of `main.tsx`.
- **[Risk: Rendering slowdown on low-power devices from excessive nested blur layers]** → *Mitigation*: Keep `backdrop-filter` strictly on primary container surfaces (Sidebar, TopBar, Cards, Modals) rather than nested child spans or badges.
- **[Risk: Visual contrast of category badges against glass]** → *Mitigation*: Ensure badge components use semi-opaque background tones with high-contrast foreground text matching existing category specifications.
