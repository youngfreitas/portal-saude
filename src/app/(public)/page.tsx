import Link from 'next/link';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { campaigns, posts, socialPosts, socialProfiles, units } from '@/db/schema';
import { Alert, Button, Card, Icon, Input, Media, SectionHeader, ServiceLink } from '@/components/ds';
import { PostCard, CampaignCard } from '@/components/site/Cards';
import { getSettings } from '@/lib/settings';
import { imageSrc, imageSrcSet } from '@/lib/media';
import { livePostsCondition } from '@/lib/publishing';
import { listLivePosts } from '@/lib/queries';
import { count } from 'drizzle-orm';

const QUICK = [
  { icon: 'map-pin', title: 'Unidades de saúde', description: 'Endereços, horários e mapa', href: '/unidades' },
  { icon: 'stethoscope', title: 'Serviços', description: 'O que a rede municipal oferece', href: '/servicos' },
  { icon: 'syringe', title: 'Vacinação', description: 'Calendário e campanhas', href: '/servicos/vacinacao' },
  { icon: 'newspaper', title: 'Notícias e comunicados', description: 'Informes oficiais da Secretaria', href: '/noticias' },
  { icon: 'megaphone', title: 'Campanhas', description: 'Mobilizações de saúde em andamento', href: '/campanhas' },
  { icon: 'phone', title: 'Contatos e Ouvidoria', description: 'Fale com a Secretaria', href: '/contatos' },
];

export default async function Home() {
  const s = await getSettings();
  const [notices, recent, activeCampaigns, profiles, social, [{ nUnits }]] = await Promise.all([
    db.select().from(posts).where(and(livePostsCondition(), eq(posts.isNotice, true))).orderBy(desc(posts.featured), desc(posts.publishAt)).limit(4),
    listLivePosts({ pageSize: 4, notice: false }),
    db.select().from(campaigns).where(and(eq(campaigns.published, true), eq(campaigns.status, 'ativa'))).orderBy(desc(campaigns.startsOn)).limit(3),
    db.select().from(socialProfiles),
    db.select().from(socialPosts).orderBy(desc(socialPosts.createdAt)).limit(3),
    db.select({ nUnits: count() }).from(units).where(eq(units.active, true)),
  ]);
  const heroId = Number(s.hero_image_id) || null;
  const heroSrc = imageSrc(heroId, 1600);

  return (
    <>
      <section className={`su-hero${heroSrc ? ' su-hero--image' : ''}`} style={heroSrc ? { backgroundImage: `url(${heroSrc})` } : undefined}>
        {heroSrc && <div className="su-hero__shade" />}
        <div className="su-container su-hero__in">
          <div>
            <div className="su-overline">Secretaria Municipal de Saúde</div>
            <h1>{s.hero_title || 'Saúde pública em Ubatuba, perto de você'}</h1>
            <p className="su-hero__lead">{s.hero_text || 'Encontre unidades de saúde, serviços, campanhas e comunicados oficiais da Secretaria Municipal de Saúde.'}</p>
            <div className="su-hero__cta">
              <Button variant="inverse" size="lg" href="/unidades"><Icon name="map-pin" size="sm" />Encontrar unidade</Button>
              <Button variant="outline-inverse" size="lg" href="/servicos">Ver serviços</Button>
            </div>
          </div>
          <Card style={{ borderRadius: 'var(--radius-xl)' }}>
            <form action="/busca" role="search">
              <div className="su-overline">Busca rápida</div>
              <h2 style={{ font: 'var(--text-h3)', margin: 'var(--space-2) 0 var(--space-4)' }}>O que você procura?</h2>
              <label htmlFor="busca-hero" className="su-sr-only">Buscar no portal</label>
              <Input id="busca-hero" name="q" placeholder="Unidade, serviço, notícia…" icon={<Icon name="search" size="sm" />} />
              <Button type="submit" fullWidth className="" >Buscar</Button>
            </form>
            <p className="su-muted" style={{ fontSize: 'var(--fs-caption)', margin: 'var(--space-3) 0 0' }}>Emergência: ligue para o SAMU <strong>192</strong>.</p>
          </Card>
        </div>
      </section>

      {notices.length > 0 && (
        <section className="su-container" style={{ paddingTop: 'var(--space-8)' }} aria-label="Comunicados">
          {notices.map((n) => (
            <Alert key={n.id} className="su-notice" tone={n.featured >= 2 ? 'danger' : n.featured === 1 ? 'warning' : 'info'} icon={<Icon name={n.featured >= 2 ? 'triangle-alert' : 'megaphone'} />} title={n.title}>
              {n.subtitle ? <>{n.subtitle} </> : null}<Link href={`/noticias/${n.slug}`}>Leia o comunicado</Link>
            </Alert>
          ))}
        </section>
      )}

      <section className="su-container su-section" aria-labelledby="h-acessos">
        <SectionHeader kicker="Acesso rápido" title="O que você precisa hoje" />
        <h2 id="h-acessos" className="su-sr-only">Acessos rápidos</h2>
        <div className="su-grid su-grid-3">
          {QUICK.map((q) => <ServiceLink key={q.href} icon={<Icon name={q.icon} size="lg" />} title={q.title} description={q.description} href={q.href} />)}
        </div>
      </section>

      <section className="su-container su-section">
        <SectionHeader kicker="Notícias" title="Da Secretaria de Saúde" action={<Button variant="secondary" size="sm" href="/noticias">Ver todas as notícias</Button>} />
        {recent.rows.length ? (
          <div className="su-grid su-grid-2">{recent.rows.map((p) => <PostCard key={p.id} post={p} />)}</div>
        ) : (
          <Card><p style={{ margin: 0 }}>Ainda não há notícias publicadas. Os informes oficiais da Secretaria aparecerão aqui.</p></Card>
        )}
      </section>

      {activeCampaigns.length > 0 && (
        <section className="su-container su-section">
          <SectionHeader kicker="Campanhas" title="Campanhas em andamento" action={<Button variant="secondary" size="sm" href="/campanhas">Ver todas</Button>} />
          <div className="su-grid su-grid-3">{activeCampaigns.map((c) => <CampaignCard key={c.id} c={c} />)}</div>
        </section>
      )}

      <section className="su-container su-section">
        <SectionHeader kicker="Redes sociais" title="Acompanhe a Secretaria" action={<Button variant="secondary" size="sm" href="/redes-sociais">Ver redes sociais</Button>} />
        {profiles.length || social.length ? (
          <div className="su-grid su-grid-3">
            {profiles.map((p) => (
              <ServiceLink key={p.id} icon={<Icon name={p.network === 'youtube' ? 'youtube' : p.network === 'facebook' ? 'facebook' : 'instagram'} size="lg" />} title={p.label} description={`Abrir no ${p.network === 'youtube' ? 'YouTube' : p.network === 'facebook' ? 'Facebook' : 'Instagram'}`} href={p.url} />
            ))}
          </div>
        ) : (
          <Card><p style={{ margin: 0 }}>Os perfis oficiais da Secretaria nas redes sociais serão divulgados aqui após confirmação oficial.</p></Card>
        )}
      </section>

      <section className="su-container su-section">
        <Card accent="accent">
          <div className="su-cta">
            <div>
              <div className="su-overline">A Secretaria</div>
              <h2 style={{ margin: 'var(--space-2) 0 var(--space-3)' }}>Conheça a estrutura da Secretaria de Saúde</h2>
              <p style={{ margin: 0, maxWidth: '62ch' }}>{s.about_text || 'Veja como a Secretaria Municipal de Saúde está organizada, quais são seus departamentos e quem responde por cada área.'}</p>
            </div>
            <div className="su-row"><Button href="/secretaria/organograma"><Icon name="network" size="sm" />Ver organograma</Button><Button variant="secondary" href="/secretaria">Sobre a Secretaria</Button></div>
          </div>
        </Card>
      </section>
    </>
  );
}
