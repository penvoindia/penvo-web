export function getProcessTravel(trackWidth: number, viewportWidth: number) {
  return Math.max(0, trackWidth - viewportWidth);
}

export function getProcessSectionHeight(
  travel: number,
  viewportHeight: number,
) {
  return Math.max(viewportHeight, travel + viewportHeight);
}

export function getProcessProgress(
  scrollY: number,
  sectionTop: number,
  travel: number,
) {
  if (travel <= 0) return 0;

  return Math.min(1, Math.max(0, (scrollY - sectionTop) / travel));
}
