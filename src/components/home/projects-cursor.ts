import {
  hasProjectsOverflow,
  observeProjectsLayout,
} from './projects-overflow';

type CursorPosition = { x: number; y: number };

export function createProjectsCursor(
  host: HTMLElement,
  viewport: HTMLElement,
  cursor: HTMLElement,
): () => void {
  const desktopMouse = window.matchMedia(
    '(min-width: 1280px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
  );
  const coarsePointer = window.matchMedia('(any-pointer: coarse)');
  let position: CursorPosition | undefined;
  let rendered: CursorPosition | undefined;
  let pressedPointer: number | undefined;
  let frame = 0;
  let destroyed = false;

  function hide() {
    position = undefined;
    rendered = undefined;
    pressedPointer = undefined;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    delete host.dataset.cursorVisible;
    delete host.dataset.cursorPressed;
  }

  function reset() {
    if (!destroyed) hide();
  }

  function eligible() {
    return (
      desktopMouse.matches &&
      !coarsePointer.matches &&
      !document.hidden &&
      hasProjectsOverflow(viewport)
    );
  }

  function overGrid(point: CursorPosition) {
    const target = document.elementFromPoint(point.x, point.y);
    const grid = target?.closest('[data-projects-grid]');
    return grid && viewport.contains(grid);
  }

  function render() {
    frame = 0;
    if (destroyed) return;
    if (!position || !eligible()) {
      hide();
      return;
    }

    if (!overGrid(position)) {
      hide();
      return;
    }

    rendered ??= { ...position };
    const deltaX = position.x - rendered.x;
    const deltaY = position.y - rendered.y;
    const settled = Math.abs(deltaX) <= 0.1 && Math.abs(deltaY) <= 0.1;
    if (settled) rendered = { ...position };
    else {
      rendered.x += deltaX / 8;
      rendered.y += deltaY / 8;
    }

    const bounds = host.getBoundingClientRect();
    cursor.style.transform = `translate3d(${rendered.x - bounds.left}px, ${rendered.y - bounds.top}px, 0)`;
    host.dataset.cursorVisible = 'true';
    if (!settled) schedule();
  }

  function schedule() {
    if (!destroyed && position && !frame) frame = requestAnimationFrame(render);
  }

  function move(event: PointerEvent) {
    if (destroyed) return;
    if (event.pointerType !== 'mouse' || !event.isPrimary || !eligible()) {
      hide();
      return;
    }

    position = { x: event.clientX, y: event.clientY };
    schedule();
  }

  function press(event: PointerEvent) {
    if (
      destroyed ||
      event.pointerType !== 'mouse' ||
      !event.isPrimary ||
      event.button !== 0 ||
      !eligible() ||
      !overGrid({ x: event.clientX, y: event.clientY })
    ) {
      return;
    }

    pressedPointer = event.pointerId;
    host.dataset.cursorPressed = 'true';
    move(event);
  }

  function release(event: PointerEvent) {
    if (destroyed || pressedPointer !== event.pointerId) return;
    pressedPointer = undefined;
    delete host.dataset.cursorPressed;
  }

  const destroyLayout = observeProjectsLayout(viewport, reset);

  viewport.addEventListener('pointerenter', move);
  viewport.addEventListener('pointermove', move, { passive: true });
  viewport.addEventListener('pointerdown', press);
  viewport.addEventListener('pointerleave', reset);
  viewport.addEventListener('pointercancel', reset);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  window.addEventListener('keydown', reset);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', reset);
  viewport.addEventListener('lostpointercapture', release);
  window.addEventListener('scroll', schedule, { capture: true, passive: true });
  document.addEventListener('visibilitychange', reset);
  desktopMouse.addEventListener('change', reset);
  coarsePointer.addEventListener('change', reset);

  return () => {
    if (destroyed) return;
    destroyed = true;
    hide();
    cursor.style.removeProperty('transform');
    destroyLayout();
    viewport.removeEventListener('pointerenter', move);
    viewport.removeEventListener('pointermove', move);
    viewport.removeEventListener('pointerdown', press);
    viewport.removeEventListener('pointerleave', reset);
    viewport.removeEventListener('pointercancel', reset);
    window.removeEventListener('blur', reset);
    window.removeEventListener('resize', reset);
    window.removeEventListener('keydown', reset);
    window.removeEventListener('pointerup', release);
    window.removeEventListener('pointercancel', reset);
    viewport.removeEventListener('lostpointercapture', release);
    window.removeEventListener('scroll', schedule, true);
    document.removeEventListener('visibilitychange', reset);
    desktopMouse.removeEventListener('change', reset);
    coarsePointer.removeEventListener('change', reset);
  };
}
