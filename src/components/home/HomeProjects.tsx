import Image from 'next/image';
import type { CSSProperties } from 'react';

import { ButtonLink } from '@/src/components/ui/Button';

import {
  getFeaturedProjects,
  homeProjects,
  projectsLimit,
  type Project,
} from './projects-content';
import {
  layoutProjects,
  type TabletPlacement,
  type TabletTrack,
} from './projects-layout';
import { ProjectsGallery } from './ProjectsGallery';
import styles from './HomeProjects.module.css';

const tabletTrackSizes = {
  third: 'var(--projects-tablet-third)',
  half: 'var(--projects-tablet-half)',
} as const;

// Rendered widths follow the gallery formulas in HomeProjects.module.css.
// Each vw term follows a space so next/image can derive small srcset widths.
function imageSizes(tablet: TabletPlacement, track: TabletTrack | undefined) {
  const tabletWidth =
    track === 'half'
      ? 'calc(-15px + 45vw)'
      : tablet.columns > 1
        ? 'calc(-10px + 60vw)'
        : 'calc(-20px + 30vw)';
  return [
    '(min-width: 1700px) 378px',
    '(min-width: 1280px) calc(-47px + 25vw)',
    `(min-width: 768px) ${tabletWidth}`,
    '90vw',
  ].join(', ');
}

export function HomeProjects({
  projects = homeProjects,
}: {
  projects?: readonly Project[];
}) {
  const featuredProjects = getFeaturedProjects(projects).slice(
    0,
    projectsLimit,
  );
  if (!featuredProjects.length) return null;

  const { placements, tabletTracks } = layoutProjects(featuredProjects);
  const gridStyle = {
    '--projects-tablet-tracks': tabletTracks
      .map((track) => tabletTrackSizes[track])
      .join(' '),
  } as CSSProperties;

  return (
    <section
      aria-labelledby="home-projects-title"
      className={styles.section}
      id="projects"
    >
      <div className="layout-container">
        <div className={styles.header}>
          <div className={styles.headingCopy}>
            <p className={`${styles.eyebrow} type-eyebrow`}>Work</p>
            <h2 className="type-heading-1" id="home-projects-title">
              Selected projects.
            </h2>
          </div>
          <ButtonLink
            className={`${styles.explore} ${styles.headerExplore}`}
            href="/work"
            variant="primary"
          >
            Explore More
          </ButtonLink>
        </div>
      </div>
      <ProjectsGallery>
        <ul
          className={styles.grid}
          data-projects-grid
          role="list"
          style={gridStyle}
        >
          {placements.map(({ project, desktop, tablet, mobile }) => {
            const titleId = `project-${project.id}-title`;
            const metadataId = `project-${project.id}-metadata`;
            const placement = {
              '--desktop-column': desktop.column,
              '--desktop-row': desktop.row,
              '--desktop-rows': desktop.rows,
              '--tablet-column': tablet.column,
              '--tablet-columns': tablet.columns,
              '--tablet-row': tablet.row,
              '--tablet-rows': tablet.rows,
              '--mobile-column': mobile.column,
              '--mobile-row': mobile.row,
            } as CSSProperties;

            return (
              <li
                className={styles.tile}
                data-project-id={project.id}
                key={project.id}
                style={placement}
              >
                <figure
                  aria-describedby={metadataId}
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
                      sizes={imageSizes(
                        tablet,
                        tabletTracks[tablet.column - 1],
                      )}
                      src={project.image}
                      style={
                        project.objectPosition
                          ? { objectPosition: project.objectPosition }
                          : undefined
                      }
                    />
                  </div>
                  <figcaption className={styles.overlay}>
                    {project.logo && (
                      <div aria-hidden="true" className={styles.logoSlot}>
                        <Image
                          alt=""
                          className={styles.brandLogo}
                          draggable={false}
                          height={project.logo.height}
                          loading="lazy"
                          src={project.logo.src}
                          width={project.logo.width}
                        />
                      </div>
                    )}
                    <div className={styles.caption}>
                      <h3
                        className={`${styles.line} ${styles.title} type-heading-5`}
                        id={titleId}
                      >
                        <span className={`${styles.reveal} ${styles.clamp}`}>
                          {project.title}
                        </span>
                      </h3>
                      <p
                        className={`${styles.line} ${styles.meta} type-body`}
                        id={metadataId}
                      >
                        <span className={`${styles.reveal} ${styles.metadata}`}>
                          <time dateTime={project.year}>{project.year}</time>
                          <span
                            aria-hidden="true"
                            className={styles.separator}
                          />
                          <span>{project.category}</span>
                        </span>
                      </p>
                    </div>
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </ProjectsGallery>
      <div className={`${styles.footer} layout-container`}>
        <ButtonLink className={styles.explore} href="/work" variant="primary">
          Explore More
        </ButtonLink>
      </div>
    </section>
  );
}
