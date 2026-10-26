import type { ReactNode } from 'react';
export function SectionHeader({ kicker, title, action, as: H = 'h2' }: { kicker?: string; title: string; action?: ReactNode; as?: 'h1' | 'h2' | 'h3' }) {
  return (
    <div className="su-sectionhead">
      <div>
        {kicker && <div className="su-overline">{kicker}</div>}
        <H>{title}</H>
      </div>
      {action}
    </div>
  );
}
