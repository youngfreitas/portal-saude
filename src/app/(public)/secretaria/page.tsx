import type { Metadata } from 'next';
import { Button, Card, Icon, PageHead, PendingInfo, ServiceLink } from '@/components/ds';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Sobre a Secretaria', description: 'Missão, competências e estrutura da Secretaria Municipal de Saúde de Ubatuba.' };

export default async function Page() {
  const s = await getSettings();
  const block = (title: string, text: string) => (
    <Card><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>{title}</h2>{text ? <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{text}</p> : <PendingInfo />}</Card>
  );
  return (
    <>
      <PageHead title="Sobre a Secretaria" trail={[{ label: 'Início', href: '/' }, { label: 'Secretaria' }]} lead="A Secretaria Municipal de Saúde planeja e coordena as ações e serviços de saúde do SUS em Ubatuba." />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="su-stack">
          {block('Apresentação', s.about_text)}
          {block('Missão', s.mission)}
          {block('Competências e atribuições', s.attributions)}
        </div>
        <aside className="su-stack">
          <ServiceLink href="/secretaria/organograma" icon={<Icon name="network" size="lg" />} title="Organograma" description="Estrutura e setores" />
          <ServiceLink href="/secretaria/chefias" icon={<Icon name="users" size="lg" />} title="Chefias e responsáveis" description="Quem responde por cada área" />
          <ServiceLink href="/contatos" icon={<Icon name="phone" size="lg" />} title="Contatos" description="Fale com a Secretaria" />
        </aside>
      </div>
    </>
  );
}
