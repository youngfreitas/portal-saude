import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface CardProps extends HTMLAttributes<HTMLElement> {
  elevation?: 'xs' | 'sm' | 'md' | 'lg';
  accent?: 'brand' | 'accent' | 'success';
  interactive?: boolean;
  flush?: boolean;
  as?: 'div' | 'article' | 'section' | 'li';
  children?: ReactNode;
}

export function Card({ elevation = 'sm', accent, interactive, flush, as: Tag = 'div', className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cx('su-card', elevation !== 'sm' && `su-card--${elevation}`, accent && `su-card--${accent}`, interactive && 'su-card--interactive', flush && 'su-card--flush', className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
