import Link from 'next/link';

export interface TabLink { href: string; label: string; active?: boolean }

/** Abas de navegação entre seções (links) com sublinhado azul no item ativo. */
export function Tabs({ items, label = 'Seções' }: { items: TabLink[]; label?: string }) {
  return (
    <nav aria-label={label} className="su-tabs">
      {items.map((it) => (
        <Link key={it.href} href={it.href} className="su-tab" aria-current={it.active ? 'page' : undefined}>{it.label}</Link>
      ))}
    </nav>
  );
}
