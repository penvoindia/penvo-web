# Layout system

Penvo uses a centered, fluid page frame inspired by the structural rhythm of
Elephant Skin. Only its layout principles are carried forward: a wide maximum
canvas, proportional gutters, restrained content widths, responsive columns,
and viewport-aware section spacing.

## Reference translation

The reference uses a `1700px` maximum section width, horizontal spacing close
to `5%`, and layout changes around `750px`, `1000px`, and `1440px`. Penvo keeps
the `1700px` frame and fluid gutters below desktop, then uses a fixed `50px`
desktop gutter to align page content with the normal header. Responsive changes
map to the four project-wide breakpoints already shared with typography:

| Tier             | Viewport      | Gutter                   | Columns | Gap    | Section space |
| ---------------- | ------------- | ------------------------ | ------- | ------ | ------------- |
| Mobile           | `0–767px`     | `clamp(20px, 5vw, 38px)` | 4       | `16px` | `60px`        |
| Tablet portrait  | `768–1023px`  | `clamp(38px, 5vw, 51px)` | 8       | `20px` | `80px`        |
| Tablet landscape | `1024–1279px` | `clamp(51px, 5vw, 64px)` | 12      | `24px` | `96px`        |
| Desktop          | `1280px+`     | `50px`                   | 12      | `32px` | `120px`       |

Mobile and tablet gutters remain fluid. Desktop uses the deliberate `50px`
alignment shared with the header's internal left and right padding.

## Shared primitives

- `.layout-container` — centered `1700px` maximum frame with responsive gutters
- `.layout-container--full` — full-width frame that preserves the gutters
- `.layout-container--narrow` — constrained `1024px` content frame
- `.layout-section` — standard responsive vertical section spacing
- `.layout-section--compact` and `.layout-section--large` — intentional spacing variants
- `.layout-grid` — 4, 8, or 12 responsive columns using the shared gap
- `.layout-stack` — vertical flow controlled with `--layout-stack-gap`
- `.layout-cluster` — wrapping horizontal flow controlled with `--layout-cluster-gap`
- `.layout-copy` — readable `720px` maximum text measure
- `.layout-viewport` — stable minimum viewport height using `100svh`

Use these primitives for page structure. Component styles should control only
the component's internal arrangement and exceptional layout needs.
