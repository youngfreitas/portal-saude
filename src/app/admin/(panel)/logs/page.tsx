import { desc, ilike, or, eq, and, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { Badge, Button, Field, Input, Pagination, Select, Table } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { ACTION_LABELS, actionLabel } from '@/lib/admin/labels';

export const metadata = { title: 'Log de atividades' };
const SIZE = 50;

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission('logs.view');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.pagina) || 1);
  const conds: SQL[] = [];
  if (sp.acao) conds.push(eq(auditLogs.action, sp.acao));
  if (sp.q) conds.push(or(ilike(auditLogs.userName, `%${sp.q}%`), ilike(auditLogs.summary, `%${sp.q}%`), ilike(auditLogs.entity, `%${sp.q}%`))!);
  const rows = await db.select().from(auditLogs).where(and(...conds)).orderBy(desc(auditLogs.createdAt)).limit(SIZE + 1).offset((page - 1) * SIZE);
  const more = rows.length > SIZE;
  const href = (p: number) => `/admin/logs?${new URLSearchParams({ ...(sp.acao ? { acao: sp.acao } : {}), ...(sp.q ? { q: sp.q } : {}), pagina: String(p) })}`;
  return (
    <>
      <h1>Log de atividades</h1>
      <form className="su-filters" style={{ gridTemplateColumns: '2fr 1fr auto', marginBottom: 'var(--space-5)' }} role="search">
        <Field label="Buscar" htmlFor="lg-q"><Input id="lg-q" name="q" defaultValue={sp.q} placeholder="Usuário, item ou resumo" /></Field>
        <Field label="Ação" htmlFor="lg-a"><Select id="lg-a" name="acao" defaultValue={sp.acao ?? ''} placeholder="Todas" options={Object.entries(ACTION_LABELS).map(([value, label]) => ({ value, label }))} /></Field>
        <Button type="submit">Filtrar</Button>
      </form>
      <Table rowKey={(r) => r.id} caption="Log de atividades" rows={rows.slice(0, SIZE)} columns={[
        { header: 'Quando', cell: (r) => formatDateTime(r.createdAt) },
        { header: 'Quem', cell: (r) => r.userName ?? '—' },
        { header: 'Ação', cell: (r) => <Badge tone={r.action === 'excluir' || r.action === 'login_falhou' ? 'danger' : r.action === 'publicar' ? 'success' : 'brand'}>{actionLabel(r.action)}</Badge> },
        { header: 'Item', cell: (r) => r.entity + (r.entityId ? ` #${r.entityId}` : '') },
        { header: 'Resumo', cell: (r) => r.summary ?? '—' },
      ]} />
      <Pagination page={page} pages={more ? page + 1 : page} hrefFor={href} />
    </>
  );
}
