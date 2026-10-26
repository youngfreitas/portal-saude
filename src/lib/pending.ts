export const PENDING_TEXT = 'Informação pendente de confirmação oficial';

export function isBlank(v: string | null | undefined): boolean {
  return v == null || v.trim() === '';
}
