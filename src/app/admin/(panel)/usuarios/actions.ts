'use server';
import { revalidatePath } from 'next/cache';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { sessions, users } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { hashPassword, passwordProblem } from '@/lib/password';
import { ROLES } from '@/lib/permissions';

export type UserState = { error?: string; ok?: boolean };
const roleValues = ROLES.map((r) => r.value) as [string, ...string[]];

const base = z.object({
  name: z.string().trim().min(3, 'Informe o nome.').max(160),
  email: z.string().trim().toLowerCase().email('E-mail inválido.').max(200),
  role: z.enum(roleValues),
  active: z.string().optional(),
  password: z.string().optional(),
});

export async function saveUser(id: number | null, _p: UserState, form: FormData): Promise<UserState> {
  const admin = await requirePermission('users.manage');
  const p = base.safeParse(Object.fromEntries(form));
  if (!p.success) return { error: p.error.issues[0].message };
  const d = p.data;
  const pw = d.password ?? '';
  if (!id && !pw) return { error: 'Defina uma senha inicial.' };
  if (pw) { const prob = passwordProblem(pw); if (prob) return { error: prob }; }
  const dup = await db.select({ id: users.id }).from(users).where(eq(users.email, d.email));
  if (dup.length && dup[0].id !== id) return { error: 'Já existe um usuário com este e-mail.' };
  const active = d.active === 'on';
  if (id) {
    if (id === admin.id && (!active || d.role !== 'administrador')) return { error: 'Você não pode remover o próprio acesso de administrador.' };
    await db.update(users).set({ name: d.name, email: d.email, role: d.role, active, ...(pw ? { passwordHash: await hashPassword(pw) } : {}) }).where(eq(users.id, id));
    if (!active || pw) await db.delete(sessions).where(eq(sessions.userId, id)); // encerra sessões
    await audit(admin, 'editar', 'usuario', id, `${d.name} (${d.role})`);
  } else {
    const [row] = await db.insert(users).values({ name: d.name, email: d.email, role: d.role, active, passwordHash: await hashPassword(pw) }).returning({ id: users.id });
    await audit(admin, 'criar', 'usuario', row.id, `${d.name} (${d.role})`);
  }
  revalidatePath('/admin/usuarios');
  return { ok: true };
}

export async function deleteUser(id: number): Promise<{ error?: string }> {
  const admin = await requirePermission('users.manage');
  if (id === admin.id) return { error: 'Você não pode excluir o próprio usuário.' };
  const [u] = await db.select().from(users).where(eq(users.id, id));
  if (!u) return { error: 'Usuário não encontrado.' };
  await db.delete(users).where(eq(users.id, id));
  await audit(admin, 'excluir', 'usuario', id, u.name);
  revalidatePath('/admin/usuarios');
  return {};
}
