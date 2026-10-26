import type { Metadata } from 'next';
import { asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { socialPosts, socialProfiles } from '@/db/schema';
import { Card, Icon, Media, PageHead, ServiceLink } from '@/components/ds';
import { imageSrc } from '@/lib/media';
import { formatDate } from '@/lib/format';
import { safeHttpUrl } from '@/lib/sanitize';

export const metadata: Metadata = { title: 'Redes sociais', description: 'Perfis oficiais da Secretaria Municipal de Saúde de Ubatuba nas redes sociais.' };
const NAME: Record<string, string> = { instagram: 'Instagram', facebook: 'Facebook', youtube: 'YouTube' };

export default async function Page() {
  const [profiles, posts] = await Promise.all([db.select().from(socialProfiles).orderBy(asc(socialProfiles.sortOrder)), db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt)).limit(12)]);
  return (
    <>
      <PageHead title="Redes sociais" trail={[{ label: 'Início', href: '/' }, { label: 'Redes sociais' }]} lead="Acompanhe os perfis oficiais da Secretaria de Saúde." />
      <div className="su-container su-stack" style={{ paddingTop: 'var(--space-8)' }}>
        {profiles.length ? (
          <div className="su-grid su-grid-3">{profiles.map((p) => <ServiceLink key={p.id} href={p.url} icon={<Icon name={p.network} size="lg" />} title={p.label} description={`Abrir no ${NAME[p.network] ?? p.network}`} />)}</div>
        ) : <Card><p style={{ margin: 0 }}>Os perfis oficiais serão divulgados aqui após confirmação.</p></Card>}
        {posts.length > 0 && (
          <section>
            <h2 style={{ marginBottom: 'var(--space-4)' }}>Publicações recentes</h2>
            <div className="su-grid su-grid-3">
              {posts.map((p) => { const u = safeHttpUrl(p.url); return (
                <Card key={p.id} as="article" flush interactive>
                  <Media src={imageSrc(p.imageId, 480)} alt="" ratio="square" />
                  <div className="su-card__body">
                    <p style={{ margin: 0, fontSize: 'var(--fs-body-sm)' }}>{(p.caption ?? '').slice(0, 140)}</p>
                    <p className="su-muted" style={{ fontSize: 'var(--fs-caption)', margin: 'var(--space-2) 0 0' }}>{NAME[p.network]} · {formatDate(p.postedOn)}</p>
                    {u && <a className="su-card__link" href={u} target="_blank" rel="noopener noreferrer">Ver publicação<span className="su-sr-only"> (abre em nova aba)</span></a>}
                  </div>
                </Card>
              ); })}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
