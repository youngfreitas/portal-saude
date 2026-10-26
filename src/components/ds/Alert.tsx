import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Alert({ tone = 'info', title, icon, className, children, ...rest }: AlertProps) {
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cx('su-alert', tone !== 'info' && `su-alert--${tone}`, className)} {...rest}>
      {icon}
      <div className="su-alert__body">
        {title && <div className="su-alert__title">{title}</div>}
        {children && <div className="su-alert__text">{children}</div>}
      </div>
    </div>
  );
}
