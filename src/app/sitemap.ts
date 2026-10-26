import type { MetadataRoute } from 'next';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, posts, services, units } from '@/db/schema';
import { livePostsCondition } from '@/lib/publishing';

export const dynamic = 'force-dynamic';
const SITE = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [p, u, s, c] = await Promise.all([
    db.select({ slug: posts.slug, d: posts.updatedAt }).from(posts).where(livePostsCondition()),
    db.select({ slug: units.slug, d: units.updatedAt }).from(units).where(eq(units.active, true)),
    db.select({ slug: services.slug, d: services.updatedAt }).from(services).where(eq(services.active, true)),
    db.select({ slug: campaigns.slug, d: campaigns.updatedAt }).from(campaigns).where(eq(campaigns.published, true)),
  ]);
  const fixed = ['', '/secretaria', '/secretaria/organograma', '/secretaria/chefias', '/unidades', '/unidades/mapa', '/servicos', '/servicos/vacinacao', '/servicos/tratamentos', '/noticias', '/campanhas', '/redes-sociais', '/contatos', '/acessibilidade', '/privacidade', '/termos-de-uso', '/cookies'];
  return [
    ...fixed.map((path) => ({ url: SITE + path })),
    ...p.map((x) => ({ url: `${SITE}/noticias/${x.slug}`, lastModified: x.d })),
    ...u.map((x) => ({ url: `${SITE}/unidades/${x.slug}`, lastModified: x.d })),
    ...s.map((x) => ({ url: `${SITE}/servicos/${x.slug}`, lastModified: x.d })),
    ...c.map((x) => ({ url: `${SITE}/campanhas/${x.slug}`, lastModified: x.d })),
  ];
}
