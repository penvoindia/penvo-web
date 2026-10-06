# Home process

`HomeProcess` adapts Elephant Skin's “How developments become brands” section
into a Penvo process story. It preserves the reference's full-viewport sticky
frame, fixed top eyebrow, wide divided panels, oversized low-contrast numbers,
accent punctuation, and centered progress rail. Penvo's Bricolage Grotesque and
Hanken Grotesk roles, pure-black surface, white and grey text, bright-orange
accent, shared borders, layout gutters, and button replace the reference brand
system.

Desktop and tablet scrolling remains native. Vertical progress translates the
track horizontally, with reads and writes batched through one animation frame.
ResizeObserver, viewport changes, and font readiness keep the measured travel
accurate. The client controller owns only measurement and transform updates;
all content is server-rendered and remains present without JavaScript.

Below 768px, the six stages and final call to action form a vertical sequence.
Reduced motion uses that same static sequence at every viewport size. The
effect adds no animation dependency, timers, scroll interception, or persistent
`will-change` layer.
