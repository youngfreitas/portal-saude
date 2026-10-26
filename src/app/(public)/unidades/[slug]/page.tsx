import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { media, unitCategories, units } from '@/db/schema';
import { Badge, Button, Card, DescriptionList, Icon, Media, PageHead, PendingInfo, ValueOrPending } from '@/components/ds';
import { imageSrc } from '@/lib/media';
import { telHref } from '@/lib/format';
import { unitServiceMap } from '@/lib/queries';

async function load(slug: string) {
  const [row] = await db.select({ unit: units, categoryName: unitCategories.name }).from(units).leftJoin(unitCategories, eq(unitCategories.id, units.categoryId)).where(and(eq(units.slug, slug), eq(units.active, true))).limit(1);
  return row;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const r = await load((await params).slug);
  if (!r) return { title: 'Unidade não encontrada' };
  return { title: r.unit.name, description: r.unit.description?.slice(0, 160) || `Endereço, horário e serviços da unidade ${r.unit.name}.`, alternates: { canonical: `/unidades/${r.unit.slug}` } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const r = await load((await params).slug);
  if (!r) notFound();
  const u = r.unit;
  const [svc, [photo]] = await Promise.all([unitServiceMap([u.id]), u.photoId ? db.select().from(media).where(eq(media.id, u.photoId)) : Promise.resolve([])]);
  const services = svc.get(u.id) ?? [];
  const hasVerifiedCoords = u.coordsVerified && u.lat != null && u.lng != null;
  const route = hasVerifiedCoords
    ? `https://www.openstreetmap.org/directions?to=${u.lat}%2C${u.lng}`
    : u.address ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(`${u.address}, Ubatuba`)}` : null;
  return (
    <>
      <PageHead title={u.name} trail={[{ label: 'Início', href: '/' }, { label: 'Unidades de Saúde', href: '/unidades' }, { label: u.name }]} lead={r.categoryName ?? undefined}
        actions={<>
          {u.phone ? <Button href={telHref(u.phone)}><Icon name="phone" size="sm" />Ligar</Button> : null}
          {u.email ? <Button variant="secondary" href={`mailto:${u.email}`}><Icon name="mail" size="sm" />Enviar e-mail</Button> : null}
          {route ? <Button variant="secondary" external href={route}><Icon name="navigation" size="sm" />Como chegar</Button> : null}
        </>} />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="su-stack">
          <Card>
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-4)' }}>Informações da unidade</h2>
            <DescriptionList items={[
              { term: 'Nome', detail: u.name },
              { term: 'Categoria', detail: <ValueOrPending value={r.categoryName} /> },
              { term: 'Bairro', detail: <ValueOrPending value={u.neighborhood} /> },
              { term: 'Endereço', detail: <ValueOrPending value={u.address} /> },
              { term: 'CEP', detail: <ValueOrPending value={u.cep} /> },
              { term: 'Telefone', detail: u.phone ? <a href={telHref(u.phone)}>{u.phone}</a> : <PendingInfo /> },
              { term: 'E-mail', detail: u.email ? <a href={`mailto:${u.email}`}>{u.email}</a> : <PendingInfo /> },
              { term: 'Horário de funcionamento', detail: <ValueOrPending value={u.hours} /> },
              { term: 'Responsável', detail: <ValueOrPending value={u.manager} /> },
            ]} />
          </Card>
          <Card>
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Serviços oferecidos</h2>
            {services.length ? (
              <div className="su-row">{services.map((s) => <Link key={s.slug} href={`/servicos/${s.slug}`} className="su-tag">{s.name}</Link>)}</div>
            ) : <PendingInfo />}
          </Card>
          {u.description && <Card><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Sobre a unidade</h2><p style={{ margin: 0 }}>{u.description}</p></Card>}
        </div>
        <aside className="su-stack" aria-label="Foto e localização">
          <Media src={imageSrc(u.photoId, 960)} alt={photo?.alt ?? `Foto da unidade ${u.name}`} />
          <Card>
            <h2 style={{ font: 'var(--text-h4)', marginBottom: 'var(--space-2)' }}>Localização</h2>
            {hasVerifiedCoords ? <Button fullWidth variant="secondary" href={`/unidades/mapa?unidade=${u.slug}`}><Icon name="map" size="sm" />Ver no mapa</Button> : <PendingInfo label="Localização no mapa pendente de confirmação oficial" />}
          </Card>
          <Button variant="tertiary" href="/unidades"><Icon name="arrow-left" size="sm" />Todas as unidades</Button>
        </aside>
      </div>
    </>
  );
}
