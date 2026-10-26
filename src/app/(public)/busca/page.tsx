import type { Metadata } from 'next';
import Link from 'next/link';
import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, services, units } from '@/db/schema';
import { Button, Card, EmptyState, Field, Icon, Input, PageHead } from '@/components/ds';
import { PostCard } from '@/components/site/Cards';
import { listLivePosts } from '@/lib/queries';

export const metadata: Metadata = { title: 'Busca', robots: { index: false } };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = (await searchParams).q?.trim() ?? '';
  const like = `%${q}%`;
  const [news, us, ss, cs] = q ? await Promise.all([
    listLivePosts({ q, pageSize: 5 }),
    db.select().from(units).where(and(eq(units.active, true), or(ilike(units.name, like), ilike(units.neighborhood, like), ilike(units.address, like)))).limit(8),
    db.select().from(services).where(and(eq(services.active, true), or(ilike(services.name, like), ilike(services.summary, like)))).limit(8),
    db.select().from(campaigns).where(and(eq(campaigns.published, true), or(ilike(campaigns.title, like), ilike(campaigns.summary, like)))).limit(8),
  ]) : [{ rows: [], total: 0 }, [], [], []];
  const total = news.rows.length + us.length + ss.length + cs.length;
  return (
    <>
      <PageHead title="Busca no portal" trail={[{ label: 'Início', href: '/' }, { label: 'Busca' }]} />
      <div className="su-container su-stack" style={{ paddingTop: 'var(--space-8)' }}>
        <form role="search" className="su-filters" style={{ gridTemplateColumns: '1fr auto' }}>
          <Field label="O que você procura?" htmlFor="b-q"><Input id="b-q" name="q" defaultValue={q} icon={<Icon name="search" size="sm" />} /></Field>
          <Button type="submit">Buscar</Button>
        </form>
        {q && total === 0 && <EmptyState icon={<Icon name="search-x" size="xl" />} title={`Nada encontrado para “${q}”`} description="Confira a grafia ou tente uma palavra mais geral." />}
        {us.length > 0 && <section><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Unidades</h2><ul>{us.map((u) => <li key={u.id}><Link href={`/unidades/${u.slug}`}>{u.name}</Link></li>)}</ul></section>}
        {ss.length > 0 && <section><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Serviços</h2><ul>{ss.map((s) => <li key={s.id}><Link href={`/servicos/${s.slug}`}>{s.name}</Link></li>)}</ul></section>}
        {cs.length > 0 && <section><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Campanhas</h2><ul>{cs.map((c) => <li key={c.id}><Link href={`/campanhas/${c.slug}`}>{c.title}</Link></li>)}</ul></section>}
        {news.rows.length > 0 && <section><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Notícias</h2><div className="su-grid su-grid-2">{news.rows.map((p) => <PostCard key={p.id} post={p} />)}</div></section>}
      </div>
    </>
  );
}
