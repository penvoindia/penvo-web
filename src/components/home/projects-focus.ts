/**
 * Keyboard focus on a partly hidden cover scrolls it fully into the strip.
 * Chrome only scrolls a focused element that is entirely out of view, and the
 * strip's clip edge can leave a sub-pixel sliver of the next cover visible.
 */
export function revealProjectsFocus(viewport: HTMLElement): () => void {
  function reveal(event: FocusEvent) {
    const target = event.target as Element | null;
    const card = target?.closest?.('figure');
    // Pointer presses also focus covers; only keyboard focus moves the strip.
    if (!card || !viewport.contains(card) || !card.matches(':focus-visible')) {
      return;
    }
    const cover = card.getBoundingClientRect();
    const frame = viewport.getBoundingClientRect();
    if (cover.left < frame.left - 0.5 || cover.right > frame.right + 0.5) {
      card.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }

  viewport.addEventListener('focusin', reveal);
  return () => viewport.removeEventListener('focusin', reveal);
}
