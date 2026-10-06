# Let’s build — homepage section two

`HomeBuild` follows `HomeHero` on `/`. The local Navbar Digital reference in
`/Users/anas/Downloads/navbardigital` supplies the interaction reference. The
current implementation ports the supplied project's `CollisionSection.tsx`
geometry and timeline (available in its production source map) rather than the
older research capture, which has a different fracture pattern. No reference
branding or assets are included. The running reference is `http://localhost:3003/`;
Penvo currently runs at `http://localhost:3001/`.

## Design

- A black, viewport-height stage holds “Let’s build” in the shared
  `type-display-mega` family and weight: Bricolage Grotesque 800. Local reference
  metrics are 48–192px size, 44.16–176.64px line-height, and -1.44 to -5.76px
  tracking, with a quarter-font-size word gap. Optical size is explicitly 14
  and width 100 to match the reference's Google font instance; automatic
  optical sizing otherwise makes this display headline visibly narrower.
- “Let’s” is Full White and “build” is Bright Orange.
- Penvo copy beneath the collision reads “Where ideas become impact”,
  using Penvo's primary family with reference 11.52px size, 17.28px line-height,
  3.2256px tracking, and weight 400. The decorative scroll hint is 12px/16px,
  1.2px tracking, weight 400. No third-party font is introduced.
- The content sizes to its contents with the reference's 24px inline padding.
  The caption sits 32px below the heading. Shorter Penvo copy can wrap differently
  from the reference caption on mobile. There is no extra
  CTA in this section; the reference section is a typographic transition.
- Mobile and both tablet orientations retain the two-word composition. Eight
  asymmetric spark trajectories match the reference burst; the stage clips overflow.

## Motion brief

The sequence responds to native scroll over the reference's `340vh` section
containing a `100vh` CSS-sticky stage. Following the explicit request to match
wheel scrolling as well, the section now loads Lenis 1.3.26 on approach. There
is no scroll lock; touch and keyboard scrolling stay native.

1. At 0–42% progress, the words travel inward from opposite sides, with a
   slight skew. A small overshoot settles at 45%.
2. Crossing 45% creates a 900ms expanding outline, eight 800ms sparks with
   15ms staggering, and a 500ms impact/shake. The orange surface pulse starts
   at the reference's 35% opacity. The caption reveals over 600ms after a 250ms delay.
3. At 62%, ten stationary clipped copies replace the visible heading. Their
   fixed radial wedge clips use the exact local component perimeter and centroid
   origins. Start progress staggers by 0.012 per wedge; fall distance uses the
   reference's 82vh distance formula. They fade during the final 40% of their
   individual travel, fading completely by 96%.
4. The caption fades from 62–70% and drops as the fragments disperse. Reverse
   scrolling restores the exact poses. As in the local component, reversing below
   45% resets the impact and fades the caption over 600ms; crossing 45% again
   replays it. Restoring scroll position never flashes the screen.

The impact uses native Web Animations and `--motion-ease-enter`, with `ease-out`
for the surface pulse and each individual shake segment (not the entire shake
timeline). The durations
above are section-specific reference timings, not new global motion tokens.
Clips stay fixed during motion; only transforms and opacity animate.

The “Scroll to explore” label sits 40px from the top, matching the bottom
spacing of “Keep scrolling”. It fades out over 2–8% of section progress.
After a gap, “Keep scrolling” fades in over 10–14% and out over 18–30%, so
the labels never overlap. Both are hidden in the static/reduced-motion layout.

## Wheel and pointer behaviour

- `build-scroll.ts` uses the local `SmoothScroll.tsx` values: 1.1 seconds,
  `min(1, 1.001 - 2 ** (-10 * t))`, and smooth wheel input. Using the same small
  runtime is justified here by the explicit request for matching wheel physics;
  CSS `scroll-behavior` cannot smooth wheel input equivalently.
- Unlike the reference's whole-site wrapper, the wheel event target is this
  section only. The hero, header and other routes retain their existing input
  behaviour. Ctrl/Meta-wheel zoom is not intercepted. Native navigation keys
  interrupt remaining wheel inertia without preventing their default action.
- The scroll chunk loads near the section, never under reduced motion, and
  destroys its instance when offscreen, hidden, or unmounted. Animation frames
  run during wheel settling, not permanently while the page is idle.
- The native mouse cursor is preserved throughout the section.

Lenis integration follows the [maintainer's API documentation](https://github.com/darkroomengineering/lenis).

## Accessibility and performance

- One semantic, server-rendered `h2` names the section. Fragments, sparks, and
  the scroll hint are hidden from assistive technology.
- With JavaScript unavailable or reduced motion requested, show a readable,
  unpinned heading and caption with 112px vertical padding (144px from 640px).
  Live preference
  changes cancel effects and restore the static layout.
- Coalesce passive scroll events into one animation frame, with one section
  geometry read followed by DOM writes. No React state updates per frame and
  no continuously running scroll loop.
- Cancel pending frames and impact animations when offscreen, in hidden tabs,
  on preference changes, and on unmount. Disconnect observers and listeners.
- Static fragment copies are the intentional cost of the shatter effect:
  ten text layers and no image/video downloads. Lenis is a separate, lazily loaded
  chunk, not part of the initial section controller.

`tests/build-motion.test.ts` covers source geometry/stagger parity, responsive
poses, real resize callbacks, collision/shatter handoff, reverse/replay,
restored scroll position, coalesced frames, reduced motion, and cleanup.
`tests/build-input.test.ts` covers wheel settings, idle-frame shutdown, keyboard
interruption, and browser zoom. Fresh visual verification of the wheel
integration remains pending from the original implementation session.

The following services section overlaps the final blank tail by its normal top
spacing plus a small viewport-based handoff. Its eyebrow therefore enters from
the bottom while the last shards finish fading, without changing the approved
collision, wheel, touch, or keyboard behaviour. Reduced motion keeps the
sections in normal document flow without overlap.
