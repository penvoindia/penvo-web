export const WORK_TOGETHER_SPEED = 90;
export const WORK_TOGETHER_FALLBACK_DURATION = 14;
export const WORK_TOGETHER_MIN_DURATION = 6;

export function getWorkTogetherDuration(distance: number) {
  if (!Number.isFinite(distance) || distance <= 0) {
    return WORK_TOGETHER_FALLBACK_DURATION;
  }

  return Math.max(WORK_TOGETHER_MIN_DURATION, distance / WORK_TOGETHER_SPEED);
}
