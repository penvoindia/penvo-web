'use client';

import { useEffect, useRef } from 'react';

import { createContactGreetingMotion } from './contact-greeting-motion';
import styles from './HomeContact.module.css';

export function ContactGreeting() {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    return createContactGreetingMotion(button);
  }, []);

  return (
    <button
      aria-label="Pause greeting rotation"
      aria-pressed="false"
      className={styles.greetingButton}
      disabled
      ref={buttonRef}
      title="Pause greeting rotation"
      type="button"
    >
      <span
        aria-hidden="true"
        className={styles.greetingWord}
        data-contact-greeting-word
        data-swapping="false"
        dir="auto"
        lang="en"
      >
        Hi.
      </span>
    </button>
  );
}
