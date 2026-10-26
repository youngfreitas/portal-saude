import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { Badge, Table } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { roleLabel } from '@/lib/permissions';
import { formatDate } from '@/lib/format';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteUser, saveUser } from './actions';
import { UserForm } from '@/components/admin/UserForm';

export const metadata = { title: 'Usuários e perfis' };

export default async function Page() {
  const me = await requirePermission('users.manage');
  const list = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active, createdAt: users.createdAt }).from(users).orderBy(asc(users.name));
  return (
    <>
      <h1>Usuários e perfis</h1>
      <div className="su-admin__toolbar"><span className="su-muted">{list.length} usuários</span><UserForm action={saveUser.bind(null, null)} label="Novo usuário" /></div>
      <Table rowKey={(u) => u.id} caption="Usuários" rows={list} columns={[
        { header: 'Nome', cell: (u) => <strong>{u.name}</strong> },
        { header: 'E-mail', cell: (u) => u.email },
        { header: 'Perfil', cell: (u) => <Badge tone="brand">{roleLabel(u.role)}</Badge> },
        { header: 'Situação', cell: (u) => (u.active ? <Badge tone="success" dot>Ativo</Badge> : <Badge tone="danger" dot>Inativo</Badge>) },
        { header: 'Criado em', cell: (u) => formatDate(u.createdAt) },
        { header: 'Ações', cell: (u) => (
          <div className="su-actions">
            <UserForm action={saveUser.bind(null, u.id)} user={u} label="Editar" />
            {u.id !== me.id && <DeleteButton name={u.name} onDelete={deleteUser.bind(null, u.id)} />}
          </div>
        ) },
      ]} />
    </>
  );
}
