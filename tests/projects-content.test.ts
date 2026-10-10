import { describe, expect, it } from 'vitest';

import {
  getFeaturedProjects,
  type Project,
} from '@/src/components/home/projects-content';

function project(id: string, featured: boolean): Project {
  return {
    id,
    title: `Project ${id}`,
    category: 'Brand identity',
    year: '2026',
    brand: 'Example brand',
    image: `/projects/${id}.webp`,
    alt: `Cover for project ${id}`,
    width: 1200,
    height: 900,
    featured,
  };
}

describe('featured project selection', () => {
  it('returns an empty list when there are no projects', () => {
    expect(getFeaturedProjects([])).toEqual([]);
  });

  it('excludes projects that are not featured', () => {
    expect(
      getFeaturedProjects([project('first', false), project('second', false)]),
    ).toEqual([]);
  });

  it('keeps only featured projects in their editorial order', () => {
    const projects = [
      project('third', true),
      project('hidden', false),
      project('first', true),
      project('second', true),
    ];

    expect(getFeaturedProjects(projects).map(({ id }) => id)).toEqual([
      'third',
      'first',
      'second',
    ]);
  });

  it('leaves the source records and list unchanged', () => {
    const featured = Object.freeze(project('featured', true));
    const hidden = Object.freeze(project('hidden', false));
    const source = Object.freeze([hidden, featured]);

    expect(getFeaturedProjects(source)).toEqual([featured]);
    expect(source).toEqual([hidden, featured]);
    expect(source[0]?.featured).toBe(false);
    expect(source[1]?.featured).toBe(true);
  });
});
