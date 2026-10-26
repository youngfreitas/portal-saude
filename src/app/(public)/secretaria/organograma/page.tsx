import type { Metadata } from 'next';
import { Alert, Icon, PageHead } from '@/components/ds';
import { OrgChart, type OrgNode } from '@/components/site/OrgChart';
import { orgTree } from '@/lib/queries';

export const metadata: Metadata = { title: 'Organograma', description: 'Estrutura organizacional da Secretaria Municipal de Saúde de Ubatuba.' };

export default async function Page() {
  const { roots } = await orgTree();
  const plain = (n: (typeof roots)[number]): OrgNode => ({ id: n.id, name: n.name, kind: n.kind, description: n.description, people: n.people.map((p) => ({ name: p.name, role: p.role })), children: n.children.map(plain) });
  return (
    <>
      <PageHead title="Organograma" trail={[{ label: 'Início', href: '/' }, { label: 'Secretaria', href: '/secretaria' }, { label: 'Organograma' }]} lead="Clique em um setor para ver o que há dentro dele. Use “Ver tudo” para abrir toda a estrutura." />
      <div className="su-container su-stack" style={{ paddingTop: 'var(--space-8)' }}>
        <Alert tone="warning" icon={<Icon name="info" />} title="Estrutura em validação">Os nomes dos setores seguem a estrutura geral de uma secretaria de saúde e estão sujeitos à confirmação oficial.</Alert>
        {roots.length ? <OrgChart roots={roots.map(plain)} /> : <p>O organograma ainda não foi cadastrado.</p>}
      </div>
    </>
  );
}
