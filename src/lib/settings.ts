import 'server-only';
import { cache } from 'react';
import { db } from '@/db';
import { settings } from '@/db/schema';
import { SETTING_FIELDS, type Settings } from './settings-fields';

export { SETTING_FIELDS, type Settings };


export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await db.select().from(settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const out = {} as Settings;
  for (const f of SETTING_FIELDS) out[f.key] = map[f.key] ?? '';
  return out;
});
