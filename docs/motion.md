# Motion foundation

Motion should explain hierarchy and state, never delay access to information.

## Rules

- Prefer transform and opacity animations that avoid layout and paint work.
- Use the shared duration and easing tokens in `src/styles/motion.css`.
- Avoid permanent `will-change`; apply it only immediately before an animation.
- Avoid scroll hijacking. Native scrolling remains the baseline.
- Never make essential information dependent on an animation completing.
- Every future interaction must work with reduced motion enabled.
- Add a motion library only after a concrete animation cannot be expressed
  cleanly with CSS or the Web Animations API.
