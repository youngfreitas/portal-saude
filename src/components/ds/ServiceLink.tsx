import Link from 'next/link';
import type { ReactNode } from 'react';

export interface ServiceLinkProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  href: string;
}

export function ServiceLink({ icon, title, description, href }: ServiceLinkProps) {
  return (
    <Link href={href} className="su-servicelink">
      <span className="su-servicelink__icon">{icon}</span>
      <span className="su-servicelink__body">
        <span className="su-servicelink__title">{title}</span>
        {description && <span className="su-servicelink__desc">{description}</span>}
      </span>
      <span className="su-servicelink__arrow" aria-hidden>›</span>
    </Link>
  );
}
