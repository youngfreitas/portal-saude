import type { ReactNode } from 'react';
export function Accordion({ items }: { items: { id: string; title: string; content: ReactNode; open?: boolean }[] }) {
  return (
    <div className="su-accordion">
      {items.map((it) => (
        <details key={it.id} open={it.open}>
          <summary>{it.title}</summary>
          <div className="su-accordion__panel">{it.content}</div>
        </details>
      ))}
    </div>
  );
}
