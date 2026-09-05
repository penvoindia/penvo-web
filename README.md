# Penvo web

The clean technical foundation for Penvo's future corporate website. Penvo is a
creative and digital agency based in Kerala, India.

This stage contains no homepage, visual direction, navigation, content, or
production animation. The root route is only a temporary foundation guide.

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
- Automated formatting, tests, build, audit, and CI

Read `docs/product-brief.md`, `docs/architecture.md`, `docs/performance.md`, and
`docs/motion.md` before starting the first page. Read `docs/typography.md` before
setting any type, `docs/colors.md` before assigning any color, and
`docs/layout.md` before composing a page or section. Shared controls are
documented in `docs/buttons.md`.
