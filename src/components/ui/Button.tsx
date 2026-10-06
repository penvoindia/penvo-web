import Link from 'next/link';
import type {
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
  Ref,
} from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'default' | 'compact';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref?: Ref<HTMLButtonElement>;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

export type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  size?: ButtonSize;
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
  ref,
  size = 'default',
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClasses(variant, className)}
      data-size={size}
      ref={ref}
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
  size = 'default',
  variant = 'primary',
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={getButtonClasses(variant, className)}
      data-size={size}
      {...props}
    >
      <ButtonContents>{children}</ButtonContents>
    </Link>
  );
}
