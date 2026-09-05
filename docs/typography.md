# Penvo typography

## Font families

- Primary: Bricolage Grotesque — display, headings, section titles, navigation,
  buttons, labels, eyebrows, and microcopy.
- Secondary: Hanken Grotesk — lead text, paragraphs, captions, and long-form
  reading.

Both variable fonts are sourced from Google Fonts through `next/font/google`,
preloaded, optimized during the build, and served by the website.

## Reference translation

This guide was audited against [Navbar Digital](https://navbardigital.com/) on
1 September 2026. The reference uses Bricolage Grotesque for display, Hanken
Grotesk for body text, JetBrains Mono for utilities, and a decorative signature
font. Penvo keeps the reference hierarchy while using only its two approved
families:

- Reference display → Penvo Bricolage Grotesque
- Reference body → Penvo Hanken Grotesk
- Reference mono utilities → Penvo Bricolage Grotesque
- Reference decorative treatment → Penvo Bricolage Grotesque when needed

All fixed measurements and fluid boundaries use pixels. `vw` is used only to
interpolate display typography between the pixel boundaries of each breakpoint.

## Breakpoints

| Viewport         | Width         | CSS behavior                 |
| ---------------- | ------------- | ---------------------------- |
| Mobile           | `0–767px`     | Default, mobile-first values |
| Tablet portrait  | `768–1023px`  | `@media (min-width: 768px)`  |
| Tablet landscape | `1024–1279px` | `@media (min-width: 1024px)` |
| Desktop          | `1280px+`     | `@media (min-width: 1280px)` |

## How to read the charts

Each breakpoint value is written as:

`font size / line height / letter spacing`

Ranges indicate fluid interpolation inside that breakpoint.

## Display chart

All display roles use Bricolage Grotesque at weight 800 with natural casing.

| Class                 | Mobile                                 | Tablet portrait                          | Tablet landscape                           | Desktop                                    |
| --------------------- | -------------------------------------- | ---------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| `.type-display-mega`  | `48–84px / 44–77px / -1.44 to -2.52px` | `84–112px / 77–103px / -2.52 to -3.36px` | `112–141px / 103–130px / -3.36 to -4.23px` | `141–192px / 130–177px / -4.23 to -5.76px` |
| `.type-display-giant` | `40–58px / 37–53px / -1.2 to -1.74px`  | `58–77px / 53–71px / -1.74 to -2.31px`   | `77–96px / 71–88px / -2.31 to -2.88px`     | `96–112px / 88–103px / -2.88 to -3.36px`   |
| `.type-display-huge`  | `32–38px / 29–35px / -0.96 to -1.14px` | `38–51px / 35–47px / -1.14 to -1.53px`   | `51–64px / 47–59px / -1.53 to -1.92px`     | `64–72px / 59–66px / -1.92 to -2.16px`     |
| `.type-section-title` | `44px / 40px / -1.32px`                | `44px / 40px / -1.32px`                  | `44–54px / 40–50px / -1.32 to -1.62px`     | `54–76px / 50–70px / -1.62 to -2.28px`     |

## Heading chart

All heading roles use Bricolage Grotesque with natural casing.

| Class             | Weight | Mobile                  | Tablet portrait         | Tablet landscape        | Desktop                 |
| ----------------- | ------ | ----------------------- | ----------------------- | ----------------------- | ----------------------- |
| `.type-heading-1` | 800    | `40px / 44px / -1.2px`  | `48px / 48px / -1.44px` | `52px / 52px / -1.56px` | `60px / 60px / -1.8px`  |
| `.type-heading-2` | 800    | `36px / 40px / -1.08px` | `40px / 44px / -1.2px`  | `44px / 48px / -1.32px` | `48px / 48px / -1.44px` |
| `.type-heading-3` | 700    | `30px / 36px / -0.75px` | `32px / 36px / -0.8px`  | `34px / 40px / -0.85px` | `36px / 40px / -0.9px`  |
| `.type-heading-4` | 700    | `24px / 32px / -0.6px`  | `28px / 34px / -0.7px`  | `28px / 36px / -0.7px`  | `30px / 36px / -0.75px` |
| `.type-heading-5` | 600    | `20px / 28px / -0.5px`  | `22px / 30px / -0.55px` | `24px / 32px / -0.6px`  | `24px / 32px / -0.6px`  |
| `.type-heading-6` | 600    | `18px / 24px / -0.45px` | `18px / 26px / -0.45px` | `20px / 28px / -0.5px`  | `20px / 28px / -0.5px`  |

## Reading chart

All reading roles use Hanken Grotesk at weight 400, natural casing, and `0px`
letter spacing.

| Class              | Mobile        | Tablet portrait | Tablet landscape | Desktop       |
| ------------------ | ------------- | --------------- | ---------------- | ------------- |
| `.type-lead`       | `20px / 28px` | `22px / 30px`   | `24px / 32px`    | `24px / 32px` |
| `.type-body-large` | `18px / 28px` | `18px / 28px`   | `18px / 28px`    | `18px / 28px` |
| `.type-body`       | `16px / 24px` | `16px / 24px`   | `16px / 24px`    | `16px / 24px` |
| `.type-body-small` | `14px / 20px` | `14px / 20px`   | `14px / 20px`    | `14px / 20px` |
| `.type-caption`    | `12px / 16px` | `12px / 16px`   | `12px / 16px`    | `12px / 16px` |

## Interface chart

Interface roles intentionally remain stable across all four breakpoints.

| Class              | Family    | Weight | Size   | Line height | Letter spacing | Case      |
| ------------------ | --------- | ------ | ------ | ----------- | -------------- | --------- |
| `.type-eyebrow`    | Bricolage | 500    | `12px` | `16px`      | `3.36px`       | Uppercase |
| `.type-label`      | Bricolage | 600    | `12px` | `16px`      | `1.2px`        | Uppercase |
| `.type-button`     | Bricolage | 600    | `14px` | `20px`      | `0.35px`       | Natural   |
| `.type-navigation` | Bricolage | 600    | `14px` | `20px`      | `0.35px`       | Natural   |
| `.type-micro`      | Bricolage | 500    | `10px` | `14px`      | `2.4px`        | Uppercase |

## Rules

- Apply the semantic class matching the content's role; do not style by visual
  resemblance alone.
- Do not add component-level breakpoint font overrides. Change the central
  tokens and this guide together.
- Do not set one-off font sizes, weights, line heights, or letter spacing when a
  defined role fits.
- Display roles are for short phrases. Use heading roles for ordinary content
  hierarchy.
- Hanken Grotesk is the default reading font. Bricolage Grotesque is the brand
  and interface voice.
- Do not introduce another font without changing this guide first.
