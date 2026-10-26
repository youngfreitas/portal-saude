import { notFound } from 'next/navigation';
import { desc, asc } from 'drizzle-orm';
import { db } from '@/db';
import { orgUnits, unitCategories } from '@/db/schema';
import { Alert, Badge, Button, EmptyState, Icon, Table } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { getEntity } from '@/lib/admin/entities';
import { postStatusLabel } from '@/lib/admin/labels';
import { formatDate, formatDateTime } from '@/lib/format';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteEntity } from '../entity-actions';

export const metadata = { title: 'Cadastro' };
const ASC_ORDER = ['organograma', 'chefias', 'categorias', 'vacinas', 'contatos', 'redes'];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Page({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const ent = getEntity((await params).entity);
  if (!ent) notFound();
  const user = await requirePermission(ent.read);
  const sp = await searchParams;
  const t = ent.table as any;
  const rows: any[] = await db.select().from(t).orderBy(ASC_ORDER.includes(ent.key) ? asc(t.id) : desc(t.id)).limit(300);
  const cats = ent.key === 'unidades' ? new Map((await db.select().from(unitCategories)).map((c) => [c.id, c.name])) : null;
  const org = ent.key === 'organograma' || ent.key === 'chefias' ? new Map((await db.select().from(orgUnits)).map((o) => [o.id, o.name])) : null;
  const canWrite = can(user.role, ent.write), canDelete = can(user.role, ent.delete);

  const cols: { header: string; cell: (r: any) => React.ReactNode }[] = [
    { header: ent.key === 'publicacoes-sociais' ? 'Legenda' : 'Nome', cell: (r) => <strong>{String(r[ent.nameField] ?? '—').slice(0, 90)}</strong> },
  ];
  if (ent.key === 'noticias') cols.push(
    { header: 'Situação', cell: (r) => { const s = postStatusLabel(r.status, r.publishAt); return <Badge tone={s.tone}>{s.label}</Badge>; } },
    { header: 'Categoria', cell: (r) => (r.isNotice ? 'Comunicado' : r.category) },
    { header: 'Publicação', cell: (r) => formatDateTime(r.publishAt) || '—' },
    { header: 'Atualizada', cell: (r) => formatDate(r.updatedAt) },
  );
  if (ent.key === 'campanhas') cols.push({ header: 'Situação', cell: (r) => r.status }, { header: 'Publicada', cell: (r) => (r.published ? 'Sim' : 'Não') }, { header: 'Período', cell: (r) => [r.startsOn, r.endsOn].filter(Boolean).join(' → ') || '—' });
  if (ent.key === 'unidades') cols.push({ header: 'Categoria', cell: (r) => cats?.get(r.categoryId) ?? '—' }, { header: 'Bairro', cell: (r) => r.neighborhood ?? '—' }, { header: 'No mapa', cell: (r) => (r.coordsVerified ? <Badge tone="success" dot>Verificada</Badge> : <Badge>Sem coordenada</Badge>) }, { header: 'Visível', cell: (r) => (r.active ? 'Sim' : 'Não') });
  if (ent.key === 'servicos') cols.push({ header: 'Tipo', cell: (r) => r.kind }, { header: 'Visível', cell: (r) => (r.active ? 'Sim' : 'Não') });
  if (ent.key === 'vacinas') cols.push({ header: 'Quando', cell: (r) => r.ageGroup }, { header: 'Visível', cell: (r) => (r.active ? 'Sim' : 'Não') });
  if (ent.key === 'organograma') cols.push({ header: 'Subordinado a', cell: (r) => org?.get(r.parentId) ?? 'Topo' }, { header: 'Tipo', cell: (r) => r.kind });
  if (ent.key === 'chefias') cols.push({ header: 'Cargo', cell: (r) => r.role }, { header: 'Setor', cell: (r) => org?.get(r.orgUnitId) ?? '—' });
  if (ent.key === 'contatos') cols.push({ header: 'Telefone', cell: (r) => r.phone ?? '—' });
  if (ent.key === 'redes') cols.push({ header: 'Rede', cell: (r) => r.network }, { header: 'Endereço', cell: (r) => r.url });
  if (ent.key === 'publicacoes-sociais') cols.push({ header: 'Rede', cell: (r) => r.network }, { header: 'Data', cell: (r) => formatDate(r.postedOn) });
  cols.push({
    header: 'Ações',
    cell: (r) => (
      <div className="su-actions">
        <Button size="sm" variant="secondary" href={`/admin/${ent.key}/${r.id}`}><Icon name={canWrite ? 'pencil' : 'eye'} size="sm" />{canWrite ? 'Editar' : 'Ver'}</Button>
        {canDelete && <DeleteButton name={String(r[ent.nameField] ?? '').slice(0, 60)} onDelete={deleteEntity.bind(null, ent.key, r.id)} />}
      </div>
    ),
  });

  return (
    <>
      <h1>{ent.title}</h1>
      {sp.salvo && <Alert tone="success" icon={<Icon name="circle-check" />} style={{ marginBottom: 'var(--space-4)' }}>Alterações salvas.</Alert>}
      <div className="su-admin__toolbar">
        <span className="su-muted">{rows.length} {rows.length === 1 ? 'registro' : 'registros'}</span>
        {canWrite && <Button href={`/admin/${ent.key}/novo`}><Icon name="plus" size="sm" />Novo {ent.singular}</Button>}
      </div>
      {rows.length ? <Table rowKey={(r) => r.id} caption={ent.title} columns={cols} rows={rows} /> : <EmptyState icon={<Icon name="inbox" size="xl" />} title={`Nenhum registro em “${ent.title}”`} description={canWrite ? `Use “Novo ${ent.singular}” para começar.` : undefined} />}
    </>
  );
}
