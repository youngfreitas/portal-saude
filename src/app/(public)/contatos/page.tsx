import type { Metadata } from 'next';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { contactChannels } from '@/db/schema';
import { Card, DescriptionList, Icon, PageHead, PendingInfo, ValueOrPending } from '@/components/ds';
import { ContactForm } from '@/components/site/ContactForm';
import { getSettings } from '@/lib/settings';
import { telHref } from '@/lib/format';
import { safeHttpUrl } from '@/lib/sanitize';

export const metadata: Metadata = { title: 'Contatos', description: 'Telefones, e-mail, endereço, Ouvidoria e formulário de contato da Secretaria Municipal de Saúde de Ubatuba.' };

export default async function Page() {
  const [s, channels] = await Promise.all([getSettings(), db.select().from(contactChannels).orderBy(asc(contactChannels.sortOrder), asc(contactChannels.id))]);
  return (
    <>
      <PageHead title="Contatos" trail={[{ label: 'Início', href: '/' }, { label: 'Contatos' }]} lead="Fale com a Secretaria Municipal de Saúde. Em emergências, ligue para o SAMU 192." />
      <div className="su-container su-layout-aside" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="su-stack">
          <Card>
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-4)' }}>Secretaria Municipal de Saúde</h2>
            <DescriptionList items={[
              { term: 'Endereço', detail: <ValueOrPending value={s.headquarters_address} /> },
              { term: 'Telefone', detail: s.main_phone ? <a href={telHref(s.main_phone)}>{s.main_phone}</a> : <PendingInfo /> },
              { term: 'E-mail', detail: s.main_email ? <a href={`mailto:${s.main_email}`}>{s.main_email}</a> : <PendingInfo /> },
              { term: 'Atendimento', detail: <ValueOrPending value={s.opening_hours} /> },
            ]} />
          </Card>
          <section id="ouvidoria" aria-labelledby="h-canais">
            <h2 id="h-canais" style={{ marginBottom: 'var(--space-4)' }}>Canais de atendimento</h2>
            <div className="su-grid su-grid-2">
              {channels.map((c) => {
                const url = safeHttpUrl(c.url);
                return (
                  <Card key={c.id} as="article" accent="brand">
                    <h3 style={{ font: 'var(--text-h4)' }}>{c.name}</h3>
                    {c.description && <p className="su-muted" style={{ fontSize: 'var(--fs-body-sm)' }}>{c.description}</p>}
                    <div className="su-unit__facts">
                      {c.phone && <span><Icon name="phone" size="sm" /><a href={telHref(c.phone)}>{c.phone}</a></span>}
                      {c.email && <span><Icon name="mail" size="sm" /><a href={`mailto:${c.email}`}>{c.email}</a></span>}
                      {url && <span><Icon name="external-link" size="sm" /><a href={url} target="_blank" rel="noopener noreferrer">Acessar canal</a></span>}
                      {c.hours && <span><Icon name="clock" size="sm" />{c.hours}</span>}
                      {!c.phone && !c.email && !url && <PendingInfo />}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        </div>
        <aside>
          <Card accent="accent">
            <h2 style={{ font: 'var(--text-h3)', marginBottom: 'var(--space-4)' }}>Envie uma mensagem</h2>
            <ContactForm />
          </Card>
        </aside>
      </div>
    </>
  );
}
