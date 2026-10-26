const tz = 'America/Sao_Paulo';

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d.length === 10 ? d + 'T12:00:00' : d) : d;
  return new Intl.DateTimeFormat('pt-BR', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

export function formatDateTime(d: Date | string | null | undefined): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function formatPeriod(start?: string | null, end?: string | null): string {
  if (start && end) return `${formatDate(start)} a ${formatDate(end)}`;
  if (start) return `A partir de ${formatDate(start)}`;
  if (end) return `Até ${formatDate(end)}`;
  return '';
}

/** Valor para <input type="datetime-local"> no fuso de São Paulo. */
export function toLocalInput(d: Date | null | undefined): string {
  if (!d) return '';
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  }).format(d);
  return parts.replace(' ', 'T');
}

/** Interpreta datetime-local como horário de Brasília (UTC-3, sem horário de verão). */
export function fromLocalInput(v: string | null | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v + ':00-03:00');
  return Number.isNaN(d.getTime()) ? null : d;
}

export function telHref(phone: string): string {
  return 'tel:+55' + phone.replace(/\D/g, '').replace(/^55/, '');
}
