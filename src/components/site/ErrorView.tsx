'use client';
import { Button, EmptyState, Icon } from '@/components/ds';
export function ErrorView({ reset }: { reset: () => void }) {
  return (
    <div className="su-container" style={{ paddingBlock: 'var(--space-12)' }}>
      <EmptyState icon={<Icon name="triangle-alert" size="xl" />} title="Algo deu errado" description="Não conseguimos carregar esta página. Tente novamente em instantes." action={<Button onClick={reset}>Tentar novamente</Button>} />
    </div>
  );
}
