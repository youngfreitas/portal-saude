import type { Metadata } from 'next';
import { PageHead, Input, Select, Button, Icon, Pagination, EmptyState, Field } from '@/components/ds';
import { PostCard } from '@/components/site/Cards';
import { listLivePosts } from '@/lib/queries';

export const metadata: Metadata = { title: 'Notícias e Comunicados', description: 'Notícias, comunicados e informes oficiais da Secretaria Municipal de Saúde de Ubatuba.' };
const CATEGORIES = ['Notícia', 'Comunicado', 'Vacinação', 'Campanha', 'Vigilância', 'Atenção Básica', 'Urgência', 'Outros'];

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const page = Number(sp.pagina) || 1;
  const sort = sp.ordem === 'antigas' ? 'antigas' : 'recentes';
  const res = await listLivePosts({ q: sp.q?.trim() || undefined, category: sp.categoria || undefined, sort, page });
  const hrefFor = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set('q', sp.q); if (sp.categoria) u.set('categoria', sp.categoria); if (sort !== 'recentes') u.set('ordem', sort);
    if (p > 1) u.set('pagina', String(p));
    const qs = u.toString();
    return '/noticias' + (qs ? '?' + qs : '');
  };
  return (
    <>
      <PageHead title="Notícias e Comunicados" trail={[{ label: 'Início', href: '/' }, { label: 'Notícias e Comunicados' }]} lead="Informes oficiais da Secretaria Municipal de Saúde, em ordem de publicação." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <form className="su-filters" role="search" aria-label="Filtrar notícias">
          <Field label="Buscar" htmlFor="f-q"><Input id="f-q" name="q" defaultValue={sp.q} placeholder="Palavra-chave" icon={<Icon name="search" size="sm" />} /></Field>
          <Field label="Categoria" htmlFor="f-cat"><Select id="f-cat" name="categoria" defaultValue={sp.categoria ?? ''} placeholder="Todas" options={CATEGORIES} /></Field>
          <Field label="Ordenar" htmlFor="f-ord"><Select id="f-ord" name="ordem" defaultValue={sort} options={[{ value: 'recentes', label: 'Mais recentes' }, { value: 'antigas', label: 'Mais antigas' }]} /></Field>
          <Button type="submit">Filtrar</Button>
        </form>
        <p className="su-muted" style={{ margin: 'var(--space-6) 0 var(--space-4)' }} aria-live="polite">{res.total} {res.total === 1 ? 'publicação encontrada' : 'publicações encontradas'}</p>
        {res.rows.length ? (
          <div className="su-grid su-grid-2">{res.rows.map((p) => <PostCard key={p.id} post={p} />)}</div>
        ) : (
          <EmptyState icon={<Icon name="newspaper" size="xl" />} title="Nenhuma publicação encontrada" description="Tente outra palavra-chave ou remova os filtros." action={<Button variant="secondary" href="/noticias">Limpar filtros</Button>} />
        )}
        <Pagination page={res.page} pages={res.pages} hrefFor={hrefFor} />
      </div>
    </>
  );
}
