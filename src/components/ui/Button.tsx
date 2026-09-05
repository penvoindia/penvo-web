import Link from 'next/link';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: ButtonVariant;
};

function getButtonClasses(
  variant: ButtonVariant,
  className: string | undefined,
) {
  const variantClass =
    variant === 'primary' ? styles.primary : styles.secondary;

  return [styles.button, variantClass, 'type-button', className]
    .filter(Boolean)
    .join(' ');
}

function ButtonContents({ children }: { children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className={styles.outline} />
      <span aria-hidden="true" className={styles.surface} />
      <span className={styles.label}>{children}</span>
    </>
  );
}

export function Button({
  children,
  className,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClasses(variant, className)}
      type={type}
      {...props}
    >
      <ButtonContents>{children}</ButtonContents>
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={getButtonClasses(variant, className)} {...props}>
      <ButtonContents>{children}</ButtonContents>
    </Link>
  );
}
