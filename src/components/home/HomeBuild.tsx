import { BuildExperience } from './BuildExperience';
import { buildShards } from './build-motion';
import styles from './HomeBuild.module.css';

export function HomeBuild() {
  return (
    <BuildExperience>
      <div className={styles.content} data-build-content>
        <div className={styles.headline}>
          <h2
            className={`${styles.title} type-display-mega`}
            data-build-title
            id="home-build-title"
          >
            <span className={styles.word} data-build-left>
              Let’s
            </span>{' '}
            <span
              className={`${styles.word} ${styles.accent}`}
              data-build-right
            >
              build
            </span>
          </h2>
          <div aria-hidden="true" className={styles.fragments}>
            {buildShards.map((shard, index) => (
              <div
                className={styles.shard}
                data-build-shard
                key={index}
                style={{ clipPath: shard.clip, transformOrigin: shard.origin }}
              >
                <div className={`${styles.title} type-display-mega`}>
                  <span>Let’s</span>{' '}
                  <span className={styles.accent}>build</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div data-build-caption>
          <p className={`${styles.subtitle} type-eyebrow`} data-build-subtitle>
            Where ideas become impact
          </p>
        </div>
      </div>
    </BuildExperience>
  );
}
