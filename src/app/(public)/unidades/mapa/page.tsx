import type { Metadata } from 'next';
import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { unitCategories, units } from '@/db/schema';
import { Alert, Icon, PageHead } from '@/components/ds';
import { UnitsMap, type MapUnit } from '@/components/site/UnitsMap';

export const metadata: Metadata = { title: 'Mapa das Unidades de Saúde', description: 'Veja no mapa as unidades de saúde de Ubatuba com localização confirmada.' };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const rows = await db
    .select({ u: units, cat: unitCategories.name })
    .from(units).leftJoin(unitCategories, eq(unitCategories.id, units.categoryId))
    // Só entram no mapa unidades com coordenadas marcadas como verificadas no painel.
    .where(and(eq(units.active, true), eq(units.coordsVerified, true), isNotNull(units.lat), isNotNull(units.lng)))
    .orderBy(asc(units.name));
  const cats = await db.select({ id: unitCategories.id, name: unitCategories.name }).from(unitCategories).orderBy(asc(unitCategories.sortOrder));
  const all: MapUnit[] = rows.map(({ u, cat }) => ({ id: u.id, slug: u.slug, name: u.name, lat: u.lat!, lng: u.lng!, address: u.address, category: cat, categoryId: u.categoryId, neighborhood: u.neighborhood, phone: u.phone, hours: u.hours }));
  return (
    <>
      <PageHead title="Mapa das unidades" trail={[{ label: 'Início', href: '/' }, { label: 'Unidades de Saúde', href: '/unidades' }, { label: 'Mapa' }]} lead="Somente unidades com localização confirmada oficialmente aparecem no mapa." />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        {all.length ? <UnitsMap all={all} categories={cats} initialSlug={sp.unidade} /> : (
          <Alert tone="info" icon={<Icon name="info" />} title="Localizações em confirmação">Nenhuma unidade tem localização confirmada oficialmente ainda. Consulte a <a href="/unidades">lista de unidades</a> para endereços e horários.</Alert>
        )}
      </div>
    </>
  );
}
