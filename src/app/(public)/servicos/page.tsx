import type { Metadata } from 'next';
import { and, asc, eq, ilike } from 'drizzle-orm';
import { db } from '@/db';
import { services } from '@/db/schema';
import { Button, EmptyState, Field, Icon, Input, PageHead, ServiceLink } from '@/components/ds';

export const metadata: Metadata = { title: 'Serviços de Saúde', description: 'Serviços e tratamentos oferecidos pela rede municipal de saúde de Ubatuba.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const list = await db.select().from(services).where(and(eq(services.active, true), q ? ilike(services.name, `%${q}%`) : undefined)).orderBy(asc(services.sortOrder), asc(services.name));
  return (
    <>
      <PageHead title="Serviços de Saúde" trail={[{ label: 'Início', href: '/' }, { label: 'Serviços' }]} lead="Veja o que a rede municipal oferece e como ter acesso." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="su-row" style={{ marginBottom: 'var(--space-6)' }}>
          <Button href="/servicos/vacinacao"><Icon name="syringe" size="sm" />Vacinação</Button>
          <Button variant="secondary" href="/servicos/tratamentos"><Icon name="heart-pulse" size="sm" />Tratamentos</Button>
        </div>
        <form role="search" className="su-filters" style={{ gridTemplateColumns: '1fr auto' }}>
          <Field label="Buscar serviço" htmlFor="s-q"><Input id="s-q" name="q" defaultValue={q} icon={<Icon name="search" size="sm" />} /></Field>
          <Button type="submit">Buscar</Button>
        </form>
        <div style={{ marginTop: 'var(--space-6)' }}>
          {list.length ? <div className="su-grid su-grid-3">{list.map((s) => <ServiceLink key={s.id} href={`/servicos/${s.slug}`} icon={<Icon name={s.icon || 'stethoscope'} size="lg" />} title={s.name} description={s.summary ?? undefined} />)}</div>
            : <EmptyState icon={<Icon name="search-x" size="xl" />} title="Nenhum serviço encontrado" description="Tente outra palavra." />}
        </div>
      </div>
    </>
  );
}
