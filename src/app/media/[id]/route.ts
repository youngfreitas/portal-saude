import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { storage } from '@/lib/storage';
import { IMAGE_WIDTHS } from '@/lib/media';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mid = Number(id);
  if (!Number.isInteger(mid)) return new Response('Not found', { status: 404 });
  const [m] = await db.select().from(media).where(eq(media.id, mid)).limit(1);
  if (!m) return new Response('Not found', { status: 404 });

  const headers = { 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' };
  if (m.kind === 'image') {
    const wanted = Number(new URL(req.url).searchParams.get('w')) || 960;
    const w = IMAGE_WIDTHS.find((x) => x >= wanted) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
    const data = await storage.get(`${m.storageKey}-${w}.webp`);
    if (!data) return new Response('Not found', { status: 404 });
    return new Response(new Uint8Array(data), { headers: { ...headers, 'Content-Type': 'image/webp' } });
  }
  const data = await storage.get(m.storageKey);
  if (!data) return new Response('Not found', { status: 404 });
  const name = m.originalName.replace(/[^\w.\- ]/g, '_');
  return new Response(new Uint8Array(data), {
    headers: { ...headers, 'Content-Type': m.mime, 'Content-Disposition': `inline; filename="${name}"` },
  });
}
