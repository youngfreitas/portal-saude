import type { ReactNode } from 'react';
export function DescriptionList({ items }: { items: { term: string; detail: ReactNode }[] }) {
  return (
    <dl className="su-dl">
      {items.map((i) => <div key={i.term} style={{ display: 'contents' }}><dt>{i.term}</dt><dd>{i.detail}</dd></div>)}
    </dl>
  );
}
