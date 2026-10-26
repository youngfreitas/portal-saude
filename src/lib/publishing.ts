import { and, eq, lte, or, isNull, type SQL } from 'drizzle-orm';
import { posts } from '@/db/schema';

/** Notícia visível ao público: publicada, e com data de publicação já alcançada (agendamento). */
export function postIsLive(p: { status: string; publishAt: Date | null }, now = new Date()): boolean {
  return p.status === 'publicado' && (p.publishAt === null || p.publishAt <= now);
}

export function livePostsCondition(now = new Date()): SQL {
  return and(eq(posts.status, 'publicado'), or(isNull(posts.publishAt), lte(posts.publishAt, now)))!;
}
