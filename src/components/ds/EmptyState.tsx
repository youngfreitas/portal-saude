import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="su-empty">
      {icon}
      <div className="su-empty__title">{title}</div>
      {description && <div className="su-empty__desc">{description}</div>}
      {action}
    </div>
  );
}
