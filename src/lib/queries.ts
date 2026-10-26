import 'server-only';
import { and, asc, desc, eq, ilike, or, sql, count, inArray, type SQL } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, orgUnits, people, posts, services, unitCategories, unitServices, units } from '@/db/schema';
import { livePostsCondition } from './publishing';

export const PAGE_SIZE = 9;

export async function listLivePosts(opts: { q?: string; category?: string; sort?: 'recentes' | 'antigas'; page?: number; pageSize?: number; featuredOnly?: boolean; notice?: boolean }) {
  const pageSize = opts.pageSize ?? PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const conds: SQL[] = [livePostsCondition()];
  if (opts.q) conds.push(or(ilike(posts.title, `%${opts.q}%`), ilike(posts.subtitle, `%${opts.q}%`), ilike(posts.body, `%${opts.q}%`))!);
  if (opts.category) conds.push(eq(posts.category, opts.category));
  if (opts.notice) conds.push(eq(posts.isNotice, true));
  const where = and(...conds);
  const order = opts.sort === 'antigas' ? asc(sql`coalesce(${posts.publishAt}, ${posts.createdAt})`) : desc(sql`coalesce(${posts.publishAt}, ${posts.createdAt})`);
  const [rows, [{ n }]] = await Promise.all([
    db.select().from(posts).where(where).orderBy(order).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ n: count() }).from(posts).where(where),
  ]);
  return { rows, total: n, pages: Math.max(1, Math.ceil(n / pageSize)), page };
}

export async function listActiveUnits(opts: { q?: string; categoryId?: number; neighborhood?: string } = {}) {
  const conds: SQL[] = [eq(units.active, true)];
  if (opts.q) conds.push(or(ilike(units.name, `%${opts.q}%`), ilike(units.neighborhood, `%${opts.q}%`), ilike(units.address, `%${opts.q}%`))!);
  if (opts.categoryId) conds.push(eq(units.categoryId, opts.categoryId));
  if (opts.neighborhood) conds.push(eq(units.neighborhood, opts.neighborhood));
  return db
    .select({ unit: units, categoryName: unitCategories.name, categorySlug: unitCategories.slug })
    .from(units)
    .leftJoin(unitCategories, eq(unitCategories.id, units.categoryId))
    .where(and(...conds))
    .orderBy(asc(units.name));
}

export async function unitServiceMap(unitIds: number[]) {
  if (!unitIds.length) return new Map<number, { name: string; slug: string }[]>();
  const rows = await db
    .select({ unitId: unitServices.unitId, name: services.name, slug: services.slug })
    .from(unitServices)
    .innerJoin(services, eq(services.id, unitServices.serviceId))
    .where(and(inArray(unitServices.unitId, unitIds), eq(services.active, true)));
  const m = new Map<number, { name: string; slug: string }[]>();
  for (const r of rows) m.set(r.unitId, [...(m.get(r.unitId) ?? []), { name: r.name, slug: r.slug }]);
  return m;
}

export async function listNeighborhoods() {
  const rows = await db.selectDistinct({ n: units.neighborhood }).from(units).where(eq(units.active, true)).orderBy(asc(units.neighborhood));
  return rows.map((r) => r.n).filter((x): x is string => !!x);
}

export async function listCampaigns(status?: string) {
  const conds: SQL[] = [eq(campaigns.published, true)];
  if (status) conds.push(eq(campaigns.status, status));
  return db.select().from(campaigns).where(and(...conds)).orderBy(desc(campaigns.startsOn));
}

export async function orgTree() {
  const all = await db.select().from(orgUnits).orderBy(asc(orgUnits.sortOrder), asc(orgUnits.id));
  const ppl = await db.select().from(people).where(eq(people.active, true)).orderBy(asc(people.sortOrder), asc(people.name));
  type Node = (typeof all)[number] & { children: Node[]; people: typeof ppl };
  const byId = new Map<number, Node>(all.map((o) => [o.id, { ...o, children: [], people: ppl.filter((p) => p.orgUnitId === o.id) }]));
  const roots: Node[] = [];
  for (const n of byId.values()) {
    const parent = n.parentId ? byId.get(n.parentId) : null;
    (parent ? parent.children : roots).push(n);
  }
  return { roots, all, people: ppl };
}
