import 'server-only';
import { randomUUID } from 'node:crypto';
import sharp, { type Metadata as SharpMeta } from 'sharp';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { storage } from './storage';

export const IMAGE_WIDTHS = [480, 960, 1600] as const;
const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_FILE = 15 * 1024 * 1024;

export class UploadError extends Error {}

export async function saveUpload(file: File, alt: string | null): Promise<number> {
  const buf = Buffer.from(await file.arrayBuffer());
  const id = randomUUID();
  if (IMAGE_MIMES.includes(file.type)) {
    if (buf.length > MAX_IMAGE) throw new UploadError('A imagem deve ter até 8 MB.');
    if (!alt?.trim()) throw new UploadError('Informe o texto alternativo da imagem.');
    let meta: SharpMeta;
    try {
      meta = await sharp(buf).metadata();
    } catch {
      throw new UploadError('Arquivo de imagem inválido.');
    }
    for (const w of IMAGE_WIDTHS) {
      const out = await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
      await storage.put(`images/${id}-${w}.webp`, out);
    }
    const [row] = await db
      .insert(media)
      .values({
        kind: 'image', originalName: file.name.slice(0, 255), storageKey: `images/${id}`, mime: 'image/webp',
        size: buf.length, width: meta.width ?? null, height: meta.height ?? null, alt: alt.trim().slice(0, 300),
      })
      .returning({ id: media.id });
    return row.id;
  }
  if (file.type === 'application/pdf' && buf.subarray(0, 4).toString() === '%PDF') {
    if (buf.length > MAX_FILE) throw new UploadError('O PDF deve ter até 15 MB.');
    const key = `files/${id}.pdf`;
    await storage.put(key, buf);
    const [row] = await db
      .insert(media)
      .values({ kind: 'file', originalName: file.name.slice(0, 255), storageKey: key, mime: 'application/pdf', size: buf.length, alt: alt?.trim() || null })
      .returning({ id: media.id });
    return row.id;
  }
  throw new UploadError('Formato não aceito. Envie JPG, PNG, WebP ou PDF.');
}

export async function deleteMedia(id: number) {
  const [m] = await db.select().from(media).where(eq(media.id, id)).limit(1);
  if (!m) return;
  if (m.kind === 'image') for (const w of IMAGE_WIDTHS) await storage.remove(`${m.storageKey}-${w}.webp`);
  else await storage.remove(m.storageKey);
  await db.delete(media).where(eq(media.id, id));
}

export function imageSrc(id: number | null | undefined, w: (typeof IMAGE_WIDTHS)[number] = 960): string | null {
  return id ? `/media/${id}?w=${w}` : null;
}
export function imageSrcSet(id: number): string {
  return IMAGE_WIDTHS.map((w) => `/media/${id}?w=${w} ${w}w`).join(', ');
}
