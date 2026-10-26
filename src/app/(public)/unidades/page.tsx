import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { unitCategories } from '@/db/schema';
import { Alert, Button, EmptyState, Field, Icon, Input, PageHead, Select } from '@/components/ds';
import { UnitCard } from '@/components/site/Cards';
import { listActiveUnits, listNeighborhoods, unitServiceMap } from '@/lib/queries';

export const metadata: Metadata = { title: 'Unidades de Saúde', description: 'Encontre unidades de saúde de Ubatuba por categoria, bairro ou nome.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [cats, hoods] = await Promise.all([db.select().from(unitCategories).orderBy(asc(unitCategories.sortOrder)), listNeighborhoods()]);
  const list = await listActiveUnits({ q: sp.q?.trim() || undefined, categoryId: Number(sp.categoria) || undefined, neighborhood: sp.bairro || undefined });
  const svc = await unitServiceMap(list.map((l) => l.unit.id));
  const filtered = !!(sp.q || sp.categoria || sp.bairro);
  return (
    <>
      <PageHead title="Unidades de Saúde" trail={[{ label: 'Início', href: '/' }, { label: 'Unidades de Saúde' }]} lead="Consulte endereço, horário e serviços de cada unidade da rede municipal."
        actions={<Button variant="secondary" href="/unidades/mapa"><Icon name="map" size="sm" />Ver no mapa</Button>} />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <form className="su-filters" role="search" aria-label="Filtrar unidades">
          <Field label="Nome ou endereço" htmlFor="u-q"><Input id="u-q" name="q" defaultValue={sp.q} placeholder="Ex.: nome da unidade" icon={<Icon name="search" size="sm" />} /></Field>
          <Field label="Categoria" htmlFor="u-cat"><Select id="u-cat" name="categoria" defaultValue={sp.categoria ?? ''} placeholder="Todas" options={cats.map((c) => ({ value: c.id, label: c.name }))} /></Field>
          <Field label="Bairro" htmlFor="u-bairro"><Select id="u-bairro" name="bairro" defaultValue={sp.bairro ?? ''} placeholder="Todos" options={hoods} /></Field>
          <Button type="submit">Filtrar</Button>
        </form>
        <p className="su-muted" style={{ margin: 'var(--space-6) 0 var(--space-4)' }} aria-live="polite">{list.length} {list.length === 1 ? 'unidade encontrada' : 'unidades encontradas'}</p>
        {list.length ? (
          <div className="su-grid su-grid-3">{list.map(({ unit, categoryName }) => <UnitCard key={unit.id} unit={unit} category={categoryName} services={svc.get(unit.id)} />)}</div>
        ) : filtered ? (
          <EmptyState icon={<Icon name="map-pin-off" size="xl" />} title="Nenhuma unidade encontrada" description="Tente outro nome ou bairro, ou remova os filtros." action={<Button variant="secondary" href="/unidades">Limpar filtros</Button>} />
        ) : (
          <Alert tone="info" icon={<Icon name="info" />} title="Cadastro de unidades em andamento">
            A lista oficial de unidades de saúde está sendo confirmada pela Secretaria e será publicada aqui. Para atendimento imediato, ligue para o SAMU <strong>192</strong> ou veja os <a href="/contatos">contatos da Secretaria</a>.
          </Alert>
        )}
      </div>
    </>
  );
}
