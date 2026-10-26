'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ds';

const KEY = 'su_a11y';
type Prefs = { scale: number; contrast: boolean };

function apply(p: Prefs) {
  document.documentElement.style.setProperty('--font-scale', String(p.scale));
  if (p.contrast) document.documentElement.dataset.contrast = 'high';
  else delete document.documentElement.dataset.contrast;
}

export function A11yTools() {
  const [p, setP] = useState<Prefs>({ scale: 1, contrast: false });
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
      if (raw) { const v = { scale: Math.min(1.4, Math.max(0.85, Number(raw.scale) || 1)), contrast: !!raw.contrast }; setP(v); apply(v); }
    } catch {}
  }, []);
  const set = (v: Prefs) => { setP(v); apply(v); try { localStorage.setItem(KEY, JSON.stringify(v)); } catch {} };
  return (
    <>
      <Link href="/acessibilidade"><Icon name="accessibility" size="sm" />Acessibilidade</Link>
      <span className="su-row" style={{ gap: 4 }} role="group" aria-label="Tamanho do texto">
        <button type="button" aria-label="Diminuir texto" onClick={() => set({ ...p, scale: Math.max(0.85, +(p.scale - 0.1).toFixed(2)) })}>A−</button>
        <button type="button" aria-label="Aumentar texto" onClick={() => set({ ...p, scale: Math.min(1.4, +(p.scale + 0.1).toFixed(2)) })}>A+</button>
      </span>
      <button type="button" aria-pressed={p.contrast} onClick={() => set({ ...p, contrast: !p.contrast })}><Icon name="contrast" size="sm" />Alto contraste</button>
    </>
  );
}
