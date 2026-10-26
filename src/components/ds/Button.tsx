import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'danger' | 'inverse' | 'outline-inverse';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  /** Renderiza como link quando informado. */
  href?: string;
  external?: boolean;
  children?: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', fullWidth, href, external, className, children, disabled, type, ...rest }: ButtonProps) {
  const cls = cx('su-btn', `su-btn--${variant}`, size !== 'md' && `su-btn--${size}`, fullWidth && 'su-btn--full', className);
  if (href && !disabled) {
    if (external || /^(https?:|mailto:|tel:)/.test(href)) {
      return <a href={href} className={cls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{children}</a>;
    }
    return <Link href={href} className={cls}>{children}</Link>;
  }
  return <button type={type ?? 'button'} className={cls} disabled={disabled} {...rest}>{children}</button>;
}
