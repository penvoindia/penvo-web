import Image from 'next/image';
import type { CSSProperties } from 'react';

import {
  getFeaturedProjects,
  homeProjects,
  type Project,
} from './projects-content';
import { layoutProjects } from './projects-layout';
import { ProjectsGallery } from './ProjectsGallery';
import styles from './HomeProjects.module.css';

const mosaicInput =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
const projectImageSizes = [
  '(min-width: 1700px) and (any-pointer: coarse) 790px',
  '(min-width: 768px) and (any-pointer: coarse) 45vw',
  `(min-width: 1280px) and ${mosaicInput} calc(24.61vw - 14px)`,
  `(min-width: 1024px) and ${mosaicInput} 300px`,
  '(min-width: 1700px) 790px',
  '(min-width: 768px) 45vw',
  '90vw',
].join(', ');

export function HomeProjects({
  projects = homeProjects,
}: {
  projects?: readonly Project[];
}) {
  const featuredProjects = getFeaturedProjects(projects);
  if (!featuredProjects.length) return null;

  return (
    <section
      aria-labelledby="home-projects-title"
      className={styles.section}
      id="projects"
    >
      <div className="layout-container">
        <div className={styles.header}>
          <p className={`${styles.eyebrow} type-eyebrow`}>Work</p>
          <h2 className="type-heading-1" id="home-projects-title">
            Selected projects.
          </h2>
        </div>
      </div>
      <ProjectsGallery>
        <ul className={styles.grid} data-projects-grid role="list">
          {layoutProjects(featuredProjects).map(
            ({ project, shape, column, rowStart, rowSpan }) => {
              const titleId = `project-${project.id}-title`;
              const metadataId = `project-${project.id}-metadata`;
              const categoryId = `project-${project.id}-category`;
              const placement = {
                '--project-column': column,
                '--project-row-start': rowStart,
                '--project-row-span': rowSpan,
              } as CSSProperties;

              return (
                <li
                  className={styles.tile}
                  data-project-id={project.id}
                  data-project-shape={shape}
                  key={project.id}
                  style={placement}
                >
                  <figure
                    aria-describedby={`${metadataId} ${categoryId}`}
                    aria-labelledby={titleId}
                    className={styles.card}
                    tabIndex={0}
                  >
                    <div className={styles.media}>
                      <Image
                        alt={project.alt}
                        className={styles.image}
                        draggable={false}
                        fill
                        loading="lazy"
                        sizes={projectImageSizes}
                        src={project.image}
                      />
                    </div>
                    <figcaption className={styles.caption}>
                      <p
                        className={`${styles.metadata} type-body`}
                        id={metadataId}
                      >
                        <time dateTime={project.year}>{project.year}</time>
                        <span aria-hidden="true" className={styles.separator} />
                        <span>{project.brand}</span>
                      </p>
                      <h3
                        className={`${styles.title} type-heading-5`}
                        id={titleId}
                      >
                        {project.title}
                      </h3>
                      <p
                        className={`${styles.category} type-body-small`}
                        id={categoryId}
                      >
                        {project.category}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              );
            },
          )}
        </ul>
      </ProjectsGallery>
    </section>
  );
}
