# Header system

The Penvo responsive header adapts [MadeByShape](https://madebyshape.co.uk/)
across all four breakpoints. Desktop and tablet landscape use the full
navigation; mobile and tablet portrait contract to a logo-and-menu frame.
Further main-menu drawer design is on hold; its existing implementation is
preserved for the next stage. Navbar Digital informs only the hamburger icon.

## Current scope

- The header is globally fixed at the top of the viewport.
- Mobile (`0–767px`) uses an `80px` normal header and a `64px` compact header.
  Tablet portrait (`768–1023px`) uses `88px` and `72px` respectively. The
  compact frame has an `8px` top offset on mobile and `12px` on tablet portrait.
  Both contract from full width to a centered `320px` frame, capped at `99vw`
  on narrow screens, with the approved `15px` radius. This follows the
  reference's compact mobile arrangement with more room than its `256px` frame.
- Mobile and tablet portrait display the official logo and menu control. The
  header project action appears with the full desktop navigation at `1024px`.
- The menu control is the shared secondary Penvo `Button`, sized to `46px`
  wide and `40px` high, matching the logo height in both normal and sticky
  mobile/tablet-portrait headers, with the `20px` three-line hamburger. Its open
  state uses the matching close icon. Both icons are decorative; the button
  exposes its state through `aria-expanded`, `aria-controls`, and a changing
  accessible name.
- The normal desktop/tablet-landscape frame is transparent, spans the full
  viewport width, sits flush against the top edge, and has a fixed `96px`
  height. Header content has exact `24px` top and bottom padding and `50px`
  left and right padding in this normal state only.
- On desktop and tablet landscape, after `10px` of scrolling it contracts to
  `1120px` (increased from `960px`), capped at `99vw`, and gains a `12px` top
  offset, rounded corners, and a dark surface. This
  compact state uses exact `16px` top and bottom padding, `24px` left and right
  padding, a `15px` corner radius, and a resulting `78px` height. It has no
  additional logo or project-action edge offsets.
- After `400px`, it leaves the viewport while scrolling down and returns while
  scrolling up at every breakpoint. Keyboard focus also reveals a hidden
  header.
- All breakpoints share the same `600ms` frame transition and easing, and the
  same dark, translucent sticky surface with `10px` backdrop blur. The
  `1000ms` hide/return movement retains the approved reference timing.
  Responsive height and padding adapt the frame around Penvo's existing logo
  and button sizes. Reduced motion removes both transitions.
- The official Penvo Bright Orange icon is rendered at its natural aspect ratio
  and an exact `40px` height. The `46px` project action, logo, and navigation
  share one vertical center line in both normal and sticky states. Navigation
  and the project action use the existing Navigation and Button typography
  roles. The project action renders the shared primary `ButtonLink` component
  rather than a header-specific design, using the standard Button metrics of
  `16px / 24px / -0.4px`.
- Visible Penvo brand marks use approved image assets, never typed text
  substitutes. This applies to the header and any future footer. Accessible
  names remain required and do not render visible replacement text.
- All surfaces, text, focus, hover, and accent colours use Penvo tokens. Header
  navigation hover, keyboard-focus, open-Services, and current-route states use
  a Penvo Bright Orange square on the label's left instead of an underline.
  The square is `14px × 14px`, reveals from left to right through transform and
  opacity, and shifts the label right by `20px` without changing document
  layout. Header menu labels use the secondary Hanken Grotesk font at `16px /
24px / 500 / -0.4px`, with a `20px` tablet-landscape gap that increases to
  `30px` on desktop.
- The responsive drawer is fixed beneath the header, fills `100dvh`, uses a
  near-opaque Pure Black surface, and allows internal scrolling on short
  screens. Its five route links retain the Navigation typography role and the
  same orange-square current, hover, and keyboard-focus treatment. The project
  action follows the links using the shared primary button.
- Opening the drawer focuses its first link. `Escape`, the menu control, and a
  pointer press on the empty drawer surface close it; focus returns to the
  control for dismissals and does not interrupt route navigation. While open,
  the stable `#site-content` wrapper is inert and body scrolling is locked.
  Cleanup always restores the captured scroll position, including current-route
  and breakpoint edge cases.
- Services uses a desktop/tablet-landscape disclosure mega menu based on the
  approved reference behavior. Pointer hover opens it, click/tap toggles it,
  `Escape` closes it and returns focus, and clicking outside dismisses it. The
  menu stays in the normal document interaction model and does not lock or
  replace native page scrolling.
- Hover dismissal belongs to the complete Services region, not the dropdown
  panel in isolation. A pending close rechecks both pointer hover and keyboard
  focus before changing state, preventing brief boundary crossings from
  dismissing an actively used menu. The Services label has a `46px`-high
  invisible pointer target while its visible typography and position remain
  unchanged. Touch pointers never use hover dismissal, and residual scrolling
  cannot hide an actively hovered or focused menu.
- The Services panel uses a `736px` reference width (`800px` on very wide
  screens), `30px` padding, a `15px` radius, and a `7/12` + `5/12` content
  split. Individual service hover surfaces, the “View all services” card, and
  its image section use a `10px` radius. Its visible top edge sits exactly
  `15px` below both the normal and compact sticky header frames. It
  intentionally omits both the parent-menu pointer and the arrow icons from
  individual options. Its preview uses Penvo-owned brand artwork rather than
  the reference website's photography.
- The “View all services” content and image have a minimum vertical gap of
  `20px`, while the card itself has `22px` internal padding. Its title and
  description use a `6px` gap. The card uses distributed vertical space, so
  its text-to-image separation grows naturally when additional services make
  the dropdown taller.
- Service options are distributed from the top to the bottom of the adjacent
  card. Their separation therefore responds to the card height instead of
  relying on a fixed inter-option gap, while each option retains its `64px`
  minimum interaction height and `12px` top and bottom padding.
- Dropdown service titles use the dedicated Heading 7 role at `18px`, with a
  `26px` line height and `-0.45px` tracking at the supported header
  breakpoints. The “View all services” title uses Heading 6 (`20px / 28px /
-0.5px`).
- Opening and closing animate only opacity and transform using shared motion
  tokens. The desktop Services backdrop uses the reference `10px` blur. The
  mobile drawer avoids a full-screen blur for lower paint cost, and reduced
  motion removes all drawer travel, stagger delays, and icon transforms while
  preserving immediate state feedback.
- Scroll updates are passive and batched through `requestAnimationFrame`.
