import 'server-only';
import { and, eq, gt, count } from 'drizzle-orm';
import { db } from '@/db';
import { rateLimits } from '@/db/schema';

/** true = dentro do limite (e registra a chamada). */
export async function allow(key: string, max: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const [{ n }] = await db.select({ n: count() }).from(rateLimits).where(and(eq(rateLimits.key, key), gt(rateLimits.createdAt, since)));
  if (n >= max) return false;
  await db.insert(rateLimits).values({ key });
  return true;
}
