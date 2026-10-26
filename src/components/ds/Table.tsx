import type { ReactNode } from 'react';

export interface Column<T> { header: string; cell: (row: T) => ReactNode; className?: string }

/** Tabela que empilha em cartões no celular (data-label por célula). */
export function Table<T>({ columns, rows, rowKey, caption }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string | number; caption?: string }) {
  return (
    <div className="su-table-wrap">
      <table className="su-table su-table--stack">
        {caption && <caption className="su-sr-only">{caption}</caption>}
        <thead><tr>{columns.map((c) => <th key={c.header} scope="col">{c.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => <td key={c.header} data-label={c.header} className={c.className}>{c.cell(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
