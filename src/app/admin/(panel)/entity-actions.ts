'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { and, eq, ne, inArray } from 'drizzle-orm';
import { db } from '@/db';
import { media, orgUnits, postMedia, posts, unitServices } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { can } from '@/lib/permissions';
import { slugify } from '@/lib/slug';
import { deleteMedia, saveUpload, UploadError } from '@/lib/media';
import { getEntity, type Entity, type Field } from '@/lib/admin/entities';
import { coordsInUbatuba, parseField } from '@/lib/admin/parse';

export type EntityState = { error?: string; fieldErrors?: Record<string, string> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

async function uniqueSlug(ent: Entity, base: string, excludeId?: number): Promise<string> {
  const t = ent.table as AnyTable;
  let slug = slugify(base), n = 1;
  for (;;) {
    const where = excludeId ? and(eq(t.slug, slug), ne(t.id, excludeId)) : eq(t.slug, slug);
    const hit = await db.select({ id: t.id }).from(t).where(where).limit(1);
    if (!hit.length) return slug;
    slug = `${slugify(base)}-${++n}`;
  }
}

function bust(ent: Entity) {
  revalidatePath('/', 'layout');
  revalidatePath('/admin/' + ent.key);
}

export async function saveEntity(key: string, id: number | null, _prev: EntityState, form: FormData): Promise<EntityState> {
  const ent = getEntity(key);
  if (!ent) return { error: 'Cadastro desconhecido.' };
  const user = await requirePermission(ent.write);
  const t = ent.table as AnyTable;
  const canPublish = ent.publish ? can(user.role, ent.publish) : true;

  const [existing] = id ? await db.select().from(t).where(eq(t.id, id)).limit(1) : [];
  if (id && !existing) return { error: 'Registro não encontrado.' };

  const values: Record<string, unknown> = {};
  const fieldErrors: Record<string, string> = {};
  for (const f of ent.fields) {
    if (f.publishOnly && !canPublish) continue; // protege campos de publicação no servidor
    const r = parseField(f, form);
    if (r.skip) continue;
    if (r.error) fieldErrors[f.name] = r.error; else values[f.name] = r.value;
  }

  // regras específicas
  if (ent.key === 'noticias') {
    if (!canPublish) {
      // Editor: só rascunho/revisão; nunca publica, despublica nem agenda.
      const st = String(form.get('status') ?? 'rascunho');
      const locked = existing && (existing.status === 'publicado' || existing.status === 'despublicado');
      values.status = locked ? existing.status : st === 'revisao' ? 'revisao' : 'rascunho';
      values.publishAt = existing ? existing.publishAt : null;
    } else if (values.status === 'publicado' && !values.publishAt && !(existing?.publishAt)) {
      values.publishAt = new Date();
    } else if (values.status === 'publicado' && !values.publishAt && existing?.publishAt) {
      values.publishAt = existing.publishAt;
    }
    values.featured = Number(values.featured ?? existing?.featured ?? 0);
    if (!values.authorName) values.authorName = existing?.authorName ?? user.name;
  }
  if (ent.key === 'campanhas' && !canPublish) values.published = existing?.published ?? false;
  if (ent.key === 'unidades') {
    const lat = values.lat as number | null, lng = values.lng as number | null;
    if ((lat == null) !== (lng == null)) fieldErrors.lat = 'Informe latitude e longitude juntas.';
    else if (lat != null && lng != null && !coordsInUbatuba(lat, lng)) fieldErrors.lat = 'Coordenadas fora da região de Ubatuba. Confira o sinal (negativo) e as casas decimais.';
    if (values.coordsVerified && (lat == null || lng == null)) fieldErrors.coordsVerified = 'Para marcar como verificadas, informe latitude e longitude.';
  }
  if (ent.key === 'organograma' && id && values.parentId) {
    const all = await db.select().from(orgUnits);
    let cur: number | null = values.parentId as number;
    const seen = new Set<number>();
    while (cur && !seen.has(cur)) {
      if (cur === id) { fieldErrors.parentId = 'Um setor não pode ficar abaixo de si mesmo ou de um subsetor seu.'; break; }
      seen.add(cur);
      cur = all.find((o) => o.id === cur)?.parentId ?? null;
    }
  }

  if (Object.keys(fieldErrors).length) return { error: 'Revise os campos destacados.', fieldErrors };

  // imagens únicas (capa/foto)
  const oldMediaToDelete: number[] = [];
  try {
    for (const f of ent.fields.filter((x) => x.type === 'image')) {
      const file = form.get(f.name + '__file');
      const alt = String(form.get(f.name + '__alt') ?? '');
      const prev = existing?.[f.name] as number | null | undefined;
      if (file instanceof File && file.size > 0) {
        values[f.name] = await saveUpload(file, alt);
        if (prev) oldMediaToDelete.push(prev);
      } else if (form.get(f.name + '__remove') === 'on') {
        values[f.name] = null;
        if (prev) oldMediaToDelete.push(prev);
      } else if (prev && alt.trim()) {
        await db.update(media).set({ alt: alt.trim() }).where(eq(media.id, prev));
      }
    }
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }

  if (ent.slugFrom) {
    const base = String(values[ent.slugFrom] ?? existing?.[ent.slugFrom] ?? 'item');
    if (!existing) values.slug = await uniqueSlug(ent, base);
  }
  if ('updatedAt' in t) values.updatedAt = new Date();

  let savedId = id;
  if (id) await db.update(t).set(values).where(eq(t.id, id));
  else savedId = (await db.insert(t).values(values).returning({ id: t.id }))[0].id;

  // relações: serviços da unidade
  if (ent.key === 'unidades' && savedId) {
    const ids = form.getAll('services').map(Number).filter(Number.isInteger);
    await db.delete(unitServices).where(eq(unitServices.unitId, savedId));
    if (ids.length) await db.insert(unitServices).values(ids.map((serviceId) => ({ unitId: savedId!, serviceId })));
  }
  // galeria e anexos da notícia
  if (ent.key === 'noticias' && savedId) {
    try {
      const removeIds = form.getAll('remove_media').map(Number).filter(Number.isInteger);
      if (removeIds.length) {
        const own = await db.select().from(postMedia).where(and(eq(postMedia.postId, savedId), inArray(postMedia.mediaId, removeIds)));
        for (const o of own) { await db.delete(postMedia).where(eq(postMedia.id, o.id)); await deleteMedia(o.mediaId); }
      }
      const alts = String(form.get('gallery__alts') ?? '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const gallery = form.getAll('gallery__files').filter((f): f is File => f instanceof File && f.size > 0);
      for (const [i, file] of gallery.entries()) {
        const mid = await saveUpload(file, alts[i] ?? '');
        await db.insert(postMedia).values({ postId: savedId, mediaId: mid, role: 'gallery', sortOrder: i });
      }
      const attNames = String(form.get('attachments__names') ?? '').split(/\r?\n/).map((s) => s.trim());
      const atts = form.getAll('attachments__files').filter((f): f is File => f instanceof File && f.size > 0);
      for (const [i, file] of atts.entries()) {
        const mid = await saveUpload(file, attNames[i] || file.name);
        await db.insert(postMedia).values({ postId: savedId, mediaId: mid, role: 'attachment', sortOrder: i });
      }
    } catch (e) {
      if (e instanceof UploadError) return { error: `A notícia foi salva, mas houve um problema nos anexos: ${e.message}` };
      throw e;
    }
  }
  for (const m of oldMediaToDelete) await deleteMedia(m);

  // log
  const label = String(values[ent.nameField] ?? existing?.[ent.nameField] ?? '').slice(0, 120);
  if (ent.key === 'noticias' || ent.key === 'campanhas') {
    const wasLive = ent.key === 'noticias' ? existing?.status === 'publicado' : existing?.published;
    const isLive = ent.key === 'noticias' ? values.status === 'publicado' : values.published;
    if (isLive && !wasLive) await audit(user, 'publicar', ent.entityName, savedId, label);
    else if (!isLive && wasLive) await audit(user, 'despublicar', ent.entityName, savedId, label);
    else await audit(user, id ? 'editar' : 'criar', ent.entityName, savedId, label);
  } else await audit(user, id ? 'editar' : 'criar', ent.entityName, savedId, label);

  bust(ent);
  redirect(`/admin/${ent.key}?salvo=1`);
}

export async function deleteEntity(key: string, id: number): Promise<{ error?: string }> {
  const ent = getEntity(key);
  if (!ent) return { error: 'Cadastro desconhecido.' };
  const user = await requirePermission(ent.delete);
  const t = ent.table as AnyTable;
  const [row] = await db.select().from(t).where(eq(t.id, id)).limit(1);
  if (!row) return { error: 'Registro não encontrado.' };
  if (ent.key === 'organograma') {
    const kids = await db.select({ id: orgUnits.id }).from(orgUnits).where(eq(orgUnits.parentId, id)).limit(1);
    if (kids.length) return { error: 'Este setor tem subsetores. Mova ou exclua os subsetores antes.' };
  }
  if (ent.key === 'noticias') {
    const pm = await db.select().from(postMedia).where(eq(postMedia.postId, id));
    await db.delete(postMedia).where(eq(postMedia.postId, id));
    for (const m of pm) await deleteMedia(m.mediaId);
  }
  await db.delete(t).where(eq(t.id, id));
  for (const f of ent.fields.filter((x) => x.type === 'image')) if (row[f.name]) await deleteMedia(row[f.name]);
  await audit(user, 'excluir', ent.entityName, id, String(row[ent.nameField] ?? '').slice(0, 120));
  bust(ent);
  return {};
}
