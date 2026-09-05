# Button system

The Penvo button geometry is adapted from the chamfered controls on
[`rig.ai`](https://rig.ai/). Its existing border-reveal interaction remains
adapted from the CSS component supplied by the project owner, originally
credited to Uiverse.io user `kleenpulse`.

## Penvo translation

- Typography remains the existing `.type-button` role: Bricolage Grotesque,
  `14px` size, `20px` line height, `600` weight, and `0.35px` letter spacing.
- The top-left and bottom-right corners use Rig's `14px` chamfer.
- The control uses Rig's wider proportions with a `50px` minimum height and
  `15px 30px` internal padding.
- Its inline-flex layout includes an `8px` gap for labels paired with icons.
- The header CTA uses a `46px` height by adapting only the vertical padding to
  `13px`; its `30px` side padding and `14px` chamfer remain intact.
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
