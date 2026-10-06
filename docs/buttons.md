# Button system

The Penvo button geometry is adapted from the chamfered controls on
[`rig.ai`](https://rig.ai/). Its existing border-reveal interaction remains
adapted from the CSS component supplied by the project owner, originally
credited to Uiverse.io user `kleenpulse`.

## Penvo translation

- Typography follows Navbar Digital's standard CTA scale through the shared
  `.type-button` role: Hanken Grotesk, `16px` size, `24px` line height, `500`
  weight, `-0.4px` letter spacing, and natural case.
- The top-left and bottom-right corners use Rig's `14px` chamfer.
- The control uses Rig's wider proportions with a `50px` minimum height and
  `13px 30px` internal padding.
- Its inline-flex layout includes an `8px` gap for labels paired with icons.
- The header CTA uses the same `16px / 24px / -0.4px` typography as standard
  buttons and keeps its `46px` height with `11px` vertical padding. Its `30px`
  side padding and `14px` chamfer remain intact.
- A single even-odd polygon creates the `1px` orange outline around all six
  edges, keeping both chamfers aligned without additional corner strokes.
- Button labels never inherit link underlines.
- No colours from the source component are used; every state uses Penvo brand
  tokens.
- Primary starts with an orange fill and black text. Hover and keyboard focus
  smoothly remove the fill, leaving a transparent surface with its orange
  outline and label.
- Secondary starts transparent with an orange outline and label. Hover and
  keyboard focus smoothly reveal the orange fill and switch the label to black.
- The supplied interaction timing is preserved exactly: the clipped surface
  completes its hover reveal in `200ms` and returns in `500ms`, while the label
  colour transitions over `250ms`.
- Disabled, forced-colour, touch, and reduced-motion behavior are supported.
- Button and link controls reuse one internal outline, surface, and label
  structure. The component has no client-side JavaScript and defaults to
  `type="button"`.

## Usage

```tsx
import { Button } from '@/src/components/ui/Button';

<Button>View project</Button>;
<Button variant="secondary">Explore Penvo</Button>;
```

Native button attributes are supported. Add event handlers only from a Client
Component when genuine browser interaction is required.

## Compact filters

Use `size="compact"` on `Button` or `ButtonLink` for small supporting controls.
This opt-in size has a `32px` minimum height, `6px 14px` internal padding,
`6px` corner cuts, and the same `1px` outline and hover reveal. Its shared
typography tokens live in `src/styles/typography.css`: Hanken Grotesk Medium
(`500`), `14px / 20px`, `-0.35px` letter spacing, natural case. The measurements
stay consistent across breakpoints; standard and header buttons are unchanged.

The hero uses compact buttons for particle arrangements. Selected options use
the primary orange fill. Unselected filters are transparent with Full White
outlines and labels. The shared secondary surface reveals white on hover/focus
with black labels and returns to transparent on leave; the outline stays white.
The final “Explore More” control retains the standard orange secondary theme.
The outline colour transitions in `250ms`, and the existing surface
reveal and reduced-motion handling remain shared.

```tsx
<Button
  size="compact"
  aria-pressed={selected}
  variant={selected ? 'primary' : 'secondary'}
>
  Free flow
</Button>
```
