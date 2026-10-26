'use server';
import { revalidatePath } from 'next/cache';
import { sql } from 'drizzle-orm';
import { db } from '@/db';
import { media, settings } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { SETTING_FIELDS } from '@/lib/settings-fields';
import { eq } from 'drizzle-orm';

export type SettingsState = { error?: string; ok?: boolean };

export async function saveSettings(_p: SettingsState, form: FormData): Promise<SettingsState> {
  const user = await requirePermission('settings.write');
  const rows: { key: string; value: string }[] = [];
  for (const f of SETTING_FIELDS) {
    const v = String(form.get(f.key) ?? '').trim();
    if (v.length > 4000) return { error: `“${f.label}” é longo demais.` };
    if (f.key.endsWith('_url') && v && !/^https?:\/\/\S+$/i.test(v)) return { error: `“${f.label}” deve começar com http:// ou https://.` };
    if (f.key === 'lgpd_dpo_email' && v && !/^\S+@\S+\.\S+$/.test(v)) return { error: 'E-mail do encarregado inválido.' };
    if (f.key === 'hero_image_id' && v) {
      const [m] = await db.select().from(media).where(eq(media.id, Number(v)));
      if (!m || m.kind !== 'image') return { error: 'A imagem escolhida para a página inicial não existe.' };
    }
    rows.push({ key: f.key, value: v });
  }
  await db.insert(settings).values(rows).onConflictDoUpdate({ target: settings.key, set: { value: sql`excluded.value`, updatedAt: new Date() } });
  await audit(user, 'editar', 'configuracoes', null, 'Configurações institucionais');
  revalidatePath('/', 'layout');
  return { ok: true };
}
