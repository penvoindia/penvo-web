# Home hero

The home banner adapts the hero in the local Elephant Skin project at
`/Users/anas/Downloads/elephant-skin`. It keeps the full-screen particle
background, radial veil, left-aligned three-line headline, rotating accent
word, two Penvo actions, and lower-right arrangement controls.

## Penvo translation

- The page background is Pure Black; particles and the changing word use
  Bright Orange. Grouped particles use only the approved Penvo palette.
- Neutral hero text, including the paragraph, control heading, and canvas
  group labels, uses Full White (`#FFFFFF`). Inactive filters are transparent
  with white outlines and labels; hover/focus fills white with black labels.
  These semantic colour overrides are scoped to the hero;
  global grey tokens, particle colours, and orange/black button states are unchanged.
- Particles are centered, sharp-cornered squares in every arrangement,
  preserving the previous dots' dimensions and motion.
- The title uses Display Giant (Bricolage Grotesque), the introduction uses
  Body Large (Hanken Grotesk), and the eyebrow uses the Eyebrow role. All
  typography measurements continue to come from `src/styles/typography.css`.
- Every action and visual control uses the shared `Button` or `ButtonLink`.
- Arrangement controls use `size="compact"`: `32px` height, `6px 14px` padding,
  `6px` corner cuts, and `14px / 20px / -0.35px` Hanken Medium typography.
  Selected filters are orange-filled; inactive filters are transparent with
  pure white outlines and labels. Their shared reveal fills white on hover/focus
  and returns to transparent on leave, keeping the outline white throughout.
  The final “Explore More” control always uses the shared
  secondary theme: transparent with orange outline/text, filling orange with
  black text on hover/focus. The shared hover reveal and `8px` inter-control gap stay
  intact. Main hero actions retain the standard button size.
- The hero inherits the common layout frame, gutters, and four breakpoints.
  It is at least `680px` / one stable viewport high and grows on short screens
  so text and controls are never clipped by a fixed height.
- The source's `22px` eyebrow gap, `30px` paragraph gap, `38px` action gap,
  `14px` button gap, and bottom-right control arrangement are retained.
- Mobile actions stack; arrangement controls are hidden below `768px`, as in
  the reference.
- Working headline: “The Creative / Edge / for Your Brand.” The accent word
  rotates through Edge, Energy, Vision, and Engine. Copy can be revised when
  the final messaging is supplied.
- Services, Process, and Focus are illustrative groupings, not project
  statistics. “Explore More” activates the globe particle arrangement; its
  internal mode remains `globe`. No reference
  project counts, clients, locations, or achievements are claimed for Penvo.
- The two CTAs are “Explore our work” (`/work`) and “Start a project”
  (`/start-a-project`). Those destination pages are a later stage.
- The reference's video reel and guided tour require Penvo content; the current
  hero provides Penvo navigation actions and visual arrangement controls.

## Motion brief

The particle field provides ambient movement; mouse proximity repels nearby
particles and arrangement buttons regroup them. The initial state is free
flow. Active controls expose their state with `aria-pressed` and can be used
with mouse, keyboard, or touch. Reduced motion renders a static field, still
allows instant arrangement changes, and stops word rotation.

On the first motion-enabled start, squares spread outward from a centered
sphere-shaped arrangement into their free-flow positions. This adapts the local
reference's globe-to-field movement without adding an intro overlay, scroll lock,
or another animation loop. It runs once per hero mount, not when returning from
a hidden tab or scrolling the hero back into view. A filter selected before the
first start takes precedence over the entrance.

Responsive changes preserve each square's live position and velocity while
updating its target layout, so the existing spring/lerp motion carries it into
place. Particle counts change only at the existing density breakpoints; new
squares join from existing positions. Unchanged resize notifications do not
rebuild the field. With motion disabled, resizing settles directly into the new
layout. Entrance and resize motion use the existing frame and speed limits.

The word changes every `2400ms` with the shared `320ms` opacity/10px translation
transition. All alternative words occupy one reserved grid cell to prevent
layout shifts. The heading has a stable accessible name, so automatic changes
are not repeatedly announced. There is no visible Pause control, as requested;
system reduced-motion preferences still stop both effects.

Canvas is the deliberate exception to transform-only animation. It draws
1200 desktop/landscape particles, 720 portrait particles, and 480 mobile
particles. Pixel density is capped at 2 (1.5 on mobile); animation is capped
at 60fps on desktop/landscape and 30fps below `1024px`. DOM layout is measured
on resize/input, never in the animation loop. Animation stops offscreen and
in hidden tabs. Observers, animation frames, and word timers are cleaned up.
There are no new libraries, media assets, or external script requests.

`HomeHero` supplies server-rendered copy and links to the client experience;
the canvas and changing word are isolated in `HeroExperience`. The temporary
guide is preserved at `/design-guide` with its prior content and styles.
