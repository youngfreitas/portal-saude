'use client';
import { useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Brandmark, Button, Drawer, Icon, Menu } from '@/components/ds';
import { logoutAction } from '@/app/admin/actions';

export type AdminNavItem = { href: string; label: string; icon: string; group: string };

function NavMenu({ items, pathname }: { items: AdminNavItem[]; pathname: string }) {
  const groups = [...new Set(items.map((i) => i.group))];
  return (
    <>
      {groups.map((g) => (
        <div key={g}>
          <div className="su-admin__group">{g}</div>
          <Menu label={g} items={items.filter((i) => i.group === g).map((i) => ({ href: i.href, label: i.label, icon: <Icon name={i.icon} size="sm" />, active: i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href) }))} />
        </div>
      ))}
    </>
  );
}

export function AdminShell({ user, roleLabel, items, children }: { user: { name: string }; roleLabel: string; items: AdminNavItem[]; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <>
      <div className="su-admin__bar">
        <div className="su-row">
          <Button className="su-admin__mobile" variant="inverse" size="sm" aria-label="Abrir menu do painel" onClick={() => setOpen(true)}><Icon name="menu" size="sm" /></Button>
          <Brandmark variant="mark" tone="light" size={36} />
          <strong style={{ fontFamily: 'var(--font-display)' }}>Painel — Saúde Ubatuba</strong>
        </div>
        <div className="su-row" style={{ fontSize: 'var(--fs-caption)' }}>
          <a href="/" target="_blank" rel="noopener noreferrer">Ver portal</a>
          <span>{user.name} · {roleLabel}</span>
          <form action={logoutAction}><Button type="submit" size="sm" variant="outline-inverse">Sair</Button></form>
        </div>
      </div>
      <div className="su-admin" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <aside className="su-admin__side" style={{ height: 'calc(100vh - 56px)', top: 56 }}><NavMenu items={items} pathname={pathname} /></aside>
        <main className="su-admin__main" id="conteudo">{children}</main>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu do painel"><div onClick={() => setOpen(false)} style={{ padding: 'var(--space-2)' }}><NavMenu items={items} pathname={pathname} /></div></Drawer>
    </>
  );
}
