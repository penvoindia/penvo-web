import { ButtonLink } from '@/src/components/ui/Button';

import { HeroExperience, HeroRotatingWord } from './HeroExperience';
import styles from './HomeHero.module.css';

export function HomeHero() {
  return (
    <HeroExperience>
      <div className={`${styles.content} layout-container`}>
        <div className={styles.copy} data-hero-copy>
          <p className={`${styles.eyebrow} type-eyebrow`}>
            Creative &amp; digital agency · Kerala, India
          </p>
          <h1
            aria-label="The Creative Edge for Your Brand."
            className={`${styles.heading} type-display-giant`}
            id="home-hero-title"
          >
            <span aria-hidden="true" className={styles.headlineLine}>
              The Creative
            </span>
            <HeroRotatingWord />
            <span aria-hidden="true" className={styles.headlineLine}>
              for Your Brand
            </span>
          </h1>
          <p className={`${styles.lead} type-body-large`}>
            From Kerala, for brands ready to move forward. Penvo brings
            strategy, design, and technology together to build distinctive
            identities and digital experiences that connect with people.
          </p>
          <div className={styles.actions}>
            <ButtonLink href="/work">Explore our work</ButtonLink>
            <ButtonLink href="/start-a-project" variant="secondary">
              Start a project
            </ButtonLink>
          </div>
        </div>
      </div>
    </HeroExperience>
  );
}
