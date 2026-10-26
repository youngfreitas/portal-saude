import Link from 'next/link';
import { Fragment } from 'react';

export interface BreadcrumbItem { label: string; href?: string }

export function Breadcrumb({ items = [] }: { items?: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="su-breadcrumb">
      {items.map((it, i) => {
        const last = i === items.length - 1;
        return (
          <Fragment key={it.label + i}>
            {last || !it.href ? <span aria-current={last ? 'page' : undefined}>{it.label}</span> : <Link href={it.href}>{it.label}</Link>}
            {!last && <span className="su-breadcrumb__sep" aria-hidden>/</span>}
          </Fragment>
        );
      })}
    </nav>
  );
}
