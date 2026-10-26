import { z } from 'zod';
import { db } from '@/db';
import { consentRecords } from '@/db/schema';
import { CONSENT_VERSION } from '@/lib/consent';

const schema = z.object({ performance: z.boolean(), thirdParty: z.boolean() });

// Registra apenas a escolha e a versão do texto — sem IP, sem identificador.
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false }, { status: 400 });
  await db.insert(consentRecords).values({ version: CONSENT_VERSION, performance: parsed.data.performance, thirdParty: parsed.data.thirdParty });
  return Response.json({ ok: true });
}
