// Supplied reel for the current homepage design.
export type ShowreelSource = {
  src: string;
  type: string;
};

// The thumbnail is always the video's own first frame, so there is no poster.
export type Showreel = {
  sources: readonly ShowreelSource[];
  width: number;
  height: number;
  label: string;
};

export const homeShowreel: Showreel = {
  sources: [{ src: '/showreel/vb-reel-2026.mp4', type: 'video/mp4' }],
  width: 1920,
  height: 1080,
  label: 'Penvo showreel',
};
