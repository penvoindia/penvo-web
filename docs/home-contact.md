# Home contact intro

`HomeContact` follows the Elephant Skin contact intro shown in the reference:
a centered eyebrow, two-line display heading, multilingual accent greeting,
and a centered description on a light radial-gradient surface. It follows the
Approach section. The reference's office map and contact buttons are outside
the pictured intro. Penvo adds its shared primary “Book Consultation” and
secondary “View services” buttons below the description, centered with a
32px top gap and 14px between buttons. They stack on mobile. The booking
action uses the existing `/start-a-project` destination; services links to
the homepage's `/#services` section.

Penvo's display-mega Bricolage Grotesque role replaces Etna, with Penvo's
natural casing. Hanken Grotesk body-large supplies the description. The
white-to-concrete surface, black heading, orange greeting and eyebrow, and
responsive section spacing all use existing design-system tokens. The eyebrow
and description use Penvo copy rather than Elephant Skin's team identity.

## Greeting motion

- The greeting changes every 1,600ms through the reference's ten languages.
- Only the greeting fades and moves downward by 8px. The exit lasts Penvo's
  shared fast duration of 180ms, then the next greeting enters with the same
  easing. This replaces the reference's 200ms swap and 220ms transition.
- The heading keeps its line height and the description's position as greetings
  change. Each second-line phrase stays centered at its natural text width.
- Hover and keyboard focus suspend rotation. Clicking or tapping the greeting
  toggles a persistent pause; the greeting itself is the control, with an
  accessible label and tooltip, so there is no separate pause button.
- Offscreen content and hidden tabs stop timers. Resuming starts a new interval
  without catching up or skipping greetings. Interrupted fades restore visible
  text immediately.
- Reduced motion leaves a static, readable greeting and disables rotation.
  Without JavaScript, the server renders “Hi.” with the same complete layout.
- The screen-reader heading stays “Don’t be shy. Say hello.” rather than
  announcing every decorative language change. Each visible greeting carries
  its own language and direction metadata.

The mobile, portrait-tablet, landscape-tablet, and desktop profiles inherit
their existing display, reading, gutter, and section-spacing tokens. No scroll
handling, animation library, media asset, or permanent composited layer is
added. Only the greeting is a Client Component; the section copy is server-rendered.
