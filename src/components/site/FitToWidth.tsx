'use client';
import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** Reduz o conteúdo para caber na largura disponível (somente em telas largas); no celular o layout é vertical e não escala. */
export function FitToWidth({ children, minWidth = 900 }: { children: ReactNode; minWidth?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const o = outer.current, i = inner.current;
    if (!o || !i) return;
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    const apply = () => {
      if (!mq.matches) { i.style.transform = ''; i.style.marginLeft = ''; o.style.height = ''; o.dataset.fit = ''; return; }
      i.style.transform = ''; i.style.marginLeft = '';
      const w = i.scrollWidth, avail = o.clientWidth;
      const k = Math.min(1, avail / w);
      i.style.transformOrigin = 'top left';
      i.style.transform = `scale(${k})`;
      i.style.marginLeft = `${Math.max(0, (avail - w * k) / 2)}px`;
      o.style.height = `${i.offsetHeight * k}px`;
      o.dataset.fit = '1';
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(o);
    mq.addEventListener('change', apply);
    return () => { ro.disconnect(); mq.removeEventListener('change', apply); };
  }, [minWidth]);
  return <div ref={outer} className="orgt-fit"><div ref={inner} className="orgt-fit__in">{children}</div></div>;
}
