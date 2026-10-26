import type { Metadata } from 'next';
import { asc, eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, vaccines } from '@/db/schema';
import { Alert, Badge, Button, Card, Icon, PageHead, Table, PendingInfo } from '@/components/ds';
import { CampaignCard } from '@/components/site/Cards';

export const metadata: Metadata = { title: 'Vacinação', description: 'Calendário de vacinação e campanhas de imunização em Ubatuba.' };

export default async function Page() {
  const [list, camps] = await Promise.all([
    db.select().from(vaccines).where(eq(vaccines.active, true)).orderBy(asc(vaccines.sortOrder), asc(vaccines.name)),
    db.select().from(campaigns).where(and(eq(campaigns.published, true), eq(campaigns.isVaccination, true))).orderBy(asc(campaigns.startsOn)),
  ]);
  const source = list.find((v) => v.source)?.source;
  return (
    <>
      <PageHead title="Vacinação" trail={[{ label: 'Início', href: '/' }, { label: 'Serviços', href: '/servicos' }, { label: 'Vacinação' }]} lead="Vacinar é proteger você e a sua família. As vacinas do SUS são gratuitas." />
      <div className="su-container su-stack" style={{ paddingTop: 'var(--space-8)' }}>
        <Alert tone="info" icon={<Icon name="syringe" />} title="Leve o cartão de vacinação">Procure uma unidade de saúde com documento com foto e a caderneta de vacinação. <a href="/unidades">Ver unidades</a>.</Alert>
        <section>
          <h2 style={{ marginBottom: 'var(--space-4)' }}>Calendário de vacinação</h2>
          {list.length ? (
            <Table rowKey={(v) => v.id} caption="Calendário de vacinação"
              columns={[
                { header: 'Vacina', cell: (v) => <strong>{v.name}</strong> },
                { header: 'Quando tomar', cell: (v) => v.ageGroup },
                { header: 'Observações', cell: (v) => v.notes || '—' },
              ]} rows={list} />
          ) : <PendingInfo />}
          <p className="su-muted" style={{ fontSize: 'var(--fs-caption)', marginTop: 'var(--space-3)' }}>
            Fonte: {source || 'Ministério da Saúde — Programa Nacional de Imunizações'}. O calendário pode ser atualizado pelo Ministério; em caso de dúvida, confirme na unidade de saúde.
          </p>
        </section>
        {camps.length > 0 && (
          <section>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Campanhas de vacinação</h2>
            <div className="su-grid su-grid-3">{camps.map((c) => <CampaignCard key={c.id} c={c} />)}</div>
          </section>
        )}
        <div><Button href="/unidades"><Icon name="map-pin" size="sm" />Encontrar sala de vacina</Button> <Badge tone="info">Gratuito pelo SUS</Badge></div>
      </div>
    </>
  );
}
