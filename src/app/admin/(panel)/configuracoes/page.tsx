import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { requirePermission } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { SettingsForm } from '@/components/admin/SettingsForm';

export const metadata = { title: 'Configurações' };

export default async function Page() {
  await requirePermission('settings.write');
  const [s, images] = await Promise.all([getSettings(), db.select({ id: media.id, alt: media.alt, originalName: media.originalName }).from(media).where(eq(media.kind, 'image'))]);
  return (<><h1>Configurações institucionais</h1><SettingsForm values={s} images={images} /></>);
}
