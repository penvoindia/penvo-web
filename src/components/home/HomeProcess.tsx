import { ButtonLink } from '@/src/components/ui/Button';

import { HomeProcessExperience } from './HomeProcessExperience';
import styles from './HomeProcess.module.css';

const stages = [
  {
    body: 'Every project starts with business reality, audience behaviour, and commercial objectives before a single asset is created.',
    step: '01',
    title: 'Strategy',
  },
  {
    body: 'Strategy becomes a coherent brand system: positioning, narrative, and identity people recognise and remember.',
    step: '02',
    title: 'Brand',
  },
  {
    body: 'The brand becomes a useful digital experience, designed around people, clarity, and action.',
    step: '03',
    title: 'Design',
  },
  {
    body: 'We turn the approved experience into a fast, durable, and carefully crafted working product.',
    step: '04',
    title: 'Develop',
  },
  {
    body: 'Brand, website, content, and campaigns come together as one clear launch experience.',
    step: '05',
    title: 'Launch',
  },
  {
    body: 'Launch is the beginning. We learn from performance and keep improving reach, conversion, and value.',
    step: '06',
    title: 'Grow',
  },
] as const;

export function HomeProcess() {
  return (
    <HomeProcessExperience className={styles.section}>
      <div className={styles.pin}>
        <div className={styles.track} data-process-track>
          <article className={`${styles.panel} ${styles.introPanel}`}>
            <p className={`${styles.introSubtitle} type-eyebrow`}>Approach</p>
            <h2
              className={`${styles.introTitle} type-display-huge`}
              id="process-title"
            >
              How we drive growth
            </h2>
            <p className={`${styles.body} type-body-large`}>
              A proven process that turns marketing from a cost centre into your
              most reliable growth engine.
            </p>
            <ButtonLink className={styles.action} href="/contact">
              Start a project
            </ButtonLink>
          </article>

          {stages.map((stage) => (
            <article className={styles.panel} key={stage.step}>
              <p className={`${styles.step} type-display-mega`}>
                {stage.step}
                <span aria-hidden="true" className={styles.stepPixel} />
              </p>
              <h3 className={`${styles.title} type-display-huge`}>
                {stage.title}
              </h3>
              <p className={`${styles.body} type-body-large`}>{stage.body}</p>
            </article>
          ))}
        </div>

        <div aria-hidden="true" className={styles.progressTrack}>
          <span className={styles.progress} data-process-progress />
        </div>
      </div>
    </HomeProcessExperience>
  );
}
