import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { Badge, Button, Card, DescriptionList, Icon, PageHead, ValueOrPending } from '@/components/ds';
import { formatPeriod } from '@/lib/format';
import { safeHttpUrl } from '@/lib/sanitize';

async function load(slug: string) {
  const [c] = await db.select().from(campaigns).where(and(eq(campaigns.slug, slug), eq(campaigns.published, true))).limit(1);
  return c;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = await load((await params).slug);
  return c ? { title: c.title, description: c.summary ?? undefined, alternates: { canonical: `/campanhas/${c.slug}` } } : { title: 'Campanha não encontrada' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = await load((await params).slug);
  if (!c) notFound();
  const tone = c.status === 'ativa' ? 'success' : c.status === 'planejada' ? 'info' : 'neutral';
  const label = c.status === 'ativa' ? 'Em andamento' : c.status === 'planejada' ? 'Programada' : 'Encerrada';
  return (
    <>
      <PageHead title={c.title} trail={[{ label: 'Início', href: '/' }, { label: 'Campanhas', href: '/campanhas' }, { label: c.title }]} lead={c.summary ?? undefined} />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <Card>
          <DescriptionList items={[
            { term: 'Situação', detail: <Badge tone={tone} dot>{label}</Badge> },
            { term: 'Período', detail: <ValueOrPending value={formatPeriod(c.startsOn, c.endsOn)} /> },
            { term: 'Objetivos', detail: <ValueOrPending value={c.objectives} /> },
            { term: 'Público-alvo', detail: <ValueOrPending value={c.audience} /> },
            { term: 'Orientações', detail: <ValueOrPending value={c.guidance} /> },
            { term: 'Locais de atendimento', detail: <ValueOrPending value={c.places} /> },
          ]} />
        </Card>
        <aside className="su-stack">
          <Card accent="accent">
            <h2 style={{ font: 'var(--text-h4)', marginBottom: 'var(--space-3)' }}>Materiais de divulgação</h2>
            {c.materials.length ? <ul style={{ margin: 0 }}>{c.materials.map((m) => { const u = safeHttpUrl(m.url) ?? (m.url.startsWith('/media/') ? m.url : null); return u ? <li key={m.url}><a href={u} target="_blank" rel="noopener noreferrer">{m.label}</a></li> : null; })}</ul> : <p className="su-muted" style={{ margin: 0 }}>Nenhum material publicado ainda.</p>}
          </Card>
          {c.isVaccination && <Button href="/servicos/vacinacao"><Icon name="syringe" size="sm" />Calendário de vacinação</Button>}
        </aside>
      </div>
    </>
  );
}
