import 'server-only';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import type { SessionUser } from './auth';

export type AuditAction = 'login' | 'logout' | 'login_falhou' | 'criar' | 'editar' | 'excluir' | 'publicar' | 'despublicar';

export async function audit(
  user: Pick<SessionUser, 'id' | 'name'> | null,
  action: AuditAction,
  entity: string,
  entityId?: string | number | null,
  summary?: string,
) {
  await db.insert(auditLogs).values({
    userId: user?.id ?? null,
    userName: user?.name ?? null,
    action,
    entity,
    entityId: entityId != null ? String(entityId) : null,
    summary: summary?.slice(0, 500) ?? null,
  });
}
