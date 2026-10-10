import {
  hasProjectsOverflow,
  observeProjectsLayout,
} from './projects-overflow';

const dragThreshold = 6;
const glideDuration = 1000;
const minimumVelocity = 0.02;

type DragSample = { x: number; time: number };

type ProjectPress = {
  pointerId: number;
  x: number;
  y: number;
  left: number;
  dragging: boolean;
  captured: boolean;
  samples: DragSample[];
};

export function createProjectsDrag(viewport: HTMLElement): () => void {
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(any-pointer: coarse)');
  let press: ProjectPress | undefined;
  let suppressClick = false;
  let frame: number | undefined;
  let destroyed = false;

  function maximum() {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function eligible() {
    return (
      mouse.matches &&
      !coarsePointer.matches &&
      !reducedMotion.matches &&
      !document.hidden &&
      hasProjectsOverflow(viewport)
    );
  }

  function stopGlide() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  }

  function clearPress() {
    const previous = press;
    press = undefined;
    document.removeEventListener('selectstart', selectStart, true);
    document.removeEventListener('dragstart', pressDragStart, true);
    document.removeEventListener('selectionchange', clearGallerySelection);
    delete viewport.dataset.dragging;
    if (!previous?.captured) return;

    try {
      if (viewport.hasPointerCapture(previous.pointerId)) {
        viewport.releasePointerCapture(previous.pointerId);
      }
    } catch {
      // The element or pointer can disappear before its capture is released.
    }
  }

  function reset() {
    if (destroyed) return;
    stopGlide();
    suppressClick = false;
    clearPress();
  }

  function refresh() {
    if (destroyed) return;
    reset();
    if (hasProjectsOverflow(viewport)) viewport.dataset.scrollable = 'true';
    else delete viewport.dataset.scrollable;
  }

  function clearGallerySelection() {
    if (destroyed || !press) return;
    const selection = document.getSelection?.();
    if (!selection) return;
    for (let index = 0; index < selection.rangeCount; index++) {
      if (selection.getRangeAt(index).intersectsNode(viewport)) {
        selection.removeAllRanges();
        return;
      }
    }
  }

  function down(event: PointerEvent) {
    if (destroyed) return;
    stopGlide();
    suppressClick = false;
    if (
      press ||
      event.pointerType !== 'mouse' ||
      !event.isPrimary ||
      event.button !== 0 ||
      !eligible()
    ) {
      return;
    }

    // Cancel selection immediately, without giving a mouse press keyboard focus.
    event.preventDefault();
    press = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: Math.max(0, Math.min(maximum(), viewport.scrollLeft)),
      dragging: false,
      captured: false,
      samples: [{ x: event.clientX, time: event.timeStamp }],
    };
    document.addEventListener('selectstart', selectStart, true);
    document.addEventListener('dragstart', pressDragStart, true);
    document.addEventListener('selectionchange', clearGallerySelection);
    clearGallerySelection();
  }

  function move(event: PointerEvent) {
    if (destroyed || !press || event.pointerId !== press.pointerId) return;
    if (!(event.buttons & 1) || !eligible()) {
      reset();
      return;
    }

    const deltaX = event.clientX - press.x;
    const deltaY = event.clientY - press.y;
    if (!press.dragging) {
      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < dragThreshold) {
        event.preventDefault();
        return;
      }
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        reset();
        return;
      }

      try {
        viewport.setPointerCapture(event.pointerId);
      } catch {
        reset();
        return;
      }
      press.captured = true;
      press.dragging = true;
      viewport.dataset.dragging = 'true';
    }

    event.preventDefault();
    viewport.scrollLeft = Math.max(0, Math.min(maximum(), press.left - deltaX));
    press.samples.push({ x: event.clientX, time: event.timeStamp });
    if (press.samples.length > 2) press.samples.shift();
  }

  function glide(samples: DragSample[], releaseTime: number) {
    if (reducedMotion.matches) return;
    const [previous, latest] = samples;
    if (!previous || !latest) return;
    const interval = latest.time - previous.time;
    if (
      interval <= 0 ||
      interval > 150 ||
      releaseTime < latest.time ||
      releaseTime - latest.time > 300
    ) {
      return;
    }
    const velocity = (previous.x - latest.x) / interval / 2;
    if (Math.abs(velocity) < minimumVelocity) return;

    const from = Math.max(0, Math.min(maximum(), viewport.scrollLeft));
    const to = Math.max(
      0,
      Math.min(maximum(), from + velocity * glideDuration),
    );
    const distance = to - from;
    if (Math.abs(distance) < 0.1) return;
    const duration = Math.abs(distance / velocity);
    const started = performance.now();

    function advance(time: number) {
      frame = undefined;
      if (destroyed || !eligible() || reducedMotion.matches) return;
      const progress = Math.max(0, Math.min(1, (time - started) / duration));
      const eased = 1 - (1 - progress) ** 3;
      viewport.scrollLeft = Math.max(
        0,
        Math.min(maximum(), from + distance * eased),
      );
      if (progress < 1) frame = window.requestAnimationFrame(advance);
    }

    frame = window.requestAnimationFrame(advance);
  }

  function up(event: PointerEvent) {
    if (destroyed || !press || event.pointerId !== press.pointerId) return;
    suppressClick = press.dragging;
    const samples = press.samples;
    clearPress();
    if (suppressClick) glide(samples, event.timeStamp);
  }

  function cancel(event: PointerEvent) {
    if (destroyed || !press || event.pointerId !== press.pointerId) return;
    reset();
  }

  function click(event: MouseEvent) {
    if (
      destroyed ||
      !suppressClick ||
      event.button !== 0 ||
      event.detail === 0
    ) {
      return;
    }
    suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function dragStart(event: DragEvent) {
    if (!destroyed && eligible()) event.preventDefault();
  }

  function selectStart(event: Event) {
    if (!destroyed && press) event.preventDefault();
  }

  function pressDragStart(event: DragEvent) {
    if (!destroyed && press) event.preventDefault();
  }

  const destroyLayout = observeProjectsLayout(viewport, refresh);

  viewport.addEventListener('pointerdown', down);
  viewport.addEventListener('lostpointercapture', cancel);
  viewport.addEventListener('click', click, true);
  viewport.addEventListener('dragstart', dragStart);
  viewport.addEventListener('selectstart', selectStart);
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', refresh);
  viewport.addEventListener('wheel', stopGlide, { passive: true });
  viewport.addEventListener('touchstart', stopGlide, { passive: true });
  window.addEventListener('keydown', reset);
  document.addEventListener('visibilitychange', reset);
  mouse.addEventListener('change', refresh);
  reducedMotion.addEventListener('change', refresh);
  coarsePointer.addEventListener('change', refresh);

  return () => {
    if (destroyed) return;
    destroyed = true;
    stopGlide();
    suppressClick = false;
    clearPress();
    delete viewport.dataset.scrollable;
    destroyLayout();
    viewport.removeEventListener('pointerdown', down);
    viewport.removeEventListener('lostpointercapture', cancel);
    viewport.removeEventListener('click', click, true);
    viewport.removeEventListener('dragstart', dragStart);
    viewport.removeEventListener('selectstart', selectStart);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('blur', reset);
    window.removeEventListener('resize', refresh);
    viewport.removeEventListener('wheel', stopGlide);
    viewport.removeEventListener('touchstart', stopGlide);
    window.removeEventListener('keydown', reset);
    document.removeEventListener('visibilitychange', reset);
    mouse.removeEventListener('change', refresh);
    reducedMotion.removeEventListener('change', refresh);
    coarsePointer.removeEventListener('change', refresh);
  };
}
