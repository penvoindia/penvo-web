import { homeShowreel, type Showreel } from './showreel-content';
import { ShowreelExperience } from './ShowreelExperience';
import styles from './HomeShowreel.module.css';

export function HomeShowreel({
  showreel = homeShowreel,
}: {
  showreel?: Showreel;
}) {
  if (!showreel.sources.length) return null;

  return (
    <section
      aria-label={showreel.label}
      className={styles.section}
      id="showreel"
    >
      <ShowreelExperience showreel={showreel} />
    </section>
  );
}
