# Home work together

`HomeWorkTogether` adapts MadeByShape's homepage contact marquee after the
services section. The reference was inspected at desktop and mobile sizes: it
uses two edge-to-edge rows, three repeated phrases per row, 20vw mobile type,
10vw desktop type, 1.15 line height, tight tracking, and opposing movement at
about 90px per second.

Penvo keeps that measured layout and motion structure while using its own
Bricolage Grotesque display face, extra-bold weight, pure-white type, pure-black
surface, and bright-orange action colour. The complete marquee is one accessible
link to `/contact`; decorative repetitions are hidden from assistive technology.

On every hover-capable fine pointer, the marquee replaces the native arrow
cursor with a 96px fixed follower, matching the reference cursor's size and
centered position. Penvo's own favicon replaces the reference circle and arrow
artwork. Pointer movement is batched to one animation frame, the follower scales
in over the shared base duration, and it hides on leave, cancel, scrolling out
of the section, window blur, document hiding, and unmount. Touch devices retain
their normal behavior without rendering the follower. Reduced motion keeps
direct pointer tracking but removes the scale and opacity transitions.

The measured phrase width sets the animation duration so speed remains stable
across responsive sizes and font rendering changes. CSS transforms run the
continuous loop without an animation frame callback. The two tracks pause from
document visibility while reduced motion removes the loop and presents both rows
as a static, offset composition. The tracks remain paused until the client
controller is ready. The visible pause control has been removed by design.
