import Image from 'next/image';

import { TestimonialsCarousel } from './TestimonialsCarousel';
import { homeTestimonials } from './testimonials-content';
import styles from './HomeTestimonials.module.css';

export function HomeTestimonials() {
  return (
    <section
      aria-labelledby="home-testimonials-title"
      className={styles.section}
      id="testimonials"
    >
      <TestimonialsCarousel
        heading={
          <div className={styles.headingCopy}>
            <p className={`${styles.eyebrow} type-eyebrow`}>Testimonials</p>
            <h2
              className={`${styles.heading} type-heading-1`}
              id="home-testimonials-title"
            >
              <span>Don’t take our word for it!</span>
              <span>Hear it from our partners.</span>
            </h2>
          </div>
        }
      >
        {homeTestimonials.map((testimonial) => (
          <li
            className={`${styles.card} ${
              testimonial.kind === 'video' ? styles.videoCard : ''
            }`}
            data-testimonial-card
            key={testimonial.id}
          >
            {testimonial.kind === 'video' && (
              <>
                {testimonial.video ? (
                  <video
                    aria-label="Client video testimonial"
                    className={styles.video}
                    controls
                    playsInline
                    poster={testimonial.poster}
                    preload="none"
                    src={testimonial.video}
                  />
                ) : (
                  <>
                    <Image
                      alt=""
                      className={styles.poster}
                      fill
                      sizes="(min-width: 1280px) 460px, (min-width: 768px) 440px, 84vw"
                      src={testimonial.poster}
                    />
                    <div aria-hidden="true" className={styles.veil} />
                    <div className={styles.videoPreview}>
                      <span aria-hidden="true" className={styles.playMark}>
                        <svg fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 5v14l11-7Z" />
                        </svg>
                      </span>
                    </div>
                  </>
                )}
              </>
            )}

            <figure className={styles.cardContent}>
              {testimonial.kind === 'quote' && (
                <>
                  <p className={`${styles.project} type-body`}>
                    {testimonial.service} : {testimonial.project}
                  </p>
                  <blockquote className={styles.quote}>
                    <p className="type-heading-5">“{testimonial.quote}”</p>
                    <p className={`${styles.description} type-body-large`}>
                      {testimonial.description}
                    </p>
                  </blockquote>
                </>
              )}
              <figcaption className={styles.attribution}>
                <Image
                  alt=""
                  className={styles.avatar}
                  height={56}
                  sizes="56px"
                  src={testimonial.avatar}
                  width={56}
                />
                <div className={styles.clientDetails}>
                  <p className="type-heading-6">{testimonial.name}</p>
                  <p className={`${styles.role} type-body-small`}>
                    {testimonial.role}
                    {testimonial.kind === 'quote' &&
                      ` at ${testimonial.company}`}
                  </p>
                </div>
              </figcaption>
            </figure>
          </li>
        ))}
      </TestimonialsCarousel>
    </section>
  );
}
