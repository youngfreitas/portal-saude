import type { Metadata } from 'next';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { services } from '@/db/schema';
import { Alert, Icon, PageHead, ServiceLink } from '@/components/ds';

export const metadata: Metadata = { title: 'Tratamentos disponíveis', description: 'Tratamentos oferecidos gratuitamente pelo SUS na rede municipal de Ubatuba.' };

export default async function Page() {
  const list = await db.select().from(services).where(and(eq(services.active, true), eq(services.kind, 'tratamento'))).orderBy(asc(services.sortOrder), asc(services.name));
  return (
    <>
      <PageHead title="Tratamentos" trail={[{ label: 'Início', href: '/' }, { label: 'Serviços', href: '/servicos' }, { label: 'Tratamentos' }]} lead="Tratamentos oferecidos pelo SUS na rede municipal." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <Alert tone="info" icon={<Icon name="info" />} title="Procure uma unidade de saúde" style={{ marginBottom: 'var(--space-6)' }}>
          O acompanhamento começa na unidade de saúde. Veja <a href="/unidades">onde ser atendido</a>.
        </Alert>
        <div className="su-grid su-grid-2">{list.map((s) => <ServiceLink key={s.id} href={`/servicos/${s.slug}`} icon={<Icon name={s.icon || 'heart-pulse'} size="lg" />} title={s.name} description={s.summary ?? undefined} />)}</div>
      </div>
    </>
  );
}
