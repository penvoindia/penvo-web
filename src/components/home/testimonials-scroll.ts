const edgeTolerance = 2;

export function createTestimonialsScroll(
  viewport: HTMLElement,
  previous: HTMLButtonElement,
  next: HTMLButtonElement,
): () => void {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cards = Array.from(
    viewport.querySelectorAll<HTMLElement>('[data-testimonial-card]'),
  );
  let frame: number | undefined;
  let destroyed = false;

  function maximum() {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function position() {
    return Math.max(0, Math.min(maximum(), viewport.scrollLeft));
  }

  function sync() {
    frame = undefined;
    if (destroyed) return;
    const left = position();
    previous.disabled = left <= edgeTolerance;
    next.disabled = maximum() - left <= edgeTolerance;
  }

  function schedule() {
    if (destroyed || frame !== undefined) return;
    frame = window.requestAnimationFrame(sync);
  }

  function advance(direction: -1 | 1) {
    const button = direction === -1 ? previous : next;
    if (destroyed || button.disabled) return;

    const first = cards[0]?.getBoundingClientRect();
    const second = cards[1]?.getBoundingClientRect();
    const distance =
      first && second
        ? Math.abs(second.left - first.left)
        : (first?.width ?? viewport.clientWidth);
    const step = distance || viewport.clientWidth;

    viewport.scrollTo({
      left: Math.max(0, Math.min(maximum(), position() + direction * step)),
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
    });
    schedule();
  }

  function goPrevious() {
    advance(-1);
  }

  function goNext() {
    advance(1);
  }

  const observer =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(schedule)
      : undefined;

  observer?.observe(viewport);
  cards.forEach((card) => observer?.observe(card));
  viewport.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  reducedMotion.addEventListener('change', schedule);
  previous.addEventListener('click', goPrevious);
  next.addEventListener('click', goNext);
  sync();

  return () => {
    if (destroyed) return;
    destroyed = true;
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    observer?.disconnect();
    viewport.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    reducedMotion.removeEventListener('change', schedule);
    previous.removeEventListener('click', goPrevious);
    next.removeEventListener('click', goNext);
    previous.disabled = true;
    next.disabled = true;
  };
}
