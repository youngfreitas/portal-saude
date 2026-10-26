import Link from 'next/link';
import { Brandmark } from '@/components/ds';
import { CookiePrefsButton } from '@/components/consent/ConsentGate';
import type { Settings } from '@/lib/settings-fields';
import { PENDING_TEXT } from '@/lib/pending';

export function Footer({ s, socials }: { s: Settings; socials: { network: string; label: string; url: string }[] }) {
  return (
    <footer className="su-footer">
      <div className="su-container su-footer__grid">
        <div>
          <Brandmark tone="light" size={46} />
          <p>
            {s.headquarters_address || PENDING_TEXT}<br />
            {s.opening_hours && <>{s.opening_hours}<br /></>}
            {s.main_phone && <a href={`tel:${s.main_phone.replace(/\D/g, '')}`}>{s.main_phone}</a>}
            {s.main_phone && s.main_email && ' · '}
            {s.main_email && <a href={`mailto:${s.main_email}`}>{s.main_email}</a>}
          </p>
        </div>
        <div>
          <h2>Acesso rápido</h2>
          <ul>
            <li><Link href="/unidades">Unidades de saúde</Link></li>
            <li><Link href="/servicos">Serviços</Link></li>
            <li><Link href="/servicos/vacinacao">Vacinação</Link></li>
            <li><Link href="/noticias">Notícias e comunicados</Link></li>
            <li><Link href="/campanhas">Campanhas</Link></li>
          </ul>
        </div>
        <div>
          <h2>A Secretaria</h2>
          <ul>
            <li><Link href="/secretaria">Sobre a Secretaria</Link></li>
            <li><Link href="/secretaria/organograma">Organograma</Link></li>
            <li><Link href="/secretaria/chefias">Chefias</Link></li>
            <li><Link href="/contatos">Contatos</Link></li>
            <li><Link href="/redes-sociais">Redes sociais</Link></li>
            {socials.map((x) => <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.label}</a></li>)}
          </ul>
        </div>
        <div>
          <h2>Informações legais</h2>
          <ul>
            <li><Link href="/privacidade">Política de Privacidade</Link></li>
            <li><Link href="/termos-de-uso">Termos de Uso</Link></li>
            <li><Link href="/cookies">Política de Cookies</Link></li>
            <li><CookiePrefsButton /></li>
            <li><Link href="/acessibilidade">Acessibilidade</Link></li>
            <li><a href={s.prefeitura_url || 'https://www.ubatuba.sp.gov.br'} target="_blank" rel="noopener noreferrer">ubatuba.sp.gov.br</a></li>
          </ul>
        </div>
      </div>
      <div className="su-footer__legal">
        <div className="su-container">
          <span>© {new Date().getFullYear()} Prefeitura Municipal de Ubatuba — Secretaria Municipal de Saúde. Todos os direitos reservados.</span>
          <span>Em emergências, ligue para o SAMU 192.</span>
        </div>
      </div>
    </footer>
  );
}
