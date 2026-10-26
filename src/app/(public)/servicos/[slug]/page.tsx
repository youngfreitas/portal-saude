import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { services, unitServices, units } from '@/db/schema';
import { Button, Card, DescriptionList, Icon, PageHead, ValueOrPending } from '@/components/ds';
import { safeHttpUrl } from '@/lib/sanitize';

async function load(slug: string) {
  const [s] = await db.select().from(services).where(and(eq(services.slug, slug), eq(services.active, true))).limit(1);
  return s;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = await load((await params).slug);
  return s ? { title: s.name, description: s.summary ?? undefined, alternates: { canonical: `/servicos/${s.slug}` } } : { title: 'Serviço não encontrado' };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const s = await load((await params).slug);
  if (!s) notFound();
  const where = await db.select({ name: units.name, slug: units.slug }).from(unitServices).innerJoin(units, eq(units.id, unitServices.unitId)).where(and(eq(unitServices.serviceId, s.id), eq(units.active, true)));
  const ext = safeHttpUrl(s.externalUrl);
  const group = s.kind === 'tratamento' ? { label: 'Tratamentos', href: '/servicos/tratamentos' } : { label: 'Serviços', href: '/servicos' };
  return (
    <>
      <PageHead title={s.name} trail={[{ label: 'Início', href: '/' }, group, { label: s.name }]} lead={s.summary ?? undefined}
        actions={ext ? <Button external href={ext}><Icon name="external-link" size="sm" />Acessar serviço online</Button> : undefined} />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <Card>
          <DescriptionList items={[
            { term: 'O que é', detail: <ValueOrPending value={s.description} /> },
            { term: 'Quem pode usar', detail: <ValueOrPending value={s.audience} /> },
            { term: 'Documentos necessários', detail: <ValueOrPending value={s.documents} /> },
            { term: 'Como ter acesso', detail: <ValueOrPending value={s.howTo} /> },
            { term: 'Horário', detail: <ValueOrPending value={s.hours} /> },
          ]} />
        </Card>
        <aside>
          <Card accent="accent">
            <h2 style={{ font: 'var(--text-h4)', marginBottom: 'var(--space-3)' }}>Onde encontrar</h2>
            {where.length ? <ul style={{ margin: 0 }}>{where.map((u) => <li key={u.slug}><Link href={`/unidades/${u.slug}`}>{u.name}</Link></li>)}</ul> : <p className="su-muted" style={{ margin: 0 }}>As unidades que oferecem este serviço serão indicadas após confirmação oficial.</p>}
          </Card>
        </aside>
      </div>
    </>
  );
}
