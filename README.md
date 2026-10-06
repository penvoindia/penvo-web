# Penvo web

The clean technical foundation for Penvo's future corporate website. Penvo is a
creative and digital agency based in Kerala, India.

The root route contains a particle hero adapted from the local Elephant Skin
reference, followed by a “Let’s build” scroll section inspired by the local
Navbar Digital reference. Both use Penvo's design system. The temporary
foundation guide is preserved at `/design-guide`. Messaging is working copy;
remaining homepage sections and CTA destinations are future stages.

## Requirements

- Node.js 24.20.0 LTS
- npm 11.19.0

## Commands

```bash
nvm use
npm install
npm run dev
npm run check
npm run build
npm run ci
```

## Foundation

- Next.js App Router through Vinext
- React Server Components by default
- Strict TypeScript and zero-warning linting
- Performance and security guardrails
- Motion tokens with reduced-motion support
- Bricolage Grotesque and Hanken Grotesk typography system
- Dark theme using the approved Penvo color system
- Official image assets for visible header and footer brand marks; no
  text-based logo substitutes
- Responsive 1700px layout frame, gutters, section rhythm, and column grid
- Reusable Penvo button with the approved typography and interaction states
- Responsive header, sticky behavior, desktop Services disclosure, and
  mobile/tablet-portrait navigation drawer
- Homepage particle hero with responsive typography, visual arrangement
  controls and reduced-motion support
- “Let’s build” scroll section with native sticky positioning, impact/shatter
  motion, and an unpinned reduced-motion fallback
- Automated formatting, tests, build, audit, and CI

Read `docs/product-brief.md`, `docs/architecture.md`, `docs/performance.md`, and
`docs/motion.md` before starting the first page. Read `docs/typography.md` before
setting any type, `docs/colors.md` before assigning any color, and
`docs/layout.md` before composing a page or section. Shared controls are
documented in `docs/buttons.md`.
The home hero and its reference mapping are documented in `docs/home-hero.md`.
The second homepage section is documented in `docs/home-build.md`.
