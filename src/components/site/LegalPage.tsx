import type { ReactNode } from 'react';
import { Alert, Icon, PageHead } from '@/components/ds';

export function LegalPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <>
      <PageHead title={title} trail={[{ label: 'Início', href: '/' }, { label: title }]} lead={lead} />
      <div className="su-container" style={{ paddingTop: 'var(--space-8)' }}>
        <Alert tone="warning" icon={<Icon name="scale" />} title="Texto-base sujeito à validação" style={{ marginBottom: 'var(--space-8)' }}>
          Este texto é um modelo inicial e está sujeito à validação jurídica e do Encarregado de Dados (DPO) da Prefeitura Municipal de Ubatuba antes de ser considerado oficial.
        </Alert>
        <div className="su-prose">{children}</div>
      </div>
    </>
  );
}
