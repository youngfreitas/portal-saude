import type { ReactNode } from 'react';
export function Steps({ items }: { items: ReactNode[] }) {
  return <ol className="su-steps">{items.map((it, i) => <li key={i}><div>{it}</div></li>)}</ol>;
}
