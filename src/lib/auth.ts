import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { and, eq, gt, count } from 'drizzle-orm';
import { db } from '@/db';
import { sessions, users, loginAttempts } from '@/db/schema';
import { can, type Permission } from './permissions';
import { verifyPassword } from './password';

export const SESSION_COOKIE = 'su_admin_session';
const SESSION_HOURS = 8;
const MAX_FAILS = 5;
const WINDOW_MIN = 15;

export type SessionUser = { id: number; name: string; email: string; role: string };

const hashToken = (t: string) => createHash('sha256').update(t).digest('hex');

export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600_000);
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  jar.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, active: users.active })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0];
  if (!u || !u.active) return null;
  return { id: u.id, name: u.name, email: u.email, role: u.role };
}

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) redirect('/admin/login');
  return u;
}

/** Barra a ação se o perfil não tem a permissão. Use em toda página, server action e rota do painel. */
export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const u = await requireUser();
  if (!can(u.role, permission)) redirect('/admin?negado=1');
  return u;
}

export async function tooManyAttempts(key: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MIN * 60_000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(loginAttempts)
    .where(and(eq(loginAttempts.key, key), eq(loginAttempts.success, false), gt(loginAttempts.createdAt, since)));
  return n >= MAX_FAILS;
}

export async function recordAttempt(key: string, success: boolean): Promise<void> {
  await db.insert(loginAttempts).values({ key, success });
}

export async function authenticate(email: string, password: string) {
  const [u] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  // compara mesmo sem usuário para não revelar existência pelo tempo de resposta
  const ok = await verifyPassword(password, u?.passwordHash ?? 'scrypt$00$00');
  if (!u || !u.active || !ok) return null;
  return u;
}
