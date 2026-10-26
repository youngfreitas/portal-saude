import Link from 'next/link';

export function Pagination({ page, pages, hrefFor }: { page: number; pages: number; hrefFor: (p: number) => string }) {
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const items: (number | 'gap')[] = [];
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) items.push('gap'); items.push(n); });
  return (
    <nav className="su-pagination" aria-label="Paginação">
      {page > 1 ? <Link className="su-page" href={hrefFor(page - 1)} rel="prev">Anterior</Link> : <span className="su-page" aria-disabled="true">Anterior</span>}
      {items.map((n, i) => n === 'gap'
        ? <span key={`g${i}`} aria-hidden>…</span>
        : <Link key={n} className="su-page" href={hrefFor(n)} aria-current={n === page ? 'page' : undefined} aria-label={`Página ${n}`}>{n}</Link>)}
      {page < pages ? <Link className="su-page" href={hrefFor(page + 1)} rel="next">Próxima</Link> : <span className="su-page" aria-disabled="true">Próxima</span>}
    </nav>
  );
}
