'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '@/components/ds';
import { CHANGE_EVENT, OPEN_EVENT, readConsent } from './CookieManager';

/** Bloqueia conteúdo de terceiros (YouTube, Instagram, Facebook) até haver consentimento. */
export function ConsentGate({ children, what = 'conteúdo externo', href }: { children: ReactNode; what?: string; href?: string }) {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const sync = () => setOk(!!readConsent()?.thirdParty);
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);
  if (ok) return <>{children}</>;
  return (
    <div className="su-consent-gate">
      <p><strong>Este {what} é de um serviço externo.</strong><br />Para exibi-lo é preciso permitir cookies de conteúdo de terceiros.</p>
      <div className="su-row" style={{ justifyContent: 'center' }}>
        <Button size="sm" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>Alterar preferências de cookies</Button>
        {href && <Button size="sm" variant="secondary" external href={href}>Abrir no site de origem</Button>}
      </div>
    </div>
  );
}

export function CookiePrefsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      style={{ all: 'unset', cursor: 'pointer', font: 'var(--text-caption)', padding: '4px 0', textDecoration: 'none' }}>
      Preferências de cookies
    </button>
  );
}
