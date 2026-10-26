import { count, desc, eq, and, gt } from 'drizzle-orm';
import { db } from '@/db';
import { auditLogs, campaigns, contactMessages, posts, units } from '@/db/schema';
import { Alert, Button, Card, Icon, Table, Badge } from '@/components/ds';
import { requireUser } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { formatDateTime } from '@/lib/format';
import { actionLabel } from '@/lib/admin/labels';

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await requireUser();
  const sp = await searchParams;
  const now = new Date();
  const [[draft], [live], [scheduled], [camp], [unit], [unread], recent] = await Promise.all([
    db.select({ n: count() }).from(posts).where(eq(posts.status, 'rascunho')),
    db.select({ n: count() }).from(posts).where(eq(posts.status, 'publicado')),
    db.select({ n: count() }).from(posts).where(and(eq(posts.status, 'publicado'), gt(posts.publishAt, now))),
    db.select({ n: count() }).from(campaigns).where(eq(campaigns.status, 'ativa')),
    db.select({ n: count() }).from(units),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.read, false)),
    can(user.role, 'logs.view') ? db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(8) : Promise.resolve([]),
  ]);
  const stats = [
    { label: 'Rascunhos', v: draft.n, href: '/admin/noticias' },
    { label: 'Publicadas', v: live.n, href: '/admin/noticias' },
    { label: 'Agendadas', v: scheduled.n, href: '/admin/noticias' },
    { label: 'Campanhas em andamento', v: camp.n, href: '/admin/campanhas' },
    { label: 'Unidades cadastradas', v: unit.n, href: '/admin/unidades' },
    ...(can(user.role, 'messages.manage') ? [{ label: 'Mensagens não lidas', v: unread.n, href: '/admin/mensagens' }] : []),
  ];
  return (
    <>
      <h1>Olá, {user.name.split(' ')[0]}</h1>
      {sp.negado && <Alert tone="warning" icon={<Icon name="shield-alert" />} title="Acesso negado" style={{ marginBottom: 'var(--space-5)' }}>Seu perfil não tem permissão para essa área.</Alert>}
      <div className="su-grid su-grid-3" style={{ marginBottom: 'var(--space-8)' }}>
        {stats.map((s) => (
          <Card key={s.label} accent="accent" interactive>
            <div className="su-stat">{s.v}</div>
            <a className="su-card__link su-stat__label" href={s.href}>{s.label}</a>
          </Card>
        ))}
      </div>
      <div className="su-row" style={{ marginBottom: 'var(--space-8)' }}>
        {can(user.role, 'news.write') && <Button href="/admin/noticias/novo"><Icon name="plus" size="sm" />Nova notícia</Button>}
        {can(user.role, 'campaigns.write') && <Button variant="secondary" href="/admin/campanhas/novo"><Icon name="plus" size="sm" />Nova campanha</Button>}
        {can(user.role, 'catalog.write') && <Button variant="secondary" href="/admin/unidades/novo"><Icon name="plus" size="sm" />Nova unidade</Button>}
      </div>
      {recent.length > 0 && (
        <section>
          <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Últimas atividades</h2>
          <Table rowKey={(r) => r.id} caption="Últimas atividades" rows={recent} columns={[
            { header: 'Quando', cell: (r) => formatDateTime(r.createdAt) },
            { header: 'Quem', cell: (r) => r.userName ?? '—' },
            { header: 'Ação', cell: (r) => <Badge tone="brand">{actionLabel(r.action)}</Badge> },
            { header: 'Item', cell: (r) => `${r.entity}${r.summary ? ' — ' + r.summary : ''}` },
          ]} />
        </section>
      )}
    </>
  );
}
