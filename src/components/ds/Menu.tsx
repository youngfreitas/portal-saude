import Link from 'next/link';
import type { ReactNode } from 'react';
export function Menu({ items, label }: { items: { href: string; label: string; icon?: ReactNode; active?: boolean }[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ul className="su-menu">
        {items.map((i) => (
          <li key={i.href}><Link href={i.href} aria-current={i.active ? 'page' : undefined}>{i.icon}{i.label}</Link></li>
        ))}
      </ul>
    </nav>
  );
}
