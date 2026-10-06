# Motion foundation

Motion should explain hierarchy and state, never delay access to information.

## Rules

- Prefer transform and opacity animations that avoid layout and paint work.
- Use the shared duration and easing tokens in `src/styles/motion.css`.
- Avoid permanent `will-change`; apply it only immediately before an animation.
- Avoid scroll hijacking. Native scrolling remains the baseline.
- Never make essential information dependent on an animation completing.
- Every future interaction must work with reduced motion enabled.
- Add a motion library only after a concrete animation cannot be expressed
  cleanly with CSS or the Web Animations API.

## Current navigation pattern

- The mobile/tablet-portrait drawer fades its surface, then reveals route links
  with a short transform-and-opacity stagger. The project action follows the
  route links.
- Closing prioritizes immediate control: the surface fades without requiring a
  reverse content sequence.
- Reduced motion removes transforms, transition delays, and icon movement; menu
  state still changes immediately and remains fully operable.

## Home hero

The hero uses a bounded canvas particle field and a rotating accent word.
Squares spread into free flow once on first start and retain their live positions
while resizing, easing toward the new layout in the same animation loop.
Reduced motion keeps particles static and the heading readable; arrangement
and viewport changes are immediate. Offscreen and hidden
tabs suspend motion. Particle density and frame rate scale down on mobile and
portrait tablets. See `docs/home-hero.md` for the implementation brief, reference
mapping, and rendering budgets.

## Let’s build

The second homepage section uses native sticky positioning and scroll progress
to bring two words together, trigger a brief impact, and disperse text fragments.
It shares the existing typography, colour, and easing tokens. Reduced motion
and no-JavaScript browsing use an unpinned, readable heading and caption.
The user's explicit reference-parity request adds section-scoped Lenis wheel
smoothing, which stops when inactive and is disabled for reduced motion.
Touch and keyboard navigation stay native, and the native mouse cursor is
preserved. Wheel smoothing remains local to this section.
See `docs/home-build.md` for the sequence, section-specific timing, and cleanup.

## Work together marquee

The homepage contact marquee uses two CSS transform loops moving in opposite
directions at a measured 90px per second. Hidden tabs pause automatically and
reduced motion renders a static offset composition. Fine mouse pointers use a
section-scoped 96px favicon follower while the native arrow is hidden over the
section. See `docs/home-work-together.md` for its reference measurements and
responsive rules.

## Home process

The homepage process section uses native vertical scrolling to move a sticky
horizontal track through six connected stages. Its travel distance is measured
from the rendered track, updated through one animation frame per scroll event,
and recalculated for viewport, content, and font changes. Mobile and reduced
motion layouts present the same stages as a readable vertical sequence without
pinning or translation. See `docs/home-process.md` for the motion brief and
responsive behavior.
