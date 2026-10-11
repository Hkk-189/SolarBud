---
version: alpha
name: SolarBud
description: "Warm off-white space-weather workspace with a dark frosted application shell and orange telemetry accents."
colors:
  background: "#fcfaf7"
  on-background: "#423d38"
  surface: "#f3f4f6"
  surface-soft: "#edebe9"
  surface-elevated: "#ffffff"
  on-surface: "#423d38"
  on-surface-muted: "#6f665d"
  outline: "#e3e0dd"
  outline-strong: "#d1d5dc"
  primary: "#fe6e00"
  primary-strong: "#ff6b00"
  primary-warm: "#ffb74d"
  primary-focus: "#f97015"
  primary-fill: "#c25100"
  primary-fill-hover: "#a84500"
  on-primary: "#ffffff"
  shell-base: "#000000"
  on-shell: "#ffffff"
  shell-border: "#ffffff"
  success: "#00c758"
  warning: "#edb200"
  danger: "#fb2c36"
  info: "#3080ff"
  g0-bg: "#dcfce7"
  g0-fg: "#016630"
  g1-bg: "#fef9c2"
  g1-fg: "#874b00"
  g1-line: "#874b00"
  g2-bg: "#ffe08a"
  g2-fg: "#6b3d00"
  g3-bg: "#ffe2e2"
  g3-fg: "#9f0712"
  g4-bg: "#c10007"
  g4-fg: "#ffffff"
  g5-bg: "#82181a"
  g5-fg: "#ffffff"
  dark-background: "#413830"
  dark-surface: "#4a423a"
  dark-on-surface: "#fafaf9"
  dark-on-surface-muted: "#b9b3ac"
  dark-g1-line: "#fef9c2"
typography:
  headline-xl:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: "2.5rem"
    letterSpacing: "-0.025em"
  headline-lg:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
  title-md:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.75rem"
  body-lg:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
  body-md:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    lineHeight: "1rem"
  label-md:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  label-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
    letterSpacing: "0.05em"
  code-sm:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
  "3xl": "40px"
  "4xl": "64px"
  container-padding: "32px"
layout:
  container-max: "1400px"
  shell-header-height: "64px"
  shell-sidebar-expanded: "256px"
  shell-sidebar-collapsed: "64px"
motion:
  fast: "150ms"
  normal: "200ms"
  slow: "300ms"
  panel: "500ms"
  easing-standard: "cubic-bezier(0.4, 0, 0.2, 1)"
elevation:
  shell-blur: "12px"
  shell-opacity: "0.70"
  shell-border-opacity: "0.10"
  chart-fill-opacity: "0.60"
shadows:
  subtle: "0 1px 3px rgba(0, 0, 0, 0.10), 0 1px 2px rgba(0, 0, 0, 0.06)"
  raised: "0 4px 12px rgba(0, 0, 0, 0.12)"
  dialog: "0 20px 25px rgba(0, 0, 0, 0.10), 0 8px 10px rgba(0, 0, 0, 0.04)"
components:
  shell-sidebar:
    backgroundColor: "rgba(0, 0, 0, 0.70)"
    textColor: "{colors.on-shell}"
    rounded: "0px"
    width: "{layout.shell-sidebar-expanded}"
    padding: "{spacing.lg}"
  shell-header:
    backgroundColor: "rgba(0, 0, 0, 0.70)"
    textColor: "{colors.on-shell}"
    rounded: "0px"
    height: "{layout.shell-header-height}"
    padding: "0 16px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "rgba(255, 255, 255, 0.70)"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  nav-item-active:
    backgroundColor: "{colors.primary-fill}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
  button-primary:
    backgroundColor: "{colors.primary-fill}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.sm}"
    height: "40px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-fill-hover}"
    textColor: "{colors.on-primary}"
  button-ghost-shell:
    backgroundColor: "transparent"
    textColor: "rgba(255, 255, 255, 0.70)"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    height: "40px"
    width: "40px"
  input-shell:
    backgroundColor: "rgba(255, 255, 255, 0.10)"
    textColor: "{colors.on-shell}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 12px"
  card-panel:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.on-background}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  chart-bar:
    backgroundColor: "rgba(254, 110, 0, 0.60)"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.xs}"
  table-header:
    backgroundColor: "rgba(254, 110, 0, 0.05)"
    textColor: "{colors.primary-fill-hover}"
    typography: "{typography.label-sm}"
    height: "48px"
    padding: "0 16px"
  table-cell:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface-muted}"
    typography: "{typography.body-md}"
    padding: "8px 8px"
  g-badge:
    typography: "{typography.label-sm}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

## Overview
SolarBud is a space-weather forecast dashboard: it shows the current geomagnetic storm level, the Kp forecast with its uncertainty, and the live solar wind, and it explains alerts. Its interface splits its personality into two layers. The workspace itself is light, warm, and document-like: an off-white canvas, neutral cards, restrained borders, and dense but calm content. Around that workspace sits a darker application shell with a frosted-glass feel: black panels at 70% opacity, soft blur, thin white borders, and white navigation text. The product should feel like a modern operations console that borrows a little from premium instrument-panel UI without becoming futuristic chrome.

The emotional target is focused, technical, and slightly premium rather than playful. The UI is not flat-white enterprise software, but it also is not neon cyberpunk. It lives in the middle: calm neutrals for reading and scanning, with orange used as the dominant signal for action, telemetry, hover states, focus states, and brand presence.

Default presentation is light mode. Dark mode exists, but the product identity is still anchored in the light workspace with dark shell framing.

## Colors
The visual identity revolves around warm neutrals plus a concentrated orange band.

- **Background (`#FCFAF7`):** The primary page canvas. It should read as warm paper or light stone rather than stark white.
- **Surface (`#F3F4F6`) and Surface Soft (`#EDEBE9`):** Secondary neutrals for app backgrounds, muted panels, table fills, and low-emphasis containers.
- **Foreground (`#423D38`):** Main copy color. It is dark brown-gray rather than charcoal black, which keeps the UI warmer and softer.
- **Muted Foreground (`#6F665D`):** Metadata, descriptions, secondary labels, and quiet table text. It is slightly darker than the original design's value so it keeps 4.5:1 contrast on Surface Soft.
- **Primary Orange (`#FE6E00` / `#FF6B00`):** The brand and signal color. Use it for chart bars and bands, icons, borders, focus rings, hover glow and brand presence.
- **Primary Fill (`#C25100`, hover `#A84500`):** Orange **behind text**. White on `#FE6E00` is only about 2.8:1, which fails WCAG AA, so filled buttons and the active navigation item use this darker orange (about 4.7:1 with white). Table header text uses the hover shade.
- **Warm Orange (`#FFB74D`):** Gradient or brand warmth. This should be paired with the core orange, not used alone as the main action color.
- **Focus Orange (`#F97015`):** Use for rings, active outlines, and theme-driven highlights.
- **Shell Black (`#000000` rendered at 70% opacity):** Sidebar and top bar are never fully opaque. The shell should feel dark and glassy, not matte black.
- **Storm-level colors (G0 to G5):** Geomagnetic storm severity uses its own semantic scale and **never the brand orange**, so a storm can never be mistaken for a button.
  - G0 quiet: pale green (`#DCFCE7` on `#016630`)
  - G1: pale yellow (`#FEF9C2` on `#874B00`)
  - G2: amber (`#FFE08A` on `#6B3D00`)
  - G3: pale red (`#FFE2E2` on `#9F0712`)
  - G4: red (`#C10007`, white text)
  - G5: dark red (`#82181A`, white text)

  Every pair meets 4.5:1. The badge always shows the text label (for example "G3") as well as the color, so meaning never depends on color alone.

Orange should be visually dominant, but not everywhere. The product works because most surfaces stay neutral and let orange carry state, motion, and emphasis.

## Typography
The system uses the browser's default sans stack rather than a branded webfont. That matters: the voice is practical, fast-loading, and operational, not editorial or highly stylized.

- **Primary typeface:** `ui-sans-serif, system-ui, sans-serif`.
- **Monospace:** `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`. Use it for values such as Kp, speed and timestamps.
- **Page headlines:** Use bold weights and compact hierarchy. The main page title sits at `1.5rem` with strong weight rather than oversized hero typography.
- **Operational labels:** Small uppercase labels, especially in cards and tables, rely on wider tracking to feel structured and machine-like.
- **Body copy:** Standard UI sizing with moderate line height. Text should stay compact enough for dashboards.

Typography should feel crisp and legible first. Avoid decorative fonts, wide-display faces, or soft rounded consumer-product typography.

## Layout & Spacing
The system is built on a familiar 4px Tailwind rhythm, but the page composition behaves more like a dashboard shell around a centered content document.

- **Container max width:** `1400px` centered with `32px` horizontal padding.
- **Shell proportions:** The top bar is `64px` tall. The sidebar is `256px` expanded and `64px` collapsed.
- **Mobile:** Below the `md` breakpoint the sidebar is the `64px` icon rail. Content padding drops to `16px`, and the page never scrolls horizontally.
- **Content rhythm:** Most page sections use `24px` vertical spacing. Metric cards and multi-column blocks use `16px` gaps.
- **Card padding:** Standard content cards use `24px` internal padding.
- **Table density:** Tables are relatively compact. Headers are `48px` tall, and cells rely on small body text and narrow padding.

This is not a sparse marketing layout. Density is moderate, but spacing is consistent and never cramped.

## Elevation & Depth
Depth comes from two different strategies depending on the layer.

- **Application shell:** The sidebar and header use blur plus transparency. They should feel like dark glass laid over the workspace.
- **Workspace cards:** Cards use subtle borders and standard UI shadows, but remain visually quiet. They should not look glossy or heavy.
- **Dialogs, dropdowns, and sheets:** These can use stronger shadows than normal cards, but should stay within the same neutral/orange system.
- **Charts and telemetry bars:** Orange fills use opacity rather than full saturation so they integrate with the quiet surrounding panels.

The product should never feel flat, but the depth model is restrained. Use blur for chrome, soft shadows for surfaces, and border definition everywhere else.

## Shapes
Corner treatment is consistent and slightly softened, but never bubbly.

- **Base control radius:** `8px`.
- **Tight controls / inputs:** `6px`.
- **Cards:** `12px`.
- **Pills and badges:** fully rounded.
- **Chrome panels:** square-edged at the macro level, with rounding reserved for internal interactive elements.

This should feel sturdy and contemporary. Avoid sharp corners on controls, but do not push the product into overly rounded consumer-app territory.

## Components
### Shell
The sidebar and top bar are the strongest visual signature. They are black at 70% opacity with a 12px blur and a faint white border. Text inside them is white or white at reduced opacity. Active navigation items take a solid Primary Fill with white text; hovered items take a translucent white fill.

### Buttons
Primary buttons use Primary Fill with white text. The shape is compact and practical, not oversized. Ghost buttons inside the shell remain transparent until hover, then take on translucent white states.

### Inputs
There are two input personalities:

- **Shell inputs:** translucent white-on-dark, used in the header.
- **Surface inputs:** neutral border inputs on white cards, used in forms such as subscription settings.

Both should preserve clean rectangular geometry and avoid deep inset styling.

### Cards
Most analytical content sits in neutral cards with soft shadows and thin borders. Cards are readable first and decorative second. Metric cards, chart cards, and table cards should all feel like members of the same quiet surface family.

### Tables
Tables use the neutral base: thin borders, compact rows, and a header with a faint orange tint and Primary Fill (hover shade) label text.

### Storm-level badges
Storm badges are the most important semantic cue in the product. They are pills using the G0 to G5 pairs above, carry the level text ("G0" to "G5"), and show "No data" in a neutral style when the level is unknown.

### Charts
Charts always show units on their axes, offer a UTC / local-time toggle, and draw forecast uncertainty (the p10 to p90 band) as a translucent orange area at 60% opacity with the median line on top. Chart colors outside orange stay within the neutral and semantic palette.

### Footer
Every page ends with the disclaimer "Not an official forecast. See NOAA SWPC", linked to https://www.swpc.noaa.gov.

## Do's and Don'ts
- Do keep the primary experience light, warm, and operational.
- Do use the dark frosted shell as a framing device around the workspace.
- Do let orange drive action, hover, focus, telemetry, and brand emphasis.
- Do put white text only on Primary Fill, never on the bright brand orange.
- Do preserve compact system-sans typography and restrained spacing.
- Do use white or translucent white inside the shell rather than warm gray text.
- Do keep analytical cards quiet so charts, labels, and findings can stand out.

- Don't replace the warm neutrals with pure white and cool grays.
- Don't introduce additional saturated brand colors beyond the established orange and semantic palette.
- Don't use the brand orange for storm severity.
- Don't turn the entire product into a dark dashboard; only the chrome should feel like dark glass by default.
- Don't make every card solid orange, heavily tinted, or dramatically shadowed.
- Don't swap in trendy geometric or editorial fonts; the system should remain practical and native-feeling.
