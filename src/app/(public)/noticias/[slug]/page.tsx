import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { and, asc, eq, ne, desc } from 'drizzle-orm';
import { db } from '@/db';
import { media, postMedia, posts } from '@/db/schema';
import { Badge, Breadcrumb, Button, Icon, Media, ShareButtons, SectionHeader } from '@/components/ds';
import { PostCard } from '@/components/site/Cards';
import { ConsentGate } from '@/components/consent/ConsentGate';
import { formatDate } from '@/lib/format';
import { imageSrc, imageSrcSet } from '@/lib/media';
import { livePostsCondition } from '@/lib/publishing';
import { excerpt, safeHttpUrl, sanitizeRichText, youtubeEmbedUrl } from '@/lib/sanitize';

const SITE = process.env.SITE_URL ?? 'http://localhost:3000';

async function load(slug: string) {
  const [post] = await db.select().from(posts).where(and(eq(posts.slug, slug), livePostsCondition())).limit(1);
  return post;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await load(slug);
  if (!p) return { title: 'Publicação não encontrada' };
  const img = p.coverId ? imageSrc(p.coverId, 1600)! : '/assets/pmu-social-default.jpeg';
  const desc = p.subtitle || excerpt(p.body, 160);
  return { title: p.title, description: desc, alternates: { canonical: `/noticias/${p.slug}` }, openGraph: { title: p.title, description: desc, type: 'article', images: [img], publishedTime: (p.publishAt ?? p.createdAt).toISOString() } };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await load(slug);
  if (!post) notFound();
  const [cover] = post.coverId ? await db.select().from(media).where(eq(media.id, post.coverId)) : [];
  const att = await db.select({ pm: postMedia, m: media }).from(postMedia).innerJoin(media, eq(media.id, postMedia.mediaId)).where(eq(postMedia.postId, post.id)).orderBy(asc(postMedia.sortOrder));
  const gallery = att.filter((a) => a.pm.role === 'gallery');
  const files = att.filter((a) => a.pm.role === 'attachment');
  const related = await db.select().from(posts).where(and(livePostsCondition(), ne(posts.id, post.id), eq(posts.category, post.category))).orderBy(desc(posts.publishAt)).limit(2);
  const html = sanitizeRichText(post.body);
  const videos = post.videos.map((v) => ({ ...v, embed: youtubeEmbedUrl(v.url) })).filter((v) => v.embed);

  return (
    <div className="su-container" style={{ paddingTop: 'var(--space-6)' }}>
      <Breadcrumb items={[{ label: 'Início', href: '/' }, { label: 'Notícias e Comunicados', href: '/noticias' }, { label: post.title }]} />
      <article style={{ marginTop: 'var(--space-6)', maxWidth: 820 }}>
        <div className="su-row" style={{ marginBottom: 'var(--space-3)' }}>
          <Badge tone={post.isNotice ? 'warning' : 'brand'}>{post.isNotice ? 'Comunicado' : post.category}</Badge>
          <time className="su-muted" dateTime={(post.publishAt ?? post.createdAt).toISOString()}>{formatDate(post.publishAt ?? post.createdAt)}</time>
          {post.sector && <span className="su-muted">· {post.sector}</span>}
        </div>
        <h1>{post.title}</h1>
        {post.subtitle && <p style={{ fontSize: 'var(--fs-body-lg)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>{post.subtitle}</p>}
        {post.authorName && <p className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>Por {post.authorName}</p>}
        {post.coverId && (
          <div className="su-article-cover" style={{ marginTop: 'var(--space-6)' }}>
            <Media src={imageSrc(post.coverId, 1600)} srcSet={imageSrcSet(post.coverId)} alt={cover?.alt ?? ''} ratio="wide" priority />
          </div>
        )}
        <div className="su-prose" style={{ marginTop: 'var(--space-6)' }} dangerouslySetInnerHTML={{ __html: html }} />

        {gallery.length > 0 && (
          <section style={{ marginTop: 'var(--space-8)' }} aria-label="Galeria de imagens">
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Galeria</h2>
            <div className="su-gallery">{gallery.map((g) => <a key={g.m.id} href={imageSrc(g.m.id, 1600)!} target="_blank" rel="noopener noreferrer"><Media src={imageSrc(g.m.id, 480)} alt={g.m.alt ?? ''} /></a>)}</div>
          </section>
        )}
        {videos.length > 0 && (
          <section className="su-videos su-stack" style={{ marginTop: 'var(--space-8)' }} aria-label="Vídeos">
            <h2 style={{ font: 'var(--text-h3)' }}>Vídeos</h2>
            {videos.map((v) => (
              <ConsentGate key={v.url} what="vídeo" href={v.url}>
                <iframe src={v.embed!} title={v.title || 'Vídeo do YouTube'} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
              </ConsentGate>
            ))}
          </section>
        )}
        {(files.length > 0 || post.links.length > 0) && (
          <section style={{ marginTop: 'var(--space-8)' }}>
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-3)' }}>Anexos e links</h2>
            <ul>
              {files.map((f) => <li key={f.m.id}><a href={`/media/${f.m.id}`} target="_blank" rel="noopener noreferrer"><Icon name="file-text" size="sm" /> {f.m.alt || f.m.originalName} (PDF)</a></li>)}
              {post.links.map((l) => { const u = safeHttpUrl(l.url); return u ? <li key={l.url}><a href={u} target="_blank" rel="noopener noreferrer">{l.label || u}</a></li> : null; })}
            </ul>
          </section>
        )}
        <div style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--border-subtle)' }}>
          <ShareButtons url={`${SITE}/noticias/${post.slug}`} title={post.title} />
        </div>
      </article>
      {related.length > 0 && (
        <section className="su-section">
          <SectionHeader kicker="Continue lendo" title="Publicações relacionadas" />
          <div className="su-grid su-grid-2">{related.map((r) => <PostCard key={r.id} post={r} />)}</div>
        </section>
      )}
      <div style={{ marginTop: 'var(--space-8)' }}><Button variant="secondary" href="/noticias"><Icon name="arrow-left" size="sm" />Voltar às notícias</Button></div>
    </div>
  );
}
