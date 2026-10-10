# Home projects

`HomeProjects` sits after testimonials and before the contact intro. The cards
remain server-rendered; `ProjectsGallery` adds small native drag and cursor
controllers. Images, fonts, colours, and page gutters belong to Penvo.

## Reference mapping

The live [Frame photographer portfolio](https://frame.ancorathemes.com/photographer-portfolio/)
uses finite horizontal dragging across staggered portfolio panels. Its runtime
disables looping when overflow is enabled; autoplay and mouse-wheel control
are also disabled. Its desktop panel uses four columns, twelve equal rows,
30px gaps, and paired spans of 5/7, 7/5, 6/6, and 8/4.

The visible reference height is width-derived:
`((viewport inline width - 150px) / 4) * 1.6875 + 60px`.
The 150px accounts for its two 30px outer gutters and three 30px column gaps.
Reference-only browser measurements found heights of 597.89px at a 1440px
viewport, 530.39px at 1280px, and 800.39px at 1920px (with the browser's
15px vertical scrollbar). Penvo preserves this exact desktop height formula;
the reference's empty clearfix row is omitted.

Penvo places the featured records in a single horizontal strip, with the current
fourteen examples forming seven two-card columns at that height. The carousel keeps Penvo's page
gutters, with 30px between cards on desktop, 24px on tablet landscape, 20px on
tablet portrait, and 16px on mobile.
Portrait-led pairs span eight and four rows; square-led pairs span seven and
five; pairs of landscape covers each span six. A final unpaired project fills
its column without inserting a placeholder. Column width equals a seven-row
card's height, preserving true 1:1 frames for seven-row covers. Tall and wide
rectangles share this width and move together through one native scrolling
track, with no independent card drift. The carousel stays within the page frame, with no
page-wide overflow. A 70px gap separates the section heading from the cards.

The reference's hover cover is white and inset 10px from the image edges,
with centred title and category. Penvo preserves that cover and adds the
requested year and brand above the title. The small year/brand separator is a
square. Titles use Bricolage heading-5; metadata uses Hanken body and categories
use body-small. Images keep square corners and do not zoom on hover.

## Motion and input brief

On a fine hover pointer at 1024px and above, the cover fades over the shared
base duration (320ms). Year/brand, title, and category move from `translateY(100%)`
to their centred resting positions over that same duration while fading over
180ms. Keyboard focus reveals the same information with Penvo's focus outline.
Only transform and opacity animate; no permanent `will-change` layer is added.

Eligible primary mouse presses prevent selection immediately without assigning
keyboard focus to the clicked card. Horizontal movement of at least 6px
captures the pointer and updates native `scrollLeft` directly. Text selection,
native image dragging, and the click following a recognized drag are suppressed.
During the gesture, document capture listeners prevent selection and image
dragging even outside the viewport. Existing selections that intersect the
gallery are cleared; selections elsewhere remain untouched. These listeners
are removed on release, cancellation, interruption, and cleanup. Ordinary
clicks and keyboard focus remain usable. Covers and focus outlines hide during
dragging; keyboard navigation retains its normal focus treatment.

Both drag input and the custom cursor require actual horizontal overflow of
more than one pixel, allowing for browser rounding. When every featured card
fits, the native cursor remains normal and mouse gestures are left alone.
Viewport and grid resize observation, project markup changes, late image loads,
font changes, and profile changes recheck this condition. Reducing the featured
list restores the native cursor and cancels any gesture or queued motion.

Release glide follows the reference's half-sample velocity and 0.02px/ms minimum,
with a bounded 1000ms cubic ease-out and a clamped endpoint. Stale samples do
not start a glide; boundary clamping shortens its duration. This local 1000ms
maximum matches the measured free-mode release behavior rather than a shared
UI transition duration. New presses, wheel/touch input, keyboard input, hidden
tabs, resizing, profile changes, and cleanup cancel the glide. There is no
autoplay, looping, snapping, edge bounce, wheel interception, or animation library.
Vertical wheels and page scrolling remain native; trackpads and keyboard can
scroll the carousel's native overflow without JavaScript.

At desktop widths from 1280px, an overflowing gallery uses a centred brand orange
66px cursor with two white 10px chevrons. Pressing shrinks the circle to 56px and
brings the arrows closer together, using Penvo's shared transitions. Its
transform follows the mouse with the reference's one-eighth interpolation; the
animation frame loop stops when the cursor settles or is hidden. The helper
covers the image grid and its gaps, replacing the native cursor only while
active. It is decorative, ignores pointer events, and clears on pointer exit,
cancellation, window blur, hidden tabs, profile changes, and cleanup.

Mobile uses one column, and tablet portrait uses two. Touch, mixed-pointer,
no-hover, and reduced-motion profiles use a static grid with metadata below
each image. Static images use 4:3, 1:1, or 3:4 frames according to each record's shape;
all project details remain visible.
The mobile and tablet layout preserves native vertical page scrolling. Reduced
motion introduces no hover reveal, image scaling, or animated gallery movement.
Fine-pointer tablet landscape retains the horizontal carousel with a minimum
500px height so hover text fits, and uses native grab/grabbing feedback.
The original reference instead uses a taller three-column panel at those widths;
Penvo adapts this profile to its readable column pairs. The no-JavaScript desktop
carousel supports native scrolling and keyboard-focus covers.

## Content and assets

`projects-content.ts` defines the typed `Project` data boundary and fourteen
editable preview records: ID, image, title, category, year, brand, image
description, dimensions, optional cover shape, and a `featured` flag.
`HomeProjects` accepts a project collection from its server-side parent and
uses `getFeaturedProjects` to show only featured entries in editorial order.
The section is omitted when none are featured. The preview collection remains
the default until a real content source is connected; there is no CMS or new
data-fetching dependency.

`projects-layout.ts` derives the composition from the selected records rather
than a fixed count. An explicit shape defines the editorial crop; otherwise
intrinsic image dimensions select portrait, square, or landscape. The same
layout handles small lists, odd counts, and future additions.
This composition
uses Penvo's hoodie and mobile-app mockups, four existing concept visuals,
and eight original SVG concept covers for editorial, social, retail, merchandise,
dashboard, event, coffee packaging, and wayfinding design.
Titles and years are working content; the concepts do not assert external client
commissions, performance results, or endorsements. Verified local sources and
unverified concept provenance are documented in `project-assets.md`.

Every image uses `next/image`, an intrinsic frame, responsive `sizes`, local
WebP or SVG files, and lazy loading. No remote image host is required.

## Validation

Focused content and layout tests cover featured filtering, editorial order,
dimension-derived shapes, odd counts, and complete non-overlapping columns.
Drag, cursor, and layout-observer tests cover selection prevention, eligible input, focus,
pointer capture, finite movement, release glide, cancellation, visibility, frame
scheduling, dynamic overflow changes, data updates, and cleanup. Check server-rendered project order and metadata, verify
local image files, and run the existing repository checks and build.
The reference was inspected in an isolated browser session at desktop,
tablet, and mobile widths. Local browser QA remains reserved for an explicit
request under the motion skill.
