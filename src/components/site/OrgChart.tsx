'use client';
import { useState } from 'react';
import { Button, Icon } from '@/components/ds';

export type OrgNode = { id: number; name: string; kind: string; description: string | null; people: { name: string; role: string }[]; children: OrgNode[] };

function collectIds(n: OrgNode, acc: number[] = []) { acc.push(n.id); n.children.forEach((c) => collectIds(c, acc)); return acc; }

function Node({ node, depth, open, toggle }: { node: OrgNode; depth: number; open: Set<number>; toggle: (id: number) => void }) {
  const has = node.children.length > 0;
  const isOpen = open.has(node.id);
  const label = (
    <>
      <span>
        {node.name}
        {node.people.map((p) => <span key={p.name + p.role} className="su-org__sub">{p.role}: {p.name}</span>)}
      </span>
      {has && <Icon name={isOpen ? 'chevron-down' : 'chevron-right'} size="sm" />}
    </>
  );
  return (
    <li>
      {has ? (
        <button type="button" className={`su-org__node${depth === 0 ? ' su-org__node--root' : ''}`} aria-expanded={isOpen} onClick={() => toggle(node.id)}>{label}</button>
      ) : (
        <span className="su-org__node">{label}</span>
      )}
      {has && isOpen && (
        <ul>{node.children.map((c) => <Node key={c.id} node={c} depth={depth + 1} open={open} toggle={toggle} />)}</ul>
      )}
    </li>
  );
}

export function OrgChart({ roots }: { roots: OrgNode[] }) {
  const all = roots.flatMap((r) => collectIds(r));
  const [open, setOpen] = useState<Set<number>>(() => new Set(roots.map((r) => r.id)));
  const [zoom, setZoom] = useState(1);
  const toggle = (id: number) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  return (
    <div>
      <div className="su-org-tools" role="toolbar" aria-label="Controles do organograma">
        <Button size="sm" variant="secondary" onClick={() => setOpen(new Set(all))}>Ver tudo</Button>
        <Button size="sm" variant="secondary" onClick={() => setOpen(new Set(roots.map((r) => r.id)))}>Recolher</Button>
        <Button size="sm" variant="secondary" aria-label="Diminuir zoom" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.1).toFixed(1)))}><Icon name="zoom-out" size="sm" /></Button>
        <Button size="sm" variant="secondary" aria-label="Aumentar zoom" onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(1)))}><Icon name="zoom-in" size="sm" /></Button>
        <Button size="sm" variant="tertiary" onClick={() => setZoom(1)}>Zoom {Math.round(zoom * 100)}%</Button>
        <Button size="sm" href="/secretaria/organograma/pdf" external><Icon name="download" size="sm" />Baixar PDF</Button>
      </div>
      <div className="su-org-viewport" tabIndex={0} role="region" aria-label="Organograma da Secretaria">
        <div className="su-org-zoom" style={{ transform: `scale(${zoom})` }}>
          <ul className="su-org">{roots.map((r) => <Node key={r.id} node={r} depth={0} open={open} toggle={toggle} />)}</ul>
        </div>
      </div>
    </div>
  );
}
