import { Icon } from '@/components/ds';
import { FitToWidth } from './FitToWidth';

export type OrgNode = { id: number; name: string; kind: string; description: string | null; people: { name: string; role: string }[]; children: OrgNode[] };

const KINDS: Record<string, { label: string; icon: string }> = {
  secretaria: { label: 'Secretaria', icon: 'landmark' },
  gabinete: { label: 'Gabinete', icon: 'briefcase' },
  colegiado: { label: 'Colegiado', icon: 'users' },
  departamento: { label: 'Departamento', icon: 'building-2' },
  setor: { label: 'Setor', icon: 'layers' },
};
const kindKey = (k: string) => (KINDS[k] ? k : 'setor');

function count(n: OrgNode): number { return 1 + n.children.reduce((t, c) => t + count(c), 0); }

function NodeCard({ node }: { node: OrgNode }) {
  const k = KINDS[kindKey(node.kind)];
  return (
    <div className={`orgt-node orgt-node--${kindKey(node.kind)}`}>
      <span className="orgt-node__icon" aria-hidden="true"><Icon name={k.icon} size="md" /></span>
      <div className="orgt-node__text">
        <span className="orgt-node__kind">{k.label}</span>
        <h3 className="orgt-node__name">{node.name}</h3>
        {node.people.map((p) => (
          <p key={p.name + p.role} className="orgt-node__person"><Icon name="user-round" size="sm" />{p.name}<em>{p.role}</em></p>
        ))}
        {node.description && <p className="orgt-node__desc">{node.description}</p>}
      </div>
    </div>
  );
}

function Branch({ node, leaf = false }: { node: OrgNode; leaf?: boolean }) {
  const stack = node.children.length > 0 && node.children.every((c) => c.children.length === 0);
  return (
    <li className={[stack ? 'has-stack' : '', leaf ? 'orgt-s' : ''].join(' ').trim() || undefined}>
      <NodeCard node={node} />
      {node.children.length > 0 && (
        <ul className={stack ? 'orgt-stack' : undefined}>
          {node.children.map((c) => <Branch key={c.id} node={c} leaf={stack} />)}
        </ul>
      )}
    </li>
  );
}

export function OrgChart({ roots }: { roots: OrgNode[] }) {
  const total = roots.reduce((t, r) => t + count(r), 0);
  return (
    <div className="orgt">
      <div className="orgt-bar">
        <ul className="orgt-legend" aria-label="Legenda">
          {Object.entries(KINDS).map(([k, v]) => <li key={k}><span className={`orgt-dot orgt-dot--${k}`} />{v.label}</li>)}
          <li className="orgt-legend__count">{total} áreas</li>
        </ul>
        <a className="su-btn su-btn--primary su-btn--sm" href="/secretaria/organograma/pdf" target="_blank" rel="noopener noreferrer"><Icon name="download" size="sm" />Baixar PDF</a>
      </div>
      <div className="orgt-bleed">
        <FitToWidth>
          <ul className="orgt-tree" role="tree" aria-label="Organograma da Secretaria">
            {roots.map((r) => <Branch key={r.id} node={r} />)}
          </ul>
        </FitToWidth>
      </div>
    </div>
  );
}
