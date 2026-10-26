'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brandmark, Button, Drawer, Icon, Input } from '@/components/ds';
import { NAV } from '@/lib/nav';
import { A11yTools } from './A11yTools';

function isActive(pathname: string, href: string, hasChildren: boolean) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/') || (hasChildren && false);
}

export function Header({ prefeituraUrl, ombudsmanUrl }: { prefeituraUrl: string; ombudsmanUrl: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get('q') ?? '').trim();
    setOpen(false);
    router.push(q ? `/busca?q=${encodeURIComponent(q)}` : '/busca');
  };
  return (
    <header>
      <div className="su-topbar">
        <div className="su-container su-topbar__in">
          <a href={prefeituraUrl || 'https://www.ubatuba.sp.gov.br'} target="_blank" rel="noopener noreferrer"><span className="su-topbar__label">Portal da Prefeitura Municipal de Ubatuba</span><span className="su-sr-only">(abre em nova aba)</span></a>
          <div className="su-topbar__tools">
            <A11yTools />
            <Link href={ombudsmanUrl && /^https?:/.test(ombudsmanUrl) ? ombudsmanUrl : '/contatos#ouvidoria'}>Ouvidoria</Link>
          </div>
        </div>
      </div>
      <div className="su-band">
        <div className="su-container su-band__in">
          <Brandmark tone="light" size={52} href="/" />
          <div className="su-band__actions">
            <form role="search" onSubmit={search} className="su-search su-search--desktop">
              <label htmlFor="busca-topo" className="su-sr-only">Buscar no portal</label>
              <Input id="busca-topo" name="q" type="search" placeholder="Buscar no portal" icon={<Icon name="search" size="sm" />} />
            </form>
            <Button variant="inverse" size="sm" href="/contatos"><Icon name="message-square" size="sm" /><span className="su-hide-sm">Fale conosco</span></Button>
          </div>
        </div>
      </div>
      <nav className="su-nav" aria-label="Menu principal">
        <div className="su-container">
          <ul className="su-nav__list">
            {NAV.map((item) => (
              <li key={item.href} className="su-nav__item">
                <Link href={item.href} className="su-nav__link" aria-current={isActive(pathname, item.href, !!item.children) ? 'page' : undefined}>
                  {item.label}{item.children && <Icon name="chevron-down" size="sm" />}
                </Link>
                {item.children && (
                  <ul className="su-nav__sub">
                    {item.children.map((c) => <li key={c.href}><Link href={c.href}>{c.label}</Link></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          <div className="su-nav__toggle">
            <Button variant="tertiary" onClick={() => setOpen(true)} aria-expanded={open} aria-haspopup="dialog"><Icon name="menu" />Menu</Button>
          </div>
        </div>
      </nav>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu">
        <form role="search" onSubmit={search} style={{ padding: 'var(--space-4)' }}>
          <label htmlFor="busca-mobile" className="su-sr-only">Buscar no portal</label>
          <Input id="busca-mobile" name="q" type="search" placeholder="Buscar no portal" icon={<Icon name="search" size="sm" />} />
        </form>
        <div className="su-mobile-nav">
          <ul>
            {NAV.map((item) => item.children ? (
              <li key={item.href}>
                <details>
                  <summary>{item.label}</summary>
                  <ul>{item.children.map((c) => <li key={c.href}><Link href={c.href} onClick={() => setOpen(false)}>{c.label}</Link></li>)}</ul>
                </details>
              </li>
            ) : (
              <li key={item.href}><Link href={item.href} onClick={() => setOpen(false)}>{item.label}</Link></li>
            ))}
          </ul>
        </div>
      </Drawer>
    </header>
  );
}
