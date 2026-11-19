'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button, Icon } from '@/components/ds';

export type OrgNode = { id: number; name: string; kind: string; description: string | null; people: { name: string; role: string }[]; children: OrgNode[] };

const KINDS: Record<string, { label: string; icon: string }> = {
  secretaria: { label: 'Secretaria', icon: 'landmark' },
  gabinete: { label: 'Gabinete', icon: 'briefcase' },
  colegiado: { label: 'Colegiado', icon: 'users' },
  departamento: { label: 'Departamento', icon: 'building-2' },
  setor: { label: 'Setor', icon: 'layers' },
};
const kindOf = (k: string) => KINDS[k] ?? KINDS.setor;

function collectIds(n: OrgNode, acc: number[] = []) { acc.push(n.id); n.children.forEach((c) => collectIds(c, acc)); return acc; }
function countDesc(n: OrgNode): number { return n.children.reduce((t, c) => t + 1 + countDesc(c), 0); }

function Card({ node, isOpen, onToggle, selected, onSelect }: { node: OrgNode; isOpen: boolean; onToggle: () => void; selected: boolean; onSelect: () => void }) {
  const k = kindOf(node.kind);
  const has = node.children.length > 0;
  return (
    <div className={`orgc-node orgc-node--${KINDS[node.kind] ? node.kind : 'setor'}${selected ? ' is-selected' : ''}`} data-nodrag>
      <button type="button" className="orgc-node__main" onClick={onSelect} aria-pressed={selected}>
        <span className="orgc-node__icon" aria-hidden="true"><Icon name={k.icon} size="md" /></span>
        <span className="orgc-node__text">
          <span className="orgc-node__kind">{k.label}</span>
          <span className="orgc-node__name">{node.name}</span>
          {node.people.map((p) => <span key={p.name + p.role} className="orgc-node__person"><Icon name="user-round" size="sm" />{p.name}<em>{p.role}</em></span>)}
        </span>
      </button>
      {selected && node.description && <p className="orgc-node__desc">{node.description}</p>}
      {has && (
        <button type="button" className="orgc-node__toggle" onClick={onToggle} aria-expanded={isOpen}
          aria-label={`${isOpen ? 'Recolher' : 'Expandir'} ${node.children.length} ${node.children.length === 1 ? 'área' : 'áreas'} de ${node.name}`}>
          {isOpen ? <Icon name="minus" size="sm" /> : <><Icon name="plus" size="sm" />{node.children.length}</>}
        </button>
      )}
    </div>
  );
}

function Branch({ node, open, toggle, selected, select }: { node: OrgNode; open: Set<number>; toggle: (id: number) => void; selected: number | null; select: (id: number) => void }) {
  const isOpen = open.has(node.id);
  const stack = node.children.length > 0 && node.children.every((c) => c.children.length === 0);
  return (
    <li className={stack ? 'has-stack' : undefined}>
      <Card node={node} isOpen={isOpen} onToggle={() => toggle(node.id)} selected={selected === node.id} onSelect={() => select(node.id)} />
      {node.children.length > 0 && isOpen && (
        <ul className={stack ? 'orgc-stack' : undefined}>
          {node.children.map((c) => (stack
            ? <li key={c.id} className="orgc-s"><Card node={c} isOpen={false} onToggle={() => {}} selected={selected === c.id} onSelect={() => select(c.id)} /></li>
            : <Branch key={c.id} node={c} open={open} toggle={toggle} selected={selected} select={select} />))}
        </ul>
      )}
    </li>
  );
}

export function OrgChart({ roots }: { roots: OrgNode[] }) {
  const all = useMemo(() => roots.flatMap((r) => collectIds(r)), [roots]);
  const total = all.length;
  const [open, setOpen] = useState<Set<number>>(() => new Set(roots.map((r) => r.id)));
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [panning, setPanning] = useState(false);
  const vp = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const fitted = useRef(false);

  const fit = useCallback(() => {
    const v = vp.current, c = content.current;
    if (!v || !c) return;
    const pad = 32;
    const k = Math.min(1, (v.clientWidth - pad * 2) / c.scrollWidth, (v.clientHeight - pad * 2) / c.scrollHeight);
    const kk = Math.max(0.25, +k.toFixed(2));
    setView({ k: kk, x: Math.max(pad, (v.clientWidth - c.scrollWidth * kk) / 2), y: pad });
  }, []);

  useLayoutEffect(() => { if (!fitted.current) { fitted.current = true; fit(); } }, [fit]);
  const setAll = (ids: Set<number>) => { setOpen(ids); setTimeout(fit, 30); };

  const zoomAt = (factor: number, cx?: number, cy?: number) => setView((v) => {
    const el = vp.current; if (!el) return v;
    const k = Math.min(1.6, Math.max(0.25, +(v.k * factor).toFixed(3)));
    const px = cx ?? el.clientWidth / 2, py = cy ?? el.clientHeight / 2;
    return { k, x: px - ((px - v.x) / v.k) * k, y: py - ((py - v.y) / v.k) * k };
  });

  useEffect(() => {
    const el = vp.current; if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  const down = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('[data-nodrag]')) return;
    drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setPanning(true);
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current; if (!d) return;
    d.moved = true;
    setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }));
  };
  const up = () => { drag.current = null; setPanning(false); };
  const key = (e: React.KeyboardEvent) => {
    const step = 60;
    if (e.key === 'ArrowLeft') setView((v) => ({ ...v, x: v.x + step }));
    else if (e.key === 'ArrowRight') setView((v) => ({ ...v, x: v.x - step }));
    else if (e.key === 'ArrowUp') setView((v) => ({ ...v, y: v.y + step }));
    else if (e.key === 'ArrowDown') setView((v) => ({ ...v, y: v.y - step }));
    else if (e.key === '+' || e.key === '=') zoomAt(1.15);
    else if (e.key === '-') zoomAt(0.87);
    else if (e.key === '0') fit();
    else return;
    e.preventDefault();
  };
  const toggle = (id: number) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const select = (id: number) => setSelected((s) => (s === id ? null : id));
  const collapsedIds = new Set(roots.map((r) => r.id));
  const sub = roots.reduce((t, r) => t + countDesc(r), 0);

  return (
    <div className="orgc">
      <div className="orgc-tools" role="toolbar" aria-label="Controles do organograma">
        <div className="orgc-tools__group">
          <Button size="sm" variant="secondary" onClick={() => setAll(new Set(all))}><Icon name="list-tree" size="sm" />Expandir tudo</Button>
          <Button size="sm" variant="secondary" onClick={() => setAll(collapsedIds)}><Icon name="chevrons-down-up" size="sm" />Recolher</Button>
        </div>
        <div className="orgc-tools__group">
          <Button size="sm" variant="secondary" aria-label="Diminuir zoom" onClick={() => zoomAt(0.85)}><Icon name="zoom-out" size="sm" /></Button>
          <span className="orgc-tools__zoom" aria-live="polite">{Math.round(view.k * 100)}%</span>
          <Button size="sm" variant="secondary" aria-label="Aumentar zoom" onClick={() => zoomAt(1.15)}><Icon name="zoom-in" size="sm" /></Button>
          <Button size="sm" variant="secondary" onClick={fit}><Icon name="maximize" size="sm" />Ajustar</Button>
          <Button size="sm" href="/secretaria/organograma/pdf" external><Icon name="download" size="sm" />PDF</Button>
        </div>
      </div>
      <div ref={vp} className={`orgc-viewport${panning ? ' is-panning' : ''}`} tabIndex={0} role="region"
        aria-label="Organograma da Secretaria. Arraste para mover; use as setas para deslocar e + ou - para ampliar."
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}>
        <div ref={content} className="orgc-content" style={{ transform: `translate(${view.x}px,${view.y}px) scale(${view.k})` }}>
          <ul className="orgc-tree orgc-tree--root">{roots.map((r) => <Branch key={r.id} node={r} open={open} toggle={toggle} selected={selected} select={select} />)}</ul>
        </div>
        <div className="orgc-hint" aria-hidden="true"><Icon name="hand" size="sm" />Arraste para mover · Ctrl + rolagem para ampliar</div>
      </div>
      <ul className="orgc-legend" aria-label="Legenda">
        {Object.entries(KINDS).map(([k, v]) => <li key={k}><span className={`orgc-dot orgc-dot--${k}`} /> {v.label}</li>)}
        <li className="orgc-legend__count">{total} áreas · {sub} subordinadas</li>
      </ul>
    </div>
  );
}
