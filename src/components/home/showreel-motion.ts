// Measured from the reference reel: the frame stays pinned for 140% of the
// viewport height and, over the last 15% of that distance before the pin,
// settles to 85% scale in the viewport centre, smoothed by a one-second catch-up.
export const showreelScale = 0.85;
export const showreelPinDistance = 1.4;
export const showreelSettleShare = 0.15;
export const showreelScrubDuration = 1000;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

export function getShowreelProgress(
  scrollY: number,
  sectionTop: number,
  viewportHeight: number,
) {
  const distance = viewportHeight * showreelPinDistance * showreelSettleShare;
  if (distance <= 0) return 1;

  return clamp((scrollY - sectionTop + distance) / distance);
}

export function getShowreelFrame(
  progress: number,
  viewportHeight: number,
  frameHeight: number,
) {
  return {
    scale: 1 - (1 - showreelScale) * progress,
    y: ((viewportHeight - frameHeight) / 2) * progress,
  };
}

// How far the page has turned from black to white. As in the reference, this
// runs from the section top at 20% of the viewport to the centre of its 140vh
// pin distance at the viewport centre, with GSAP's default `power1.out` and no
// scrub lag.
export function getShowreelBackdrop(
  scrollY: number,
  sectionTop: number,
  viewportHeight: number,
) {
  const start = sectionTop - viewportHeight * 0.2;
  const end = sectionTop + viewportHeight * (showreelPinDistance / 2 - 0.5);
  if (end <= start) return scrollY >= end ? 1 : 0;

  return 1 - (1 - clamp((scrollY - start) / (end - start))) ** 2;
}

// The next section has scrolled fully over the pinned frame.
export function isShowreelCovered(
  scrollY: number,
  sectionTop: number,
  viewportHeight: number,
) {
  return scrollY >= sectionTop + viewportHeight * showreelPinDistance;
}

// GSAP's `expo.out`, which eases a scrubbed animation toward the scroll position.
export function scrubEase(t: number) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

// Like `scrub: 1`, each new target restarts the catch-up from the current value.
export function createShowreelScrub(duration = showreelScrubDuration) {
  let from = 0;
  let to = 0;
  let start = Number.NEGATIVE_INFINITY;

  function sample(now: number) {
    const elapsed = duration > 0 ? (now - start) / duration : 1;
    return from + (to - from) * scrubEase(clamp(elapsed));
  }

  return {
    sample,
    jump(value: number) {
      from = value;
      to = value;
      start = Number.NEGATIVE_INFINITY;
    },
    target(value: number, now: number) {
      if (value === to) return;
      from = sample(now);
      to = value;
      start = now;
    },
    settled(now: number) {
      return duration <= 0 || now - start >= duration;
    },
  };
}
