# Header system

The Penvo desktop header translates the current MadeByShape header structure
and scroll behavior into the Penvo design system: a near-full-width rounded
frame, brand at the left, centered navigation, and a primary project action
at the right.

## Current scope

- The header is globally fixed at the top of the viewport.
- It appears at the tablet-landscape breakpoint (`1024px`) and above.
- Mobile and tablet-portrait navigation remain intentionally unimplemented and
  the header is hidden below `1024px`.
- The normal frame is transparent, spans the full viewport width, sits flush
  against the top edge, and has a fixed `96px` height.
- Header content has exact `24px` top and bottom padding and `50px` left and
  right padding in the normal state only.
- After `10px` of scrolling, it contracts to `60rem`, gains a `12px` top
  offset, rounded corners, and a dark surface. The compact sticky state uses
  exact `16px` top and bottom padding, `24px` left and right padding, a `15px`
  corner radius, and a resulting `78px` height. It has no additional logo or
  project-action edge offsets.
- After `400px`, it leaves the viewport while scrolling down and returns while
  scrolling up.
- The official Penvo Bright Orange icon is rendered at its natural aspect ratio
  and an exact `40px` height. The `46px` project action, logo, and navigation
  share one vertical center line in both normal and sticky states. Navigation
  and the project action use the existing Navigation and Button typography
  roles. The project action renders the shared primary `ButtonLink` component
  rather than a header-specific design.
- Visible Penvo brand marks use approved image assets, never typed text
  substitutes. This applies to the header and any future footer. Accessible
  names remain required and do not render visible replacement text.
- All surfaces, text, focus, hover, and accent colours use Penvo tokens. The
  desktop navigation underline uses Penvo Bright Orange while its existing
  thickness, movement, and timing remain unchanged.
- Services uses a desktop/tablet-landscape disclosure mega menu based on the
  approved reference behavior. Pointer hover opens it, click/tap toggles it,
  `Escape` closes it and returns focus, and clicking outside dismisses it. The
  menu stays in the normal document interaction model and does not lock or
  replace native page scrolling.
- The Services panel uses a `704px` reference width (`768px` on very wide
  screens), `32px` padding, a `24px` radius, and a `7/12` + `5/12` content
  split. Its visible top edge sits exactly `15px` below both the normal and
  compact sticky header frames. It intentionally omits both the parent-menu
  pointer and the arrow icons from individual options. Its preview uses
  Penvo-owned brand artwork rather than the reference website's photography.
- Opening and closing animate only opacity and transform using shared motion
  tokens. The page backdrop uses the reference `10px` blur, and reduced-motion
  preferences remove the panel travel while preserving immediate state
  feedback.
- Scroll updates are passive and batched through `requestAnimationFrame`.
