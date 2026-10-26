import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { Accordion, Badge, Button, EmptyState, Icon } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteMessage, toggleRead } from './actions';

export const metadata = { title: 'Mensagens recebidas' };

export default async function Page() {
  await requirePermission('messages.manage');
  const list = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return (
    <>
      <h1>Mensagens recebidas</h1>
      <p className="su-muted">Mensagens enviadas pelo formulário de contato do portal. Dados pessoais: acesso restrito, trate conforme a LGPD.</p>
      {list.length ? (
        <Accordion items={list.map((m) => ({
          id: String(m.id),
          title: `${m.read ? '' : '● '}${m.subject} — ${m.name}`,
          content: (
            <div className="su-stack">
              <div className="su-row"><Badge tone={m.read ? 'neutral' : 'info'}>{m.read ? 'Lida' : 'Não lida'}</Badge><Badge tone={m.emailed ? 'success' : 'warning'}>{m.emailed ? 'Encaminhada por e-mail' : 'Somente no painel'}</Badge><span className="su-muted">{formatDateTime(m.createdAt)}</span></div>
              <p style={{ whiteSpace: 'pre-wrap' }}>{m.message}</p>
              <p className="su-muted" style={{ margin: 0 }}>De: <a href={`mailto:${m.email}`}>{m.email}</a>{m.phone && ` · ${m.phone}`}</p>
              <div className="su-actions">
                <form action={toggleRead.bind(null, m.id)}><Button type="submit" size="sm" variant="secondary"><Icon name="check" size="sm" />Marcar como {m.read ? 'não lida' : 'lida'}</Button></form>
                <DeleteButton name={m.subject} onDelete={deleteMessage.bind(null, m.id)} />
              </div>
            </div>
          ),
        }))} />
      ) : <EmptyState icon={<Icon name="inbox" size="xl" />} title="Nenhuma mensagem recebida" />}
    </>
  );
}
