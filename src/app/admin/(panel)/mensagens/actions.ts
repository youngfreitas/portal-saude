'use server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { audit } from '@/lib/audit';

export async function toggleRead(id: number) {
  await requirePermission('messages.manage');
  const [m] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
  if (m) await db.update(contactMessages).set({ read: !m.read }).where(eq(contactMessages.id, id));
  revalidatePath('/admin/mensagens');
}
export async function deleteMessage(id: number): Promise<{ error?: string }> {
  const u = await requirePermission('messages.manage');
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  await audit(u, 'excluir', 'mensagem', id);
  revalidatePath('/admin/mensagens');
  return {};
}
