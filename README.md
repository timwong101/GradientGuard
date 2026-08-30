# GradientGuard

**Readable gradients, measured everywhere.**

GradientGuard is an accessibility-first gradient editor for designers and developers. Ordinary contrast checkers compare two solid colors, while gradient tools often inspect only a midpoint. Both approaches can miss a small but important region where text becomes unreadable.

GradientGuard samples the full rectangular region occupied by the preview text, reports the worst sampled contrast, visualizes unsafe regions, and finds the least invasive practical correction.

## Screenshot

![GradientGuard desktop workbench](./gradientguard-preview.png)

## What it does

- Edits linear gradients with reusable presets and movable color stops
- Configures representative text, typography, color, alignment, position, and frame size
- Samples rendered canvas pixels beneath the text after a short debounce
- Reports an estimated WCAG 2.2 AA result, worst ratio and location, and passing coverage
- Shows an optional low-opacity contrast heatmap
- Tries black and white text, then binary-searches for the minimum black or white scrim when needed
- Exports production-ready CSS and shares validated, versioned state through the URL
- Keeps changes local and supports undo/redo

## Contrast analysis

Color channels are linearized from sRGB, converted to relative luminance, and compared with `(lighter + 0.05) / (darker + 0.05)`. Normal text targets `4.5:1`; text at least 24px regular or 18.5px bold targets `3:1`.

The preview gradient is rendered to a device-pixel-ratio-aware canvas. GradientGuard reads a grid of pixels across the DOM text rectangle so the displayed and measured backgrounds share the same rendering source. For correction, it first checks black and white text. If neither passes on every point, a deterministic binary search finds the minimum contrasting scrim opacity.

The text rectangle includes transparent glyph areas and is therefore intentionally conservative. Results are estimates and do not constitute formal accessibility certification.

## Architecture

`Editor state → Canvas renderer → Pixel sampler → Contrast engine → Fix optimizer → Exporter`

React's `useReducer` owns editor state and a bounded undo history. Pure modules contain color math, gradient interpolation, contrast thresholds, scrim optimization, and URL serialization. UI components stay focused on rendering and interaction.

## Local setup

Requires a current Node.js release.

```bash
pnpm install
pnpm dev
```

Open the localhost URL printed by Vite. No account, backend, API key, or network connection is used by the application itself.

## Tests

```bash
pnpm test
pnpm run build
pnpm exec playwright install chromium
pnpm run test:e2e
```

The unit suite covers luminance, known contrast ratios, large-text thresholds, gradient interpolation, minimum scrim search, URL validation, and history. Playwright covers the primary edit → move → detect → correct → export workflow.

## Known limitations

- Linear gradients only; no radial, mesh, animated, or image backgrounds
- A conservative rectangular text region rather than glyph-outline sampling
- Browser canvas rendering can vary slightly by color profile and device
- CSS export uses a full-frame scrim rather than a localized overlay
- The tool is a design aid, not an official WCAG certification service

## Privacy

All rendering, analysis, correction, history, and URL encoding happen in the browser. GradientGuard has no backend, analytics, accounts, or cloud persistence.

## Future ideas

Radial gradients, image backgrounds, APCA analysis, glyph-aware or localized overlays, expanded export formats, and a future Figma integration are natural extensions after the core workflow is validated.
