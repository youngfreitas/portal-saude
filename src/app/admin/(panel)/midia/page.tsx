import { desc } from 'drizzle-orm';
import { db } from '@/db';
import { media } from '@/db/schema';
import { Badge, Card, Media } from '@/components/ds';
import { requirePermission } from '@/lib/auth';
import { can } from '@/lib/permissions';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { removeMedia } from './actions';
import { UploadForm } from '@/components/admin/UploadForm';

export const metadata = { title: 'Biblioteca de mídia' };

export default async function Page() {
  const user = await requirePermission('content.view');
  const list = await db.select().from(media).orderBy(desc(media.id)).limit(200);
  return (
    <>
      <h1>Biblioteca de mídia</h1>
      {can(user.role, 'news.write') && <Card style={{ marginBottom: 'var(--space-6)' }}><h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Enviar arquivo</h2><UploadForm /></Card>}
      <div className="su-grid su-grid-4">
        {list.map((m) => (
          <Card key={m.id} flush>
            {m.kind === 'image' ? <Media src={`/media/${m.id}?w=480`} alt={m.alt ?? ''} /> : <Media />}
            <div className="su-card__body">
              <Badge tone="brand">#{m.id} · {m.kind === 'image' ? 'Imagem' : 'PDF'}</Badge>
              <p style={{ margin: 'var(--space-2) 0', fontSize: 'var(--fs-caption)', wordBreak: 'break-word' }}>{m.alt || m.originalName}</p>
              {m.kind === 'file' && <p className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>Link: <code>/media/{m.id}</code></p>}
              {can(user.role, 'catalog.delete') && <DeleteButton name={m.originalName} onDelete={removeMedia.bind(null, m.id)} />}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
