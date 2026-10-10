import { ButtonLink } from '@/src/components/ui/Button';

import { ContactGreeting } from './ContactGreeting';
import styles from './HomeContact.module.css';

export function HomeContact() {
  return (
    <section
      aria-labelledby="home-contact-title"
      className={styles.section}
      id="contact"
    >
      <div className="layout-container">
        <p className={`${styles.eyebrow} type-eyebrow`}>Let’s connect</p>
        <h2
          aria-label="Don’t be shy. Say hello."
          className={`${styles.heading} type-display-mega`}
          id="home-contact-title"
        >
          <span aria-hidden="true" className={styles.headlineLine}>
            Don’t be shy.
          </span>
          <span className={styles.greetingLine}>
            <span aria-hidden="true">Say</span>
            <ContactGreeting />
          </span>
        </h2>
        <p className={`${styles.description} type-body-large`}>
          From Kerala, for brands ready to move forward. One team bringing
          strategy, design, and technology together, wherever you are.
        </p>
        <div className={styles.actions}>
          <ButtonLink
            className={styles.consultationButton}
            href="/start-a-project"
          >
            Book Consultation
          </ButtonLink>
          <ButtonLink
            className={styles.servicesButton}
            href="/#services"
            variant="secondary"
          >
            View services
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
