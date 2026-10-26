'use server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { audit } from '@/lib/audit';
import { authenticate, createSession, destroySession, getSessionUser, recordAttempt, tooManyAttempts } from '@/lib/auth';

export type LoginState = { error?: string };

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const p = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) }).safeParse(Object.fromEntries(form));
  if (!p.success) return { error: 'Informe e-mail e senha.' };
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? 'local').split(',')[0].trim();
  const key = createHash('sha256').update(`${p.data.email.toLowerCase()}|${ip}`).digest('hex');
  if (await tooManyAttempts(key)) return { error: 'Muitas tentativas. Aguarde 15 minutos e tente de novo.' };
  const user = await authenticate(p.data.email, p.data.password);
  await recordAttempt(key, !!user);
  if (!user) {
    await audit(null, 'login_falhou', 'sessao', null, `E-mail: ${p.data.email.toLowerCase()}`);
    return { error: 'E-mail ou senha incorretos.' };
  }
  await createSession(user.id);
  await audit({ id: user.id, name: user.name }, 'login', 'sessao');
  redirect('/admin');
}

export async function logoutAction() {
  const u = await getSessionUser();
  if (u) await audit(u, 'logout', 'sessao');
  await destroySession();
  redirect('/admin/login');
}
