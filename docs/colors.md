# Penvo color system

The website uses a dark theme. The approved palette is the only source of color
tokens; semantic roles must point back to one of these values.

## Brand palette

| Brand name       | CSS token                  | Hex       | RGB             | Brand role |
| ---------------- | -------------------------- | --------- | --------------- | ---------- |
| Bright Orange    | `--color-bright-orange`    | `#FF400C` | `255, 64, 12`   | Primary    |
| Pink Affair      | `--color-pink-affair`      | `#FFEFE8` | `255, 239, 235` | Accent     |
| Full White       | `--color-full-white`       | `#FFFFFF` | `255, 255, 255` | Foundation |
| Concrete         | `--color-concrete`         | `#F2F2F2` | `242, 242, 242` | Secondary  |
| Smooth Grey      | `--color-smooth-grey`      | `#CCCCCC` | `204, 204, 204` | Secondary  |
| Super Grey       | `--color-super-grey`       | `#999999` | `153, 153, 153` | Secondary  |
| Attractive Black | `--color-attractive-black` | `#222222` | `34, 34, 34`    | Foundation |
| Pure Black       | `--color-pure-black`       | `#000000` | `0, 0, 0`       | Primary    |

## Dark-theme roles

| Purpose                | Semantic token                      | Brand color      |
| ---------------------- | ----------------------------------- | ---------------- |
| Page background        | `--color-background`                | Pure Black       |
| Primary surface        | `--color-surface-primary`           | Pure Black       |
| Raised surface         | `--color-surface-secondary`         | Attractive Black |
| Accent surface         | `--color-surface-accent`            | Pink Affair      |
| Primary text           | `--color-text-primary`              | Full White       |
| Secondary text         | `--color-text-secondary`            | Smooth Grey      |
| Muted text             | `--color-text-muted`                | Super Grey       |
| Accent text            | `--color-text-accent`               | Pink Affair      |
| Primary action         | `--color-action-primary`            | Bright Orange    |
| Text on primary action | `--color-action-primary-foreground` | Pure Black       |
| Focus indicator        | `--color-focus-ring`                | Bright Orange    |
| Subtle border          | `--color-border-subtle`             | Attractive Black |
| Strong border          | `--color-border-strong`             | Super Grey       |

## Accessibility rules

- Use Pure Black text on Bright Orange. This pairing has a contrast ratio of
  `5.99:1`; Full White on Bright Orange is only `3.51:1` and is unsuitable for
  normal-sized text.
- Full White, Pink Affair, Smooth Grey, Super Grey, and Bright Orange all meet
  normal-text contrast requirements on Pure Black.
- Attractive Black is a surface color. Do not use it for text or meaningful
  boundaries against Pure Black.
- Use semantic tokens in components. Do not copy hex values outside
  `src/styles/colors.css`.
