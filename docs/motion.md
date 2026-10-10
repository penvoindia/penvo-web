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

## Contact greeting

The light homepage contact intro rotates multilingual greetings every 1.6
seconds, with the shared fast opacity-and-transform transition. Hover, focus,
an explicit pause on the greeting, hidden tabs, and offscreen content suspend
rotation. Reduced motion preserves a static greeting. The rest of the section
remains server-rendered. See `docs/home-contact.md` for the reference mapping,
responsive behavior, and lifecycle rules.

## Testimonials

The testimonial cards use native horizontal scrolling with proximity snapping
and measured previous/next controls. Touch, trackpad, and keyboard scrolling
remain native. Reduced motion uses immediate scrolling and removes snapping.
The controls track endpoints through passive scroll events and ResizeObserver;
all observers, listeners, and queued frames are cleaned up on unmount. There
is no autoplay. See `docs/home-testimonials.md` for the responsive composition,
reference mapping, and content placeholders.

## Project gallery

The project gallery reproduces the reference's free-mode slider with native
scrolling. Mouse dragging follows the pointer from the first pixel, leaves
gestures steeper than 45° to the page, and suppresses selection from
pointerdown, including background selection outside the viewport. Past either
end, travel follows the reference's `pull^0.85 - 1` resistance and returns over
600ms. Release momentum uses half-sample velocity over 1000ms with CSS
`ease-out`; a release that would pass an end overshoots by up to 20 times its
velocity and returns over 600ms. These measured durations are local to the
gallery rather than shared motion tokens. A press freezes a glide in place,
while a press past an edge keeps returning to it until dragging takes over;
native wheel, touch, and keyboard input, hidden tabs, profile changes,
resizing, and cleanup stop it. There is no autoplay, looping, or snapping.
Drag input and the custom cursor are enabled only when the rendered cards
overflow by more than one pixel; late images and fonts do not interrupt motion
unless the scroll extent changes. Mouse presses do not assign keyboard focus.
Desktop fine pointers use a section-scoped brand orange cursor that opens from
a 14px dot to 66px and shrinks to 56px when pressed, all over 300ms, following
the mouse with the reference's one-eighth interpolation. Project cards fade a
10px inset Concrete cover in over 300ms on hover or keyboard focus, zoom the
image over 500ms, and raise each text line from a clipped baseline over 500ms
(400ms on leaving). Reduced motion keeps dragging direct and removes momentum,
the cursor, and animated reveals. Card markup stays server-rendered. See
`docs/home-projects.md` for the reference mapping, formulas, and preview
content.
