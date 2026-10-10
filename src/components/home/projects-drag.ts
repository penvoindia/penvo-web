import {
  hasProjectsOverflow,
  observeProjectsLayout,
} from './projects-overflow';

// Free-mode constants measured on the reference slider (Swiper 8.4.5).
const directionDistance = 5;
const resistanceRatio = 0.85;
const momentumDuration = 1000;
const minimumVelocity = 0.02;
const bounceRatio = 20;
const returnDuration = 600;

type DragSample = { x: number; time: number };
type MotionLeg = { from: number; to: number; duration: number };

type ProjectPress = {
  pointerId: number;
  x: number;
  y: number;
  /** Unresisted scroll position where the press began. */
  origin: number;
  direction?: 'horizontal' | 'vertical';
  moved: boolean;
  samples: DragSample[];
};

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const curve = (a: number, b: number, c: number, t: number) =>
    ((a * t + b) * t + c) * t;

  return (progress: number) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    // Solve x(t) = progress with Newton's method, falling back to bisection.
    let t = progress;
    for (let step = 0; step < 8; step++) {
      const error = curve(ax, bx, cx, t) - progress;
      if (Math.abs(error) < 1e-7) return curve(ay, by, cy, t);
      const slope = (3 * ax * t + 2 * bx) * t + cx;
      if (Math.abs(slope) < 1e-7) break;
      t = Math.min(1, Math.max(0, t - error / slope));
    }
    let low = 0;
    let high = 1;
    t = progress;
    for (let step = 0; step < 40; step++) {
      const x = curve(ax, bx, cx, t);
      if (Math.abs(x - progress) < 1e-7) break;
      if (x < progress) low = t;
      else high = t;
      t = (low + high) / 2;
    }
    return curve(ay, by, cy, t);
  };
}

/** CSS `ease-out`, the reference's free-mode transition timing. */
export const easeOut = cubicBezier(0, 0, 0.58, 1);

/** Visible travel for a drag that has gone `distance` past an edge. */
export function resistOvershoot(distance: number): number {
  return distance > 0 ? Math.max(0, distance ** resistanceRatio - 1) : 0;
}

function unresistOvershoot(offset: number) {
  return offset > 0 ? (offset + 1) ** (1 / resistanceRatio) : 0;
}

export function createProjectsDrag(viewport: HTMLElement): () => void {
  const mouse = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(any-pointer: coarse)');
  let press: ProjectPress | undefined;
  let suppressClick = false;
  let frame: number | undefined;
  let destroyed = false;
  // Scroll extent cached while the strip moves; overshoot can change scrollWidth.
  let limit = 0;
  // Last rendered position in scroll units; outside 0..limit is overshoot.
  let position = 0;
  let overshoot = 0;

  function maximum() {
    return Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  }

  function eligible() {
    return (
      mouse.matches &&
      !coarsePointer.matches &&
      !document.hidden &&
      hasProjectsOverflow(viewport)
    );
  }

  function setOvershoot(next: number) {
    if (next === overshoot) return;
    overshoot = next;
    const grid = viewport.querySelector<HTMLElement>('[data-projects-grid]');
    if (!grid) return;
    if (next) grid.style.setProperty('--projects-overshoot', `${next}px`);
    else grid.style.removeProperty('--projects-overshoot');
  }

  // The drag position that renders `value`, undoing edge resistance.
  function unresisted(value: number) {
    if (value < 0) return -unresistOvershoot(-value);
    if (value > limit) return limit + unresistOvershoot(value - limit);
    return value;
  }

  function render(next: number) {
    position = next;
    const left = Math.max(0, Math.min(limit, next));
    viewport.scrollLeft = left;
    setOvershoot(left - next);
  }

  function stopMotion() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  }

  function clearPress() {
    press = undefined;
    document.removeEventListener('selectstart', selectStart, true);
    document.removeEventListener('dragstart', pressDragStart, true);
    document.removeEventListener('selectionchange', clearGallerySelection);
    delete viewport.dataset.dragging;
  }

  function reset() {
    if (destroyed) return;
    stopMotion();
    suppressClick = false;
    clearPress();
    setOvershoot(0);
  }

  function refresh() {
    if (destroyed) return;
    reset();
    if (hasProjectsOverflow(viewport)) viewport.dataset.scrollable = 'true';
    else delete viewport.dataset.scrollable;
  }

  // Late images and fonts re-measure the strip as it moves into view; they
  // interrupt a gesture or glide only when the scroll extent really changed.
  function relayout() {
    if (destroyed) return;
    const moving = press !== undefined || frame !== undefined;
    if (
      moving &&
      hasProjectsOverflow(viewport) &&
      (overshoot !== 0 || Math.abs(maximum() - limit) <= 1)
    ) {
      return;
    }
    refresh();
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

  function animate(legs: MotionLeg[]) {
    stopMotion();
    let leg = 0;
    let started: number | undefined;

    function advance(time: number) {
      frame = undefined;
      if (destroyed) return;
      if (!eligible()) {
        setOvershoot(0);
        return;
      }
      const current = legs[leg]!;
      started ??= time;
      const progress =
        current.duration > 0
          ? Math.min(1, Math.max(0, (time - started) / current.duration))
          : 1;
      render(current.from + (current.to - current.from) * easeOut(progress));
      if (progress < 1) {
        frame = window.requestAnimationFrame(advance);
        return;
      }
      // Like the reference, a bounce returns from the edge on a later frame.
      leg++;
      started = undefined;
      if (leg < legs.length) frame = window.requestAnimationFrame(advance);
    }

    frame = window.requestAnimationFrame(advance);
  }

  function returnToEdge() {
    const edge = position < 0 ? 0 : limit;
    if (reducedMotion.matches) render(edge);
    else animate([{ from: position, to: edge, duration: returnDuration }]);
  }

  function releaseVelocity(samples: DragSample[], releaseTime: number) {
    const [previous, latest] = samples;
    if (!previous || !latest) return 0;
    const interval = latest.time - previous.time;
    if (
      interval <= 0 ||
      interval > 150 ||
      releaseTime < latest.time ||
      releaseTime - latest.time > 300
    ) {
      return 0;
    }
    const velocity = (previous.x - latest.x) / interval / 2;
    return Math.abs(velocity) < minimumVelocity ? 0 : velocity;
  }

  function release(samples: DragSample[], releaseTime: number) {
    // Released past an edge, the strip returns without momentum.
    if (position < 0 || position > limit) {
      returnToEdge();
      return;
    }
    if (reducedMotion.matches) return;
    const velocity = releaseVelocity(samples, releaseTime);
    if (!velocity) return;

    const target = position + velocity * momentumDuration;
    if (target >= 0 && target <= limit) {
      animate([{ from: position, to: target, duration: momentumDuration }]);
      return;
    }

    const bounce = Math.abs(velocity) * bounceRatio;
    const edge = target < 0 ? 0 : limit;
    // As in the reference, the far end always bounces by the full amount.
    const peak = target < 0 ? Math.max(target, -bounce) : limit + bounce;
    animate([
      {
        from: position,
        to: peak,
        duration: Math.abs((peak - position) / velocity),
      },
      { from: peak, to: edge, duration: returnDuration },
    ]);
  }

  function down(event: PointerEvent) {
    if (destroyed) return;
    // Like the reference, secondary and middle buttons leave any motion running.
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const moving = frame !== undefined;
    stopMotion();
    suppressClick = false;
    if (
      press ||
      event.pointerType !== 'mouse' ||
      !event.isPrimary ||
      event.button !== 0 ||
      !eligible()
    ) {
      if (!press) setOvershoot(0);
      return;
    }

    // Cancel selection immediately, without giving a mouse press keyboard focus.
    event.preventDefault();
    // A press during motion freezes the strip where it is, even past an edge.
    if (!moving) {
      limit = maximum();
      position = Math.max(0, Math.min(limit, viewport.scrollLeft));
      setOvershoot(0);
    }
    press = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      origin: unresisted(position),
      moved: false,
      samples: [{ x: event.clientX, time: event.timeStamp }],
    };
    document.addEventListener('selectstart', selectStart, true);
    document.addEventListener('dragstart', pressDragStart, true);
    document.addEventListener('selectionchange', clearGallerySelection);
    clearGallerySelection();
    // Like the reference, a press past an edge keeps returning to it while held.
    if (position < 0 || position > limit) returnToEdge();
  }

  function move(event: PointerEvent) {
    if (destroyed || !press || event.pointerId !== press.pointerId) return;
    if (!(event.buttons & 1) || !eligible()) {
      reset();
      return;
    }

    const deltaX = event.clientX - press.x;
    const deltaY = event.clientY - press.y;
    if (!press.direction) {
      // The reference decides once the pointer is 5px away, or on a level move.
      if (deltaY === 0) press.direction = 'horizontal';
      else if (deltaX ** 2 + deltaY ** 2 >= directionDistance ** 2) {
        press.direction =
          Math.abs(deltaY) > Math.abs(deltaX) ? 'vertical' : 'horizontal';
      }
    }
    if (press.direction === 'vertical') {
      clearPress();
      if (position < 0 || position > limit) returnToEdge();
      return;
    }

    event.preventDefault();
    let offset = deltaX;
    if (frame !== undefined) {
      // Dragging takes over from a held edge return wherever it has reached.
      stopMotion();
      press.origin = unresisted(position);
      press.x = event.clientX;
      offset = 0;
    }
    if (offset) {
      press.moved = true;
      viewport.dataset.dragging = 'true';
    }
    const raw = press.origin - offset;
    render(
      raw < 0
        ? -resistOvershoot(-raw)
        : raw > limit
          ? limit + resistOvershoot(raw - limit)
          : raw,
    );
    press.samples.push({ x: event.clientX, time: event.timeStamp });
    if (press.samples.length > 2) press.samples.shift();
  }

  function up(event: PointerEvent) {
    if (destroyed || !press || event.pointerId !== press.pointerId) return;
    const { moved, samples } = press;
    clearPress();
    suppressClick = moved;
    // A still press past an edge lets its return finish.
    if (!moved && frame !== undefined) return;
    release(samples, event.timeStamp);
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

  // Native wheel, touch, and keyboard scrolling take over from any motion.
  function nativeInput() {
    if (destroyed || press) return;
    stopMotion();
    setOvershoot(0);
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

  const destroyLayout = observeProjectsLayout(viewport, relayout);

  viewport.addEventListener('pointerdown', down);
  viewport.addEventListener('click', click, true);
  viewport.addEventListener('dragstart', dragStart);
  viewport.addEventListener('selectstart', selectStart);
  window.addEventListener('pointermove', move, { passive: false });
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', cancel);
  window.addEventListener('blur', reset);
  window.addEventListener('resize', refresh);
  viewport.addEventListener('wheel', nativeInput, { passive: true });
  viewport.addEventListener('touchstart', nativeInput, { passive: true });
  window.addEventListener('keydown', reset);
  document.addEventListener('visibilitychange', reset);
  mouse.addEventListener('change', refresh);
  reducedMotion.addEventListener('change', refresh);
  coarsePointer.addEventListener('change', refresh);

  return () => {
    if (destroyed) return;
    destroyed = true;
    stopMotion();
    suppressClick = false;
    clearPress();
    setOvershoot(0);
    delete viewport.dataset.scrollable;
    destroyLayout();
    viewport.removeEventListener('pointerdown', down);
    viewport.removeEventListener('click', click, true);
    viewport.removeEventListener('dragstart', dragStart);
    viewport.removeEventListener('selectstart', selectStart);
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', cancel);
    window.removeEventListener('blur', reset);
    window.removeEventListener('resize', refresh);
    viewport.removeEventListener('wheel', nativeInput);
    viewport.removeEventListener('touchstart', nativeInput);
    window.removeEventListener('keydown', reset);
    document.removeEventListener('visibilitychange', reset);
    mouse.removeEventListener('change', refresh);
    reducedMotion.removeEventListener('change', refresh);
    coarsePointer.removeEventListener('change', refresh);
  };
}
