const overflowTolerance = 1;

export function hasProjectsOverflow(viewport: HTMLElement): boolean {
  return viewport.scrollWidth - viewport.clientWidth > overflowTolerance;
}

/** Watch the rendered grid as well as its viewport, including future data updates. */
export function observeProjectsLayout(
  viewport: HTMLElement,
  changed: () => void,
): () => void {
  let destroyed = false;
  let grid: Element | null = null;
  const resize =
    typeof ResizeObserver === 'function'
      ? new ResizeObserver(refresh)
      : undefined;

  function refresh() {
    if (destroyed) return;
    const next = viewport.querySelector('[data-projects-grid]');
    if (next !== grid) {
      if (grid) resize?.unobserve(grid);
      grid = next;
      if (grid) resize?.observe(grid);
    }
    changed();
  }

  const mutation =
    typeof MutationObserver === 'function'
      ? new MutationObserver(refresh)
      : undefined;

  resize?.observe(viewport);
  mutation?.observe(viewport, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: [
      'class',
      'style',
      'src',
      'sizes',
      'hidden',
      'data-project-shape',
    ],
  });
  viewport.addEventListener('load', refresh, true);
  document.fonts?.addEventListener('loadingdone', refresh);
  refresh();

  return () => {
    if (destroyed) return;
    destroyed = true;
    resize?.disconnect();
    mutation?.disconnect();
    viewport.removeEventListener('load', refresh, true);
    document.fonts?.removeEventListener('loadingdone', refresh);
  };
}
