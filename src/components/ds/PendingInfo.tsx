import { PENDING_TEXT } from '@/lib/pending';
import { Icon } from './Icon';

/** Indicador de conteúdo oficial ainda não confirmado (regra de conteúdo do portal). */
export function PendingInfo({ label = PENDING_TEXT }: { label?: string }) {
  return <span className="su-pending"><Icon name="clock" size="sm" />{label}</span>;
}

/** Mostra o valor, ou o indicador de pendência se estiver vazio. */
export function ValueOrPending({ value }: { value: string | null | undefined }) {
  return value && value.trim() ? <>{value}</> : <PendingInfo />;
}
