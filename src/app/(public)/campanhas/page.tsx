import type { Metadata } from 'next';
import { Icon, PageHead, EmptyState, Tabs } from '@/components/ds';
import { CampaignCard } from '@/components/site/Cards';
import { listCampaigns } from '@/lib/queries';

export const metadata: Metadata = { title: 'Campanhas de Saúde', description: 'Campanhas de saúde e vacinação da Secretaria Municipal de Saúde de Ubatuba.' };
const TABS = [{ v: 'ativa', l: 'Em andamento' }, { v: 'planejada', l: 'Programadas' }, { v: 'encerrada', l: 'Encerradas' }];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { status } = await searchParams;
  const current = TABS.some((t) => t.v === status) ? status! : 'ativa';
  const list = await listCampaigns(current);
  return (
    <>
      <PageHead title="Campanhas" trail={[{ label: 'Início', href: '/' }, { label: 'Campanhas' }]} lead="Mobilizações e campanhas de saúde da Secretaria." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <Tabs label="Situação da campanha" items={TABS.map((t) => ({ href: `/campanhas?status=${t.v}`, label: t.l, active: t.v === current }))} />
        <div style={{ marginTop: 'var(--space-6)' }}>
          {list.length ? <div className="su-grid su-grid-3">{list.map((c) => <CampaignCard key={c.id} c={c} />)}</div>
            : <EmptyState icon={<Icon name="megaphone" size="xl" />} title="Nenhuma campanha nesta situação" description="Veja as outras abas ou volte mais tarde." />}
        </div>
      </div>
    </>
  );
}
