import type { Project, ProjectCoverShape } from './projects-content';

export type ProjectPlacement = {
  project: Project;
  shape: ProjectCoverShape;
  column: number;
  rowStart: number;
  rowSpan: number;
};

// The six cover frames repeat independently of the source image dimensions.
// Every pair shares a column; the seven-row frame is square at the gallery's
// shared column width, with shorter landscapes and taller portraits around it.
const coverFrames = [
  { rowStart: 1, rowSpan: 4, shape: 'landscape' },
  { rowStart: 5, rowSpan: 8, shape: 'portrait' },
  { rowStart: 1, rowSpan: 5, shape: 'landscape' },
  { rowStart: 6, rowSpan: 7, shape: 'square' },
  { rowStart: 1, rowSpan: 8, shape: 'portrait' },
  { rowStart: 9, rowSpan: 4, shape: 'landscape' },
] as const;

export function layoutProjects(
  projects: readonly Project[],
): ProjectPlacement[] {
  return projects.map((project, index) => ({
    project,
    column: Math.floor(index / 2) + 1,
    ...coverFrames[index % coverFrames.length]!,
  }));
}
