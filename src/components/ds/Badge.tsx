import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'brand';
  dot?: boolean;
  children?: ReactNode;
}

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx('su-badge', tone !== 'neutral' && `su-badge--${tone}`, className)} {...rest}>
      {dot && <span className="su-badge__dot" aria-hidden />}
      {children}
    </span>
  );
}
