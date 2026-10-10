# Home projects

`HomeProjects` sits after the showreel and before the contact intro. The cards
remain server-rendered; `ProjectsGallery` adds small native drag and cursor
controllers. Images, fonts, colours, and page gutters belong to Penvo.

## Reference mapping

The section reproduces the gallery at the top of the live
[Frame photographer portfolio](https://frame.ancorathemes.com/photographer-portfolio/),
measured in Chrome on 10 October 2026. The reference is a Swiper 8.4.5 slider
of full-width panels. Each panel holds eight covers in a ThemeREX
`sc_portfolio_fill` grid, and the columns of neighbouring panels form one
continuous strip with 30px gaps. It shows 24 covers; Penvo shows twelve: one
full panel and the first half of the next.

Penvo keeps the reference geometry inside its own layout frame. The reference's
30px outer margins become Penvo's page gutters, so the strip aligns with the
section heading and stops at the 1700px layout maximum. `content` below is the
width inside those gutters. As in the reference, the strip is clipped one gap
outside the frame, so the next column waits just out of view.

### Desktop, 1280px and above

Four columns fill the frame: `column = (content - 90px) / 4`, with 30px gaps.
Twelve equal rows are sized so a four-row cover is exactly 16:9:
`row = (column × 0.5625 - 90px) / 4`, which makes the strip
`column × 1.6875 + 60px` tall. Each panel pairs covers in its four columns as
5/7, 7/5, 6/6, and 8/4 rows. Covers nine to twelve continue the strip with the
5/7 and 7/5 columns. An unpaired final cover fills its whole column, as in the
reference's odd-count templates.

### Tablet, 768–1279px

The reference switches to a three-column panel:
`third = (content - 60px) / 3`. Rows one to five are a fixed 75px. The seventh
cover spans two columns, and it and the eighth cover are 16:9; that sets row six
to `third × 0.5625 - 13.125px` and rows seven and eight to
`(third × 0.5625 - 30px) / 2`. Covers nine to twelve form a second panel of
two half-width columns, `(content - 30px) / 2`, staggered like the reference's
four-cover template but over all eight rows (five and three rows, then four and
four), so it is as tall as the first panel. Any other partial panel also fills
its full height: one to three covers use half-width columns, and five to seven
extend the lowest cover in each column to the bottom row.

### Mobile, below 768px

Each panel stacks up to eight 16:9 covers at the full frame width, 20px
apart, and the next panel sits 20px to the right, out of view until swiped.
The reference's panels are always full, so Penvo balances its panels: twelve
covers become two stacks of six, and no swipe lands on an empty half.

### Spacing

The section uses local `--projects-section-space` padding above and below:
100px on desktop from 1280px, 80px on landscape tablets from 1024px, 70px on
portrait tablets from 768px (including 1024px portrait), and 50px on mobile
below 768px.

The header's bottom padding sets its distance to the gallery: 70px on desktop
from 1280px, 60px on landscape tablets from 1024px, 50px on portrait tablets
from 768px, and 40px on mobile below 768px. Portrait tablets retain the 50px
gap at 1024px.

An `Explore More` action uses Penvo's primary `ButtonLink` and links to `/work`.
It sits opposite the heading from 1280px and on
landscape tablets from 1024px. On mobile and portrait tablets, it sits below
`ProjectsGallery`, left-aligned with the `layout-container`, with a 30px gap
above it on mobile and 40px from 768px.

## Hover and focus

On hover, the reference fades a 10px inset panel over the cover in 300ms,
scales the photo from 1.005 to 1.07 over 500ms, and raises each text line from
its own clipped baseline over 500ms (400ms on leaving), all with CSS `ease`.
Penvo keeps these timings. Instead of the inset panel, it fills the whole cover
with white, like a hovered testimonial card. The text sits at the bottom left,
inside the testimonial card's padding of 24px (32px from 768px), and follows an
editorial card pattern: the title using the `type-heading-5` family and weight
at 20px with a 28px line-height, then the year and category in `type-body` at
16px with a 24px line-height in pure black, separated by a small dot, with 5px
between the title and metadata.
The brand or concept label is not rendered; its `brand` field remains in the
project metadata. The year-and-category line stays on one line,
ending long text with an ellipsis. Each cover is a size container.
Short covers shorten titles to two lines, then one, so the title and the year
and category always fit; the thresholds add the padding, the title lines, and
the year line and its gap. From 768px, covers under 121px tall return to 24px
padding. The lines stack up from the bottom. No line is ever cut through.
Keyboard focus reveals the same panel and draws
Penvo's focus outline on an overlay above the image. A focused cover that is partly outside the strip scrolls fully into view,
aligned with the frame; pointer presses never move the strip this way. The
gallery region's own focus ring is drawn above the covers. Touch profiles show
covers only, like the reference.

## Cursor

At 1280px and above with a fine pointer, an overflowing gallery replaces the
native cursor with the reference's mouse helper in Penvo orange. It opens from a
14px dot into a 66px disc in 300ms, follows the pointer by one-eighth of the
remaining distance per frame, and shrinks to 56px while pressed. Its white
chevrons are 6 × 10px, drawn with a 1.55px stroke; their inner edges sit 10px
from the centre, or 5px while pressed. All size and chevron changes take 300ms
with `ease`. The disc clips its chevrons while it opens. The section clips only
sideways, so the disc stays round over the strip's top and bottom edges. It is
decorative, ignores pointer events, and clears on exit, cancellation, blur,
hidden tabs, profile changes, and cleanup. Below 1280px the native cursor is
used, as in the reference.

## Drag and momentum

Fine-pointer mouse dragging follows the reference's free mode. The strip moves
with the pointer from the first pixel. Once the pointer is 5px away, or on a
level move, a gesture steeper than 45° is left to the page. Text selection,
native image dragging, and the click after any movement are suppressed.

Past either end, travel follows the reference's resistance:
`pull^0.85 - 1` pixels. Releasing there returns to the edge over 600ms with CSS
`ease-out` and no momentum. Elsewhere, the release velocity is half the speed
of the last two pointer samples; slow (under 0.02px/ms), stale (samples more
than 150ms apart), and paused (more than 300ms) releases stop in place.
Momentum travels `velocity × 1000ms` over 1000ms with CSS `ease-out`. When it
would pass an end, it overshoots at the same speed, then returns over 600ms.
At the start the overshoot is at most `20 × velocity` pixels; at the far end it
is always the full `20 × velocity`, matching the reference. A press freezes a
glide where it is. A press past an edge keeps returning to the edge while held,
as in the reference, and dragging then continues from wherever it has reached
without a jump. Secondary and middle buttons leave any motion running.

Overshoot translates the covers rather than the grid, and the grid clips them,
so the native scroll range never changes. Native wheel, touch, and keyboard
scrolling remain
available and take over from any motion. Late image and font loads re-measure
the strip without interrupting a glide unless its extent changes. With reduced
motion, dragging stays direct, edges return immediately, and there is no
momentum, cursor, or hover animation. Touch devices use native horizontal
scrolling.

## Content and assets

`projects-content.ts` defines the typed `Project` data boundary and twelve
editable preview records: ID, image, title, category, year, brand, image
description, dimensions, an optional `objectPosition` focal point, and a
`featured` flag. `HomeProjects` accepts a project collection from its
server-side parent, shows featured entries in editorial order, and caps them at
`projectsLimit` (twelve). The section is omitted when none are featured. The
preview collection remains the default until a real content source is
connected; there is no CMS or new data-fetching dependency.

Projects may include an optional `logo` object with `src`, `width`, and `height`.
The twelve demo records use local SVG logos in `public/projects/logos`, with
pure-black paths and transparent backgrounds. Each logo appears at the top
right when the white hover or keyboard-focus cover appears. The full-cover
vertical flex layout uses the caption's 24px inset (32px from 768px, returning
to 24px on covers under 121px tall). A contained image box preserves the logo's
proportions and measures at most 120 × 48px below 768px or 140 × 56px from
768px. Its width is also limited to 40% of the card's width, 60% of the card's
height, and the available inset width; its maximum height is 18% of the card's
height. These relative limits keep logos smaller on small cards without
changing the cover ratios or caption sizes. After reserving the bottom caption
and a 20px gap, the available height can shrink to zero on the shortest covers,
so the logo never crowds the text. The copied SVG viewBoxes fit the ink with one
SVG unit of padding. Path geometry and original source files stay unchanged.
The logo fades over 300ms with CSS `ease`, matching the white cover. Reduced
motion disables that transition while retaining static hover and focus states.
No JavaScript or client runtime is added for the logos. These demo assets
illustrate preview concepts and do not assert actual brand associations or
client relationships. The original project cover images remain unchanged.

`projects-layout.ts` derives every placement from the selected records rather
than a fixed count: desktop column and rows, tablet column, span, and rows, the
tablet column tracks, and the mobile panel and position. The preview order
suits the reference frames: Penvo's hoodie leads, its phone mockup takes a tall
frame, and wide images take the 16:9 frames. Titles and years are working
content; concepts do not assert client commissions, results, or endorsements.
Sources are documented in `project-assets.md`.

Every image uses `next/image` with `fill`, lazy loading, and `sizes` derived from
its rendered width at each breakpoint. Each `vw` term follows a space, as in
`calc(-47px + 25vw)`, so `next/image` can offer small srcset widths. No remote
image host is required.

## Validation

Layout tests cover the twelve placements at every breakpoint, hole-free
layouts and balanced phone panels for one to twenty-four projects, the
stylesheet's measured formulas, and their proportions. Drag tests check the
measured resistance table, CSS `ease-out` samples, momentum, bounce, held and
secondary-button presses, reduced motion, interruption, selection handling, and
cleanup. Focus tests cover keyboard reveal of partly hidden covers. Cursor and
overflow tests cover eligibility, interpolation, layout changes, and cleanup.
Content tests check the twelve featured records and their local files.
