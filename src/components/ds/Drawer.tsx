'use client';
import { useEffect, useRef, type ReactNode } from 'react';
import { Icon } from './Icon';

export function Drawer({ open, onClose, title, side = 'left', children }: { open: boolean; onClose: () => void; title: string; side?: 'left' | 'right'; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="su-drawer-scrim" onClick={onClose} />
      <div ref={ref} className={`su-drawer${side === 'right' ? ' su-drawer--right' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="su-drawer__head">
          <strong style={{ fontFamily: 'var(--font-display)' }}>{title}</strong>
          <button type="button" className="su-btn su-btn--tertiary su-btn--sm" onClick={onClose} aria-label="Fechar menu"><Icon name="x" size="sm" /></button>
        </div>
        {children}
      </div>
    </>
  );
}
