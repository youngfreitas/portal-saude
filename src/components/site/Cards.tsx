import Link from 'next/link';
import { Badge, Button, Card, Icon, Media, PendingInfo } from '@/components/ds';
import { imageSrc, imageSrcSet } from '@/lib/media';
import { formatDate, formatPeriod, telHref } from '@/lib/format';
import { excerpt } from '@/lib/sanitize';
import type { InferSelectModel } from 'drizzle-orm';
import type { posts, units, campaigns } from '@/db/schema';

type Post = InferSelectModel<typeof posts>;
type Unit = InferSelectModel<typeof units>;
type Campaign = InferSelectModel<typeof campaigns>;

export function PostCard({ post, showImage = true }: { post: Post; showImage?: boolean }) {
  const date = post.publishAt ?? post.createdAt;
  return (
    <Card as="article" interactive className="su-news">
      {showImage && <Media src={imageSrc(post.coverId, 480)} srcSet={post.coverId ? imageSrcSet(post.coverId) : undefined} alt="" />}
      <div>
        <div className="su-news__meta">
          <Badge tone={post.isNotice ? 'warning' : 'brand'}>{post.isNotice ? 'Comunicado' : post.category}</Badge>
          <span className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>{formatDate(date)}</span>
        </div>
        <h3><Link href={`/noticias/${post.slug}`} className="su-card__link" style={{ color: 'var(--text-strong)' }}>{post.title}</Link></h3>
        {(post.subtitle || post.body) && <p>{post.subtitle || excerpt(post.body, 140)}</p>}
      </div>
    </Card>
  );
}

export function UnitCard({ unit, category, services = [] }: { unit: Unit; category?: string | null; services?: { name: string }[] }) {
  return (
    <Card as="article" interactive className="su-unit">
      <div className="su-row su-between" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
        <div>
          <h3><Link href={`/unidades/${unit.slug}`} className="su-card__link" style={{ color: 'var(--text-strong)' }}>{unit.name}</Link></h3>
          <div className="su-muted" style={{ fontSize: 'var(--fs-caption)', marginTop: 2 }}>{[unit.neighborhood, category].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
      <div className="su-unit__facts">
        <span><Icon name="map-pin" size="sm" />{unit.address || <PendingInfo />}</span>
        <span><Icon name="clock" size="sm" />{unit.hours || <PendingInfo />}</span>
        <span><Icon name="phone" size="sm" />{unit.phone || <PendingInfo />}</span>
      </div>
      {services.length > 0 && <div className="su-row" style={{ gap: 'var(--space-2)' }}>{services.slice(0, 4).map((s) => <Badge key={s.name}>{s.name}</Badge>)}</div>}
    </Card>
  );
}

export function CampaignCard({ c }: { c: Campaign }) {
  const tone = c.status === 'ativa' ? 'success' : c.status === 'planejada' ? 'info' : 'neutral';
  const label = c.status === 'ativa' ? 'Em andamento' : c.status === 'planejada' ? 'Programada' : 'Encerrada';
  return (
    <Card as="article" flush interactive>
      <div style={{ height: 132, background: 'var(--gradient-pmu)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {c.coverId
          ? // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc(c.coverId, 960)!} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : // eslint-disable-next-line @next/next/no-img-element
            <img src="/assets/brasao-ubatuba.png" alt="" style={{ height: 88, opacity: 0.92 }} />}
      </div>
      <div className="su-card__body">
        <div className="su-row" style={{ marginBottom: 'var(--space-2)' }}>
          <Badge tone={tone} dot>{label}</Badge>
          <span className="su-muted" style={{ fontSize: 'var(--fs-caption)' }}>{formatPeriod(c.startsOn, c.endsOn)}</span>
        </div>
        <h3><Link href={`/campanhas/${c.slug}`} className="su-card__link" style={{ color: 'var(--text-strong)' }}>{c.title}</Link></h3>
        {c.summary && <p className="su-muted" style={{ margin: 'var(--space-2) 0 0' }}>{c.summary}</p>}
      </div>
    </Card>
  );
}

export { telHref, Button };
