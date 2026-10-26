import { Skeleton } from '@/components/ds';
export default function Loading() {
  return (
    <div className="su-container su-stack" style={{ paddingBlock: 'var(--space-10)' }} role="status" aria-label="Carregando">
      <Skeleton height={36} width="40%" /><Skeleton height={18} width="70%" /><Skeleton height={180} />
    </div>
  );
}
