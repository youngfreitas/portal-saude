import { Button, EmptyState, Icon } from '@/components/ds';
export default function NotFound() {
  return (
    <div className="su-container" style={{ paddingBlock: 'var(--space-12)' }}>
      <EmptyState icon={<Icon name="search-x" size="xl" />} title="Página não encontrada" description="O endereço pode ter mudado ou a publicação pode ter sido retirada do ar." action={<div className="su-row"><Button href="/">Ir para o início</Button><Button variant="secondary" href="/busca">Buscar no portal</Button></div>} />
    </div>
  );
}
