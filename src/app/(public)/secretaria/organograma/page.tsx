import type { Metadata } from 'next';
import { Alert, Icon, PageHead } from '@/components/ds';
import { OrgChart, type OrgNode } from '@/components/site/OrgChart';
import { orgTree } from '@/lib/queries';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = { title: 'Organograma', description: 'Estrutura organizacional da Secretaria Municipal de Saúde de Ubatuba.' };

export default async function Page() {
  const [{ roots }, st] = await Promise.all([orgTree(), getSettings()]);
  const plain = (n: (typeof roots)[number]): OrgNode => ({ id: n.id, name: n.name, kind: n.kind, description: n.description, people: n.people.map((p) => ({ name: p.name, role: p.role })), children: n.children.map(plain) });
  return (
    <>
      <PageHead title="Organograma" trail={[{ label: 'Início', href: '/' }, { label: 'Secretaria', href: '/secretaria' }, { label: 'Organograma' }]} lead="Veja como a Secretaria está organizada: da secretaria aos departamentos e setores, com os responsáveis por cada área." />
      <div className="su-container su-stack" style={{ paddingTop: 'var(--space-8)' }}>
        {st.demo_mode !== '1' && <Alert tone="warning" icon={<Icon name="info" />} title="Estrutura em validação">Os nomes dos setores seguem a estrutura geral de uma secretaria de saúde e estão sujeitos à confirmação oficial.</Alert>}
        {roots.length ? <OrgChart roots={roots.map(plain)} /> : <p>O organograma ainda não foi cadastrado.</p>}
      </div>
    </>
  );
}
