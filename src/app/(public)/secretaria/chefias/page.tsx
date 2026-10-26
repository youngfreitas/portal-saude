import type { Metadata } from 'next';
import { Avatar, Button, Card, Field, Icon, Input, PageHead, PendingInfo, Select } from '@/components/ds';
import { orgTree } from '@/lib/queries';
import { telHref } from '@/lib/format';
import { imageSrc } from '@/lib/media';

export const metadata: Metadata = { title: 'Chefias e responsáveis', description: 'Responsáveis por cada setor da Secretaria Municipal de Saúde de Ubatuba.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { all, people } = await orgTree();
  const q = sp.q?.trim().toLowerCase();
  const sector = Number(sp.setor) || null;
  const sectors = all.filter((o) => o.kind !== 'secretaria');
  const shown = sectors.filter((o) => (!sector || o.id === sector) && (!q || o.name.toLowerCase().includes(q) || people.some((p) => p.orgUnitId === o.id && (p.name + p.role).toLowerCase().includes(q))));
  return (
    <>
      <PageHead title="Chefias e responsáveis" trail={[{ label: 'Início', href: '/' }, { label: 'Secretaria', href: '/secretaria' }, { label: 'Chefias' }]} lead="Responsáveis por cada setor, com atribuições e contato institucional." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <form className="su-filters" role="search" style={{ gridTemplateColumns: '2fr 1fr auto' }}>
          <Field label="Buscar por nome, cargo ou setor" htmlFor="c-q"><Input id="c-q" name="q" defaultValue={sp.q} icon={<Icon name="search" size="sm" />} /></Field>
          <Field label="Setor" htmlFor="c-s"><Select id="c-s" name="setor" defaultValue={sp.setor ?? ''} placeholder="Todos" options={sectors.map((o) => ({ value: o.id, label: o.name }))} /></Field>
          <Button type="submit">Filtrar</Button>
        </form>
        <div className="su-grid su-grid-2" style={{ marginTop: 'var(--space-6)' }}>
          {shown.map((o) => {
            const ppl = people.filter((p) => p.orgUnitId === o.id);
            return (
              <Card key={o.id} as="article">
                <h2 style={{ font: 'var(--text-h4)', marginBottom: 'var(--space-3)' }}>{o.name}</h2>
                {o.description && <p className="su-muted">{o.description}</p>}
                {ppl.length ? ppl.map((p) => (
                  <div key={p.id} className="su-row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', marginTop: 'var(--space-3)' }}>
                    <Avatar name={p.name} src={imageSrc(p.photoId, 480)} />
                    <div>
                      <strong>{p.name}</strong><br /><span className="su-muted">{p.role}</span>
                      {p.duties && <p style={{ fontSize: 'var(--fs-body-sm)', margin: '4px 0 0' }}>{p.duties}</p>}
                      <div style={{ fontSize: 'var(--fs-caption)', marginTop: 4 }}>
                        {p.email && <a href={`mailto:${p.email}`}>{p.email}</a>}{p.email && p.phone && ' · '}{p.phone && <a href={telHref(p.phone)}>{p.phone}</a>}
                      </div>
                    </div>
                  </div>
                )) : <div><span className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>Responsável: </span><PendingInfo /></div>}
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
