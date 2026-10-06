const clamp = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

export const BUILD_IMPACT = 0.45;
export const BUILD_BREAK = 0.62;

// Exact radial fan from the user's local Navbar Digital CollisionSection.
const impactCenter = [52, 46] as const;
const perimeter = [
  [20, 0],
  [50, 0],
  [80, 0],
  [100, 25],
  [100, 70],
  [82, 100],
  [52, 100],
  [20, 100],
  [0, 72],
  [0, 28],
] as const;
const corners: Record<number, readonly [number, number]> = {
  2: [100, 0],
  4: [100, 100],
  7: [0, 100],
  9: [0, 0],
};
const sparks = [
  [-120, -90, 45, 1],
  [130, -70, -30, 0.8],
  [-160, 30, 70, 0.7],
  [150, 60, -60, 1.1],
  [-60, -140, 20, 0.6],
  [70, 130, -45, 0.9],
  [-30, 120, 90, 0.5],
  [40, -120, -80, 0.7],
] as const;

export const buildShards = perimeter.map((point, index) => {
  const next = (index + 1) % perimeter.length;
  const corner = corners[index];
  const points = [
    impactCenter,
    point,
    ...(corner ? [corner] : []),
    perimeter[next]!,
  ];
  const centerX = points.reduce((sum, [x]) => sum + x, 0) / points.length;
  const centerY = points.reduce((sum, [, y]) => sum + y, 0) / points.length;
  const dx = centerX - impactCenter[0];
  const dy = centerY - impactCenter[1];
  return {
    clip: `polygon(${points.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(', ')})`,
    origin: `${centerX.toFixed(1)}% ${centerY.toFixed(1)}%`,
    start: BUILD_BREAK + 0.012 * index,
    drift: dx * 0.4,
    separationX: (dx / 55) * 3.5,
    separationY: (dy / 55) * 7,
    fall: 82 * (0.75 + 0.25 * clamp(Math.hypot(dx, dy) / 55)),
    rotation: (dx < 0 ? -1 : 1) * (9 + 5 * (index % 3)),
  };
});

export function getBuildFrame(progress: number, width: number, height: number) {
  const p = clamp(progress);
  const vw = Math.max(0, Number.isFinite(width) ? width : 0) / 100;
  const vh = Math.max(0, Number.isFinite(height) ? height : 0) / 100;
  const approach = clamp(p / 0.42);
  const settle = clamp((p - 0.42) / 0.03);
  const leftX = p < 0.42 ? -58 + 59.2 * approach : 1.2 * (1 - settle);
  return {
    leftX: leftX * vw,
    rightX: -leftX * vw,
    skew: 12 * (1 - clamp(p / BUILD_IMPACT)),
    titleOpacity: p < BUILD_BREAK ? 1 : 0,
    captionOpacity: 1 - clamp((p - BUILD_BREAK) / 0.08),
    captionY:
      Number((clamp((p - BUILD_BREAK) / 0.2) ** 2 * 30).toFixed(2)) * vh,
    exploreHintOpacity: 1 - clamp((p - 0.02) / 0.06),
    hintOpacity: clamp((p - 0.1) / 0.04) * (1 - clamp((p - 0.18) / 0.12)),
    shards: buildShards.map((shard) => {
      const fall = clamp((p - shard.start) / (0.96 - shard.start));
      const separate = Math.min(1, fall * 3);
      return {
        x:
          Number(
            (shard.separationX * separate + shard.drift * fall).toFixed(2),
          ) * vw,
        y:
          Number(
            (shard.separationY * separate + shard.fall * fall ** 2).toFixed(2),
          ) * vh,
        rotation: shard.rotation * fall ** 2,
        opacity: p < BUILD_BREAK ? 0 : 1 - clamp((fall - 0.6) / 0.4),
      };
    }),
  };
}

export function createBuildMotion(section: HTMLElement) {
  const stage = section.querySelector<HTMLElement>('[data-build-stage]');
  const title = section.querySelector<HTMLElement>('[data-build-title]');
  const left = section.querySelector<HTMLElement>('[data-build-left]');
  const right = section.querySelector<HTMLElement>('[data-build-right]');
  const caption = section.querySelector<HTMLElement>('[data-build-caption]');
  const subtitle = section.querySelector<HTMLElement>('[data-build-subtitle]');
  const hint = section.querySelector<HTMLElement>('[data-build-hint]');
  const exploreHint = section.querySelector<HTMLElement>(
    '[data-build-explore-hint]',
  );
  const shards = [
    ...section.querySelectorAll<HTMLElement>('[data-build-shard]'),
  ];
  if (!stage || !title || !left || !right || !caption || !hint) return () => {};

  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let disposeMotion: (() => void) | undefined;

  function configure() {
    disposeMotion?.();
    disposeMotion = undefined;
    if (preference.matches) return;

    section.dataset.motion = 'true';
    let frame = 0;
    let visible = true;
    let firstRender = true;
    let impacted = false;
    let viewportHeight = stage!.clientHeight;
    let viewportWidth = window.innerWidth;
    let animations: Animation[] = [];
    const easing =
      getComputedStyle(section)
        .getPropertyValue('--motion-ease-enter')
        .trim() || 'ease-out';

    function cancelImpact() {
      animations.forEach((animation) => animation.cancel());
      animations = [];
    }

    function animate(
      selector: string,
      keyframes: Keyframe[],
      duration: number,
      delay = 0,
      animationEasing = easing,
    ) {
      const element = section.querySelector<HTMLElement>(selector);
      if (element?.animate) {
        animations.push(
          element.animate(keyframes, {
            duration,
            delay,
            easing: animationEasing,
            fill: 'both',
          }),
        );
      }
    }

    function impact() {
      cancelImpact();
      animate(
        '[data-build-ring]',
        [
          { transform: 'translate(-50%, -50%) scale(0.2)', opacity: 0.9 },
          { transform: 'translate(-50%, -50%) scale(9)', opacity: 0 },
        ],
        900,
      );
      animate(
        '[data-build-flash]',
        [{ opacity: 0.35 }, { opacity: 0 }],
        500,
        0,
        'cubic-bezier(0, 0, 0.58, 1)',
      );
      animate(
        '[data-build-content]',
        [
          { transform: 'translate(0px, 0px)' },
          { transform: 'translate(-10px, 6px)' },
          { transform: 'translate(8px, -5px)' },
          { transform: 'translate(-5px, 3px)' },
          { transform: 'translate(3px, -2px)' },
          { transform: 'translate(0px, 0px)' },
        ].map((keyframe) => ({
          ...keyframe,
          easing: 'cubic-bezier(0, 0, 0.58, 1)',
        })),
        500,
        0,
        'linear',
      );
      animate(
        '[data-build-subtitle]',
        [
          { opacity: 0, transform: 'translateY(14px)' },
          { opacity: 1, transform: 'translateY(0px)' },
        ],
        600,
        250,
      );
      section
        .querySelectorAll<HTMLElement>('[data-build-spark]')
        .forEach((spark, index) => {
          const [x, y, rotation, scale] = sparks[index % sparks.length]!;
          if (spark.animate)
            animations.push(
              spark.animate(
                [
                  {
                    transform: `translate(0px, 0px) rotate(0deg) scale(${scale})`,
                    opacity: 1,
                  },
                  {
                    transform: `translate(${x * 1.6}px, ${y * 1.6}px) rotate(${rotation * 3}deg) scale(0)`,
                    opacity: 0,
                  },
                ],
                { duration: 800, delay: index * 15, easing, fill: 'both' },
              ),
            );
        });
    }

    function render() {
      frame = 0;
      if (document.visibilityState !== 'visible') return;
      // One layout read, followed by batched transform/opacity writes.
      const rect = section.getBoundingClientRect();
      const progress = clamp(
        -rect.top / Math.max(1, rect.height - viewportHeight),
      );
      const state = getBuildFrame(progress, viewportWidth, viewportHeight);
      left!.style.transform = `translateX(${state.leftX}px) skewX(${-state.skew}deg)`;
      right!.style.transform = `translateX(${state.rightX}px) skewX(${state.skew}deg)`;
      title!.style.opacity = String(state.titleOpacity);
      caption!.style.opacity = String(state.captionOpacity);
      caption!.style.transform = `translateY(${state.captionY}px)`;
      hint!.style.opacity = String(state.hintOpacity);
      if (exploreHint)
        exploreHint.style.opacity = String(state.exploreHintOpacity);
      shards.forEach((shard, index) => {
        const pose = state.shards[index];
        if (!pose) return;
        shard.style.transform = `translate(${pose.x}px, ${pose.y}px) rotate(${pose.rotation}deg)`;
        shard.style.opacity = String(pose.opacity);
      });

      const nextImpacted = progress >= BUILD_IMPACT;
      if (firstRender || impacted !== nextImpacted) {
        const previous = subtitle ? getComputedStyle(subtitle) : undefined;
        const previousOpacity = previous?.opacity ?? '1';
        const previousTransform = previous?.transform ?? 'translateY(0px)';
        impacted = nextImpacted;
        cancelImpact();
        // The underlying styles preserve the correct state when effects stop.
        if (subtitle) {
          subtitle.style.opacity = impacted ? '1' : '0';
          subtitle.style.transform = `translateY(${impacted ? 0 : 14}px)`;
        }
        if (!firstRender && visible) {
          if (impacted && progress < BUILD_BREAK) impact();
          else if (!impacted) {
            animate(
              '[data-build-subtitle]',
              [
                { opacity: previousOpacity, transform: previousTransform },
                { opacity: 0, transform: 'translateY(14px)' },
              ],
              600,
            );
          }
        }
        firstRender = false;
      }
    }

    function schedule() {
      if (!frame && visible && document.visibilityState === 'visible') {
        frame = requestAnimationFrame(render);
      }
    }

    function resize() {
      viewportHeight = stage!.clientHeight;
      viewportWidth = window.innerWidth;
      schedule();
    }

    function onVisibility() {
      if (document.visibilityState !== 'visible') {
        cancelAnimationFrame(frame);
        frame = 0;
        cancelImpact();
      } else {
        firstRender = true;
        schedule();
      }
    }

    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      if (visible) schedule();
      else {
        cancelAnimationFrame(frame);
        frame = 0;
        cancelImpact();
      }
    });
    const sizeObserver = new ResizeObserver(resize);
    intersection.observe(section);
    sizeObserver.observe(section);
    sizeObserver.observe(stage!);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    render();

    disposeMotion = () => {
      cancelAnimationFrame(frame);
      cancelImpact();
      intersection.disconnect();
      sizeObserver.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
      delete section.dataset.motion;
      [
        left,
        right,
        title,
        caption,
        subtitle,
        hint,
        exploreHint,
        ...shards,
      ].forEach((element) => {
        element?.style.removeProperty('transform');
        element?.style.removeProperty('opacity');
      });
    };
  }

  configure();
  preference.addEventListener('change', configure);
  return () => {
    preference.removeEventListener('change', configure);
    disposeMotion?.();
  };
}
