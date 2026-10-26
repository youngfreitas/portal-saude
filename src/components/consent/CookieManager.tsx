'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Dialog, Switch } from '@/components/ds';
import { CONSENT_COOKIE, CONSENT_VERSION, parseConsent, type Consent } from '@/lib/consent';

export const OPEN_EVENT = 'su:open-cookies';
export const CHANGE_EVENT = 'su:consent-changed';

export function readConsent(): Consent | null {
  const m = document.cookie.split('; ').find((c) => c.startsWith(CONSENT_COOKIE + '='));
  return parseConsent(m?.slice(CONSENT_COOKIE.length + 1));
}

export function CookieManager() {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState<Consent | null>(null);
  const [dialog, setDialog] = useState(false);
  const [perf, setPerf] = useState(false);
  const [third, setThird] = useState(false);

  useEffect(() => {
    const c = readConsent();
    setSaved(c);
    setPerf(!!c?.performance);
    setThird(!!c?.thirdParty);
    setReady(true);
    const open = () => setDialog(true);
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

  const save = useCallback(async (performance: boolean, thirdParty: boolean) => {
    const c: Consent = { v: CONSENT_VERSION, performance, thirdParty };
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=31536000; Path=/; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
    setSaved(c); setPerf(performance); setThird(thirdParty); setDialog(false);
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    try {
      await fetch('/api/consent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ performance, thirdParty }) });
    } catch {}
  }, []);

  if (!ready) return null;
  return (
    <>
      {!saved && !dialog && (
        <div className="su-cookie" role="region" aria-label="Aviso de cookies">
          <div className="su-container su-cookie__in">
            <div className="su-cookie__text">
              <strong style={{ fontFamily: 'var(--font-display)' }}>Sua privacidade importa</strong>
              <p>Usamos cookies necessários para o portal funcionar. Os demais só são ativados se você permitir. Veja a <Link href="/cookies">Política de Cookies</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</p>
            </div>
            <div className="su-row">
              <Button variant="secondary" onClick={() => setDialog(true)}>Personalizar</Button>
              <Button variant="secondary" onClick={() => save(false, false)}>Rejeitar não necessários</Button>
              <Button onClick={() => save(true, true)}>Aceitar todos</Button>
            </div>
          </div>
        </div>
      )}
      <Dialog
        open={dialog}
        title="Preferências de cookies"
        description="Escolha quais categorias você permite. Você pode mudar de ideia a qualquer momento pelo rodapé."
        confirmLabel="Salvar preferências"
        cancelLabel="Cancelar"
        onConfirm={() => save(perf, third)}
        onClose={() => setDialog(false)}
      >
        <div className="su-stack" style={{ marginTop: 'var(--space-4)' }}>
          <div><Switch checked disabled label="Necessários" readOnly /><p className="su-muted" style={{ fontSize: 'var(--fs-caption)', margin: '4px 0 0 56px' }}>Mantêm preferências de acessibilidade e registram sua escolha de cookies. Sempre ativos.</p></div>
          <div><Switch checked={perf} onChange={(e) => setPerf(e.target.checked)} label="Desempenho" /><p className="su-muted" style={{ fontSize: 'var(--fs-caption)', margin: '4px 0 0 56px' }}>Medição de uso do portal. Hoje nenhuma ferramenta de estatística está ativa.</p></div>
          <div><Switch checked={third} onChange={(e) => setThird(e.target.checked)} label="Conteúdo de terceiros" /><p className="su-muted" style={{ fontSize: 'var(--fs-caption)', margin: '4px 0 0 56px' }}>Permite incorporar vídeos e publicações do YouTube, Instagram e Facebook, que podem definir cookies próprios.</p></div>
        </div>
      </Dialog>
    </>
  );
}
