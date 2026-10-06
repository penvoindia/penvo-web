# Home services

`HomeServices` follows `HomeBuild` on the homepage. It adapts the local Navbar
Digital `ServicesSection` layout: oversized heading, full-width service rows,
light hover surfaces and a 300 × 220px floating preview.
The source reference was inspected from its existing development source map;
its original component files are currently absent from the reference checkout.

Penvo's five services and descriptions match the existing navigation. Typography,
spacing, colours, and the preview brand mark use Penvo's shared design system.
No reference branding, new images, or animation libraries are included.

Each complete row is a link to its matching service page. Rows show a leading
two-digit service number using the shared `type-body-large` role while keeping
the title/description columns at 50:50. The resting number is pure white.
Keyboard focus receives the same light surface as hover, and hover, focus, and
pressed descriptions use pure black against that surface. There is no expandable
or persistent active state.

The floating preview is decorative and available only with a fine mouse pointer
at widths of 1024px or more, with reduced motion disabled. Its background is the
supplied `services-preview.webm` video; the previous orange surface and brand mark
remain removed. A numbered “01 / SERVICE” label and the hovered service title
sit above the video in white with a restrained dark gradient for legibility. The title matches the
reference at 24px size, 24px line height, and extra-bold weight. The 4K source
keeps its intrinsic dimensions and uses
`object-fit: cover` inside the 300 × 220px card. Metadata is loaded ahead of use,
while playback starts only on row hover and pauses whenever the preview hides.
The card scales from 0.85 and fades over 350ms; position follows with a short
180ms CSS transition rather than a new spring runtime. One animation frame
batches each pointer update. Scrolling, leaving, focus, clicks, blur, visibility
changes, and media changes hide it. Unmount removes all listeners and pending
frames. The native cursor remains visible. No essential information is confined
to the hover preview.

Mobile rows use smaller titles; tablet portrait increases spacing. Tablet
landscape enables the optional pointer preview; desktop adds inline descriptions.

The heading includes the shared secondary “All services” button, linking to the
service list. It sits beside the heading on tablets and desktop and stacks below
on mobile. Desktop rows use equal 50:50 columns, with descriptions starting at the
section midpoint and 32px of spacing inside the title column. Descriptions use
the shared `type-body-large` role and its `--type-body-large-size` token. Service
arrows are omitted.

With the full scroll sequence enabled, this section moves upward into the last
quiet part of `HomeBuild`. The overlap equals the services top spacing plus
48–72px, so the services eyebrow appears just before the sticky stage releases
instead of leaving an empty viewport between the sections. The overlap is not
applied for reduced motion or the static no-JavaScript layout.
