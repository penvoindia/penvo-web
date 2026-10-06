# Architecture

## Principles

- Server Components are the default. Add client boundaries only around genuine
  browser interaction.
- Every route owns its content and route-level composition. Shared primitives
  live under `src/`.
- Do not add a state library, animation runtime, CMS client, analytics SDK, or
  component framework before a confirmed requirement exists.
- Prefer platform capabilities and progressive enhancement over JavaScript.
- Keep environment access centralized and validated.

## Directories

- `app/` — routing, layouts, metadata, and route-level assets
- `src/components/` — reusable, accessible interface components
- `src/config/` — immutable application configuration
- `src/lib/` — framework-independent utilities
- `src/styles/` — global reset, color, typography, layout, and motion foundations
- `tests/` — fast foundation and contract tests
- `docs/` — product and engineering decisions

The root route begins the homepage with the approved reference-inspired hero.
The temporary foundation guide remains available at `/design-guide` while the
website is built one decision at a time. Homepage components live under
`src/components/home/`; browser motion is isolated from server-rendered copy.
The hero is followed by `HomeBuild`, the scroll-driven “Let’s build” section.
`HomeServices` overlaps its final quiet tail for a continuous visual handoff,
then `HomeWorkTogether` provides the contact marquee. `HomeProcess` follows it
with server-rendered process content and a small client controller for the
desktop and tablet horizontal scroll progression.
