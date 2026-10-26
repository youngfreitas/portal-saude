import { notFound } from 'next/navigation';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { media, orgUnits, postMedia, services, unitCategories, unitServices } from '@/db/schema';
import { Alert, Icon } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { getEntity } from '@/lib/admin/entities';
import { linesToText } from '@/lib/admin/parse';
import { toLocalInput } from '@/lib/format';
import { EntityForm, type ImageInfo } from '@/components/admin/EntityForm';
import { saveEntity } from '../../entity-actions';

export const metadata = { title: 'Editar' };

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function Page({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const p = await params;
  const ent = getEntity(p.entity);
  if (!ent) notFound();
  const user = await requirePermission(ent.read);
  const canWrite = can(user.role, ent.write);
  const isNew = p.id === 'novo';
  const id = isNew ? null : Number(p.id);
  if (!isNew && !Number.isInteger(id)) notFound();
  if (isNew && !canWrite) notFound();
  const t = ent.table as any;
  const row: any = isNew ? null : (await db.select().from(t).where(eq(t.id, id!)).limit(1))[0];
  if (!isNew && !row) notFound();

  const values: Record<string, unknown> = {};
  for (const f of ent.fields) {
    const v = row ? row[f.name] : undefined;
    if (f.type === 'datetime') values[f.name] = toLocalInput(v);
    else if (f.type === 'lines') values[f.name] = linesToText(v, f.linesKind ?? 'links');
    else if (f.type === 'checkbox') values[f.name] = row ? !!v : f.name === 'active';
    else if (f.type === 'select' && f.name === 'featured') values[f.name] = String(v ?? 0);
    else if (v !== undefined) values[f.name] = v;
  }
  if (isNew) {
    for (const f of ent.fields) if (f.type === 'select' && f.options && !f.optionsFrom && values[f.name] === undefined && f.required) values[f.name] = f.options[0].value;
    if (ent.key === 'noticias') values.status = 'rascunho';
  }

  const options: Record<string, { value: string; label: string }[]> = {};
  if (ent.fields.some((f) => f.optionsFrom === 'unitCategories')) options.unitCategories = (await db.select().from(unitCategories).orderBy(asc(unitCategories.sortOrder))).map((c) => ({ value: String(c.id), label: c.name }));
  if (ent.fields.some((f) => f.optionsFrom === 'orgUnits')) options.orgUnits = (await db.select().from(orgUnits).orderBy(asc(orgUnits.name))).filter((o) => o.id !== id).map((o) => ({ value: String(o.id), label: o.name }));

  const images: Record<string, ImageInfo> = {};
  for (const f of ent.fields.filter((x) => x.type === 'image')) {
    const mid = row?.[f.name] as number | null | undefined;
    if (mid) { const [m] = await db.select().from(media).where(eq(media.id, mid)); images[f.name] = m ? { id: m.id, alt: m.alt } : null; } else images[f.name] = null;
  }
  const svcList = ent.key === 'unidades' ? await db.select({ id: services.id, name: services.name }).from(services).orderBy(asc(services.name)) : [];
  const selectedServices = ent.key === 'unidades' && id ? (await db.select().from(unitServices).where(eq(unitServices.unitId, id))).map((x) => x.serviceId) : [];
  const att = ent.key === 'noticias' && id ? await db.select({ pm: postMedia, m: media }).from(postMedia).innerJoin(media, eq(media.id, postMedia.mediaId)).where(eq(postMedia.postId, id)) : [];
  const toItem = (x: (typeof att)[number]) => ({ id: x.m.id, name: x.m.originalName, alt: x.m.alt });

  return (
    <>
      <h1>{isNew ? `Novo ${ent.singular}` : canWrite ? `Editar ${ent.singular}` : ent.title}</h1>
      {!canWrite && <Alert tone="info" icon={<Icon name="eye" />} style={{ marginBottom: 'var(--space-5)' }}>Seu perfil tem acesso somente leitura.</Alert>}
      {ent.key === 'unidades' && canWrite && (
        <Alert tone="warning" icon={<Icon name="map-pin" />} style={{ marginBottom: 'var(--space-5)' }} title="Só dados oficiais">
          Preencha apenas informações confirmadas pela Secretaria. Campos vazios aparecem no portal como “Informação pendente de confirmação oficial”. A unidade só entra no mapa com coordenadas marcadas como verificadas.
        </Alert>
      )}
      {canWrite ? (
        <EntityForm
          action={saveEntity.bind(null, ent.key, id)}
          fields={ent.fields} values={values} options={options} images={images}
          services={svcList} selectedServices={selectedServices}
          gallery={att.filter((x) => x.pm.role === 'gallery').map(toItem)} attachments={att.filter((x) => x.pm.role === 'attachment').map(toItem)}
          canPublish={ent.publish ? can(user.role, ent.publish) : true} cancelHref={`/admin/${ent.key}`}
        />
      ) : (
        <dl className="su-dl">{ent.fields.filter((f) => !['richtext', 'image', 'gallery', 'attachments', 'services'].includes(f.type)).map((f) => <div key={f.name} style={{ display: 'contents' }}><dt>{f.label}</dt><dd>{String(values[f.name] ?? '—') || '—'}</dd></div>)}</dl>
      )}
    </>
  );
}
