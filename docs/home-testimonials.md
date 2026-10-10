# Home testimonials

`HomeTestimonials` sits directly after the Approach (`HomeProcess`) section
and before `HomeContact`. It uses a full-width black background and follows
the supplied reference's left-aligned two-line heading, tall dark quote cards,
portrait-backed video card, circular avatars, and partially visible next card.
The outer rounded panel and inset frame have been removed across all breakpoints.
The inverse theme uses Penvo's dark surface tokens, white primary text,
muted-gray roles, and subtle card borders. The card fill mixes the existing
primary and secondary dark surfaces. The contact section keeps its own theme.
On hover-capable fine pointers, text cards switch to a white surface with black
quotes, project labels, descriptions, names, and role text. The video card is
excluded. The colour transition uses the shared fast motion duration; reduced
motion changes colours immediately.

Penvo's Bricolage heading-1 and heading-6 roles replace the section heading
and handwritten names. Each text card has a Hanken body service/project label,
a short Bricolage heading-5 featured quote 20px below the label, and a fuller
Hanken body-large testimonial paragraph using `--type-body-large-size`, with a
20px gap below the featured quote. Both gaps apply at all breakpoints. Every card,
including the video card, has a circular portrait beside the client's name
and role. Text cards also include the company; roles use body-small with a
5px gap below the client name at every breakpoint. Portraits and client details
align at the bottom in the same row with a 16px gap. Project labels and supporting
paragraphs use muted gray on the dark surface. Surface, text, controls, gutters,
and responsive card gaps use Penvo tokens. Section spacing and the desktop card
gap use local layout variables for the requested measurements. Cards prefer the
reference's 3:4 shape while growing with longer copy. The section header and
cards have a 70px gap at every breakpoint. The card list has no extra top or
bottom padding.

Text begins at the top of each card, and the client row stays at the padded
bottom. The attribution has 50px of top padding plus an automatic top margin:
the gap between the message and client details is at least 50px and grows with
any spare card height. No extra height is inserted above the service/project
label. This layout applies at every breakpoint, including the video card's
bottom-aligned client row.

| Viewport                      | Card gap | Top and bottom spacing |
| ----------------------------- | -------- | ---------------------- |
| Mobile, below 768px           | 16px     | 60px                   |
| Tablet portrait, 768–1023px   | 20px     | 80px                   |
| Tablet landscape, 1024–1279px | 24px     | 80px                   |
| Desktop, 1280px and above     | 30px     | 100px                  |

## Content and media

`testimonials-content.ts` holds each text card's service, project, short quote,
supporting description, client name, role, company, and portrait. The copy is
explicitly marked as sample content with placeholder client and company names.
Generated anonymous portraits are design assets, not photographs of actual
clients. The sample-content note has been removed from the section
at the user's request. Replace those entries with approved testimonials and
portraits before using this as live client evidence.

The video entry currently has `video: null`, so it shows a portrait-backed
preview with a decorative play symbol. The preview text label has been removed.
No nonfunctional play button is rendered. Supplying a video source in
that entry renders a native player with controls, `playsInline`, its poster,
and `preload="none"`; it does not autoplay. Images use `next/image` with
intrinsic dimensions or a fixed card frame, responsive sizes, and lazy loading.

## Responsive motion brief

- Mobile uses one large card with a peek of the next. Portrait and landscape
  tablets show roughly two cards. Desktop shows three cards and the next one
  partially visible. Cards grow when quote copy requires more height.
- Native horizontal scrolling and proximity snapping preserve touch, trackpad,
  keyboard, and vertical page scrolling. The focusable list remains usable
  without JavaScript.
- Previous/next controls scroll one measured card-plus-gap distance. Their
  disabled state follows the actual start and end, including native gestures
  and viewport resizing.
- Controls are visible only on desktop (1280px and above), opposite the title
  and aligned to its bottom edge. Mobile and both tablet layouts hide the
  controls and use the native scrollable list.
- Only the carousel controls form a Client Component. Quote markup stays
  server-rendered. No library, autoplay loop, pointer follower, scroll hijacking,
  or drag simulation is added.
- Reduced motion uses immediate button scrolling and removes snapping.
- A passive scroll listener coalesces endpoint updates into one animation
  frame. ResizeObserver watches the viewport and cards. Cleanup removes
  observers, listeners, and queued frames.

Focused controller tests cover actual spacing, clamped endpoints, resizing,
native scroll updates, reduced motion, and cleanup. Browser QA is reserved
for an explicit request under the project's motion skill.
