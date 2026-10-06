# Performance contract

## Core Web Vitals targets

- Largest Contentful Paint: at most 2.5 seconds
- Interaction to Next Paint: at most 200 milliseconds
- Cumulative Layout Shift: at most 0.1

## Initial route budgets

- JavaScript: at most 120 KB compressed
- CSS: at most 40 KB compressed

## Implementation rules

- Keep routes server-rendered unless interactivity requires a client component.
- Set intrinsic dimensions or aspect ratios for every image and video.
- Use `next/image` for responsive raster images and prefer AVIF/WebP.
- Load third-party scripts only after consent and only when their value is clear.
- Lazy-load below-the-fold media and expensive interactive modules.
- Treat every new dependency as part of the performance budget.
