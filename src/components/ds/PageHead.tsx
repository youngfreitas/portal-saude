import type { ReactNode } from 'react';
import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';

export function PageHead({ title, trail, lead, actions }: { title: string; trail: BreadcrumbItem[]; lead?: string; actions?: ReactNode }) {
  return (
    <div className="su-pagehead">
      <div className="su-container su-pagehead__in">
        <Breadcrumb items={trail} />
        <h1>{title}</h1>
        {lead && <p className="su-pagehead__lead">{lead}</p>}
        {actions && <div className="su-row" style={{ marginTop: 'var(--space-4)' }}>{actions}</div>}
      </div>
    </div>
  );
}
