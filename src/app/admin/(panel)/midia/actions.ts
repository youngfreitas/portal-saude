'use server';
import { revalidatePath } from 'next/cache';
import { requirePermission } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { deleteMedia, saveUpload, UploadError } from '@/lib/media';

export type MediaState = { error?: string; ok?: boolean };

export async function uploadMedia(_p: MediaState, form: FormData): Promise<MediaState> {
  const u = await requirePermission('news.write');
  const file = form.get('file');
  if (!(file instanceof File) || !file.size) return { error: 'Escolha um arquivo.' };
  try {
    const id = await saveUpload(file, String(form.get('alt') ?? ''));
    await audit(u, 'criar', 'midia', id, file.name);
  } catch (e) {
    if (e instanceof UploadError) return { error: e.message };
    throw e;
  }
  revalidatePath('/admin/midia');
  return { ok: true };
}
export async function removeMedia(id: number): Promise<{ error?: string }> {
  const u = await requirePermission('catalog.delete');
  await deleteMedia(id);
  await audit(u, 'excluir', 'midia', id);
  revalidatePath('/admin/midia');
  return {};
}
