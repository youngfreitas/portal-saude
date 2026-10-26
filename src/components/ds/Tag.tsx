import Link from 'next/link';
import type { ReactNode } from 'react';
import { cx } from './cx';

export interface TagProps {
  selected?: boolean;
  href?: string;
  children?: ReactNode;
  className?: string;
}

export function Tag({ selected, href, className, children }: TagProps) {
  const cls = cx('su-tag', selected && 'su-tag--selected', className);
  if (href) return <Link href={href} className={cls} aria-current={selected ? 'true' : undefined}>{children}</Link>;
  return <span className={cls}>{children}</span>;
}
