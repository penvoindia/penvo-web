# Home showreel

`HomeShowreel` sits between testimonials and projects. It reproduces only the
video part of the hero on the live
[Victor Berbel portfolio](https://www.victorberbel.work/#hero), measured in
Chrome on 10 October 2026, not the hero's heading or copy. The section has no
visible heading; its region and video are named by the showreel label.

## Reference mapping

The reference places a muted, looping 16:9 video in a rounded frame below the
hero copy. Its GSAP ScrollTrigger timeline has three parts:

- Over the last 15% of the section's 140vh height before the section reaches
  the top of the viewport, the frame scales from 1 to 0.85 and moves down by
  `(viewport height - frame height) / 2`, which centres it. The animation is
  scrubbed with a one-second `expo.out` catch-up.
- The frame then stays pinned for the section's full 140vh.
- The next section scrolls over the pinned frame for the last 100vh. It covers
  the frame completely when the pin ends.

Alongside the pin, the reference recolours its page from white to `#111111`.
The tween animates `body`, runs from the section top at 20% of the viewport
to the section centre at the viewport centre, which is 20% of a viewport after
the pin starts, and uses GSAP's default `power1.out` with no scrub lag. At
992px and below, the reference shows a static 16:9 frame with neither the pin
nor the colour change.

## Penvo adaptation

- The frame spans Penvo's layout container, inside the page gutters and the
  1700px maximum. The reference's 1% side padding would not align with the
  rest of the page.
- The frame uses the 20px radius of Penvo's testimonial cards at every width,
  instead of the reference's 16px and 8px.
- The pinned layout starts at Penvo's 1024px breakpoint and requires
  `prefers-reduced-motion: no-preference`. Smaller screens and reduced motion
  get the static frame.
- The section is `240vh` tall, with a sticky `100vh` stage, and has a
  `-100vh` bottom margin. This gives the reference's 140vh pin, with the
  following section over the last 100vh. The following section is made
  `position: relative`, so it paints above the sticky stage.
- `ShowreelExperience` measures the section, stage, and frame. It eases the
  frame's `translate3d()` and `scale()` with GSAP's `expo.out` curve, without
  adding GSAP. Each new scroll target restarts the catch-up from the current
  value. Resizing and media changes re-measure and jump without easing.
- Penvo inverts the colour change: over the same scroll range and curve, the
  page turns from black to white, so the reel sits on white while pinned and
  the black projects section scrolls over it. `ShowreelExperience` sets the
  `body` background with `color-mix()` from the colour tokens. The
  testimonials and showreel sections have no background of their own, so the
  whole visible page changes as in the reference. Projects stays opaque. Once
  it fully covers the reel, the page returns to black where no one can see it,
  so later sections never show white. Cleanup removes the inline colour.
- The visible pause and resume controls are removed at the user's request.
  Playback follows the section's visibility and motion preferences.

## Playback

The video is muted, loops, plays inline, and starts with `preload="none"` and a
poster. It begins loading one viewport before it arrives, and plays only while
it is in view, not yet covered by the next section, and in a visible tab.
Reduced motion renders the static poster without autoplay or preloading.
Playback is managed automatically; there is no manual control or saved user
playback intent. If the browser blocks playback, the poster remains.

## Content and assets

`showreel-content.ts` defines the typed sources, poster, intrinsic size, and
label. The reel uses the user-supplied MP4 at `/showreel/vb-reel-2026.mp4`,
copied byte for byte from the provided file: a 40-second, 1920 × 1080 H.264
video at approximately 30fps. The poster at
`/showreel/poster.webp` is generated from this video's first frame, so starting
playback does not change the picture.

## Validation

Motion tests cover the settle window, the centred end state against the
reference's measurements at three viewports, the `expo.out` samples, scrub
restarts, the covered state, the page colour against the reference's measured
samples, and the stylesheet's pin distance, media query, and section
backgrounds.
Content tests check the 16:9 size, the label, and the local poster and video
files.
