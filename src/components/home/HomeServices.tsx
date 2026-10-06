import { ButtonLink } from '@/src/components/ui/Button';
import Link from 'next/link';

import { ServicesExperience } from './ServicesExperience';
import styles from './HomeServices.module.css';

const services = [
  [
    'Brand Strategy',
    'Brand strategy is the long-term plan for how a brand should be understood, remembered, and preferred by its target audience.',
    '/services/brand-strategy',
  ],
  [
    'Brand Identity',
    'Brand identity is the visible and verbal expression of a brand, how the brand looks, sounds, and feels to people.',
    '/services/brand-identity',
  ],
  [
    'Web Design',
    'Web design is the process of planning and creating how a website looks, feels, and works for the user.',
    '/services/web-design',
  ],
  [
    'Web Development',
    'Web development is the process of turning a web design into a real, working website.',
    '/services/web-development',
  ],
  [
    'Digital Growth',
    'Digital growth is the process of using digital channels, technology, data, and marketing to help a business attract more people.',
    '/services/digital-growth',
  ],
] as const;

export function HomeServices() {
  return (
    <section
      className={styles.section}
      id="services"
      aria-labelledby="services-title"
    >
      <div className={`${styles.heading} layout-container`}>
        <div className={styles.headingCopy}>
          <p className={`${styles.eyebrow} type-eyebrow`}>Services</p>
          <h2 id="services-title" className="type-display-giant">
            Built for brands.
            <br />
            Designed for growth.
          </h2>
        </div>
        <ButtonLink
          className={styles.allServices}
          href="#services-list"
          variant="secondary"
        >
          All services
        </ButtonLink>
      </div>
      <ServicesExperience>
        <ul className={styles.list} id="services-list">
          {services.map(([title, description, href], index) => (
            <li className={styles.row} key={title}>
              <Link
                className={styles.summary}
                data-service-index={String(index + 1).padStart(2, '0')}
                data-service-preview-trigger
                data-service-title={title}
                href={href}
              >
                <span className={styles.serviceLead}>
                  <span className={`${styles.number} type-body`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={`${styles.title} type-heading-1`}>{title}</h3>
                </span>
                <span className={`${styles.short} type-body-large`}>
                  {description}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ServicesExperience>
    </section>
  );
}
