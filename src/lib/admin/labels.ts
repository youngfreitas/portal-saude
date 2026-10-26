export const ACTION_LABELS: Record<string, string> = {
  login: 'Entrou', logout: 'Saiu', login_falhou: 'Login falhou', criar: 'Criou', editar: 'Editou', excluir: 'Excluiu', publicar: 'Publicou', despublicar: 'Despublicou',
};
export const actionLabel = (a: string) => ACTION_LABELS[a] ?? a;

export const POST_STATUS: Record<string, string> = { rascunho: 'Rascunho', revisao: 'Em revisão', publicado: 'Publicada', despublicado: 'Despublicada' };
export function postStatusLabel(status: string, publishAt: Date | null, now = new Date()): { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' } {
  if (status === 'publicado' && publishAt && publishAt > now) return { label: 'Agendada', tone: 'info' };
  if (status === 'publicado') return { label: 'Publicada', tone: 'success' };
  if (status === 'revisao') return { label: 'Em revisão', tone: 'warning' };
  if (status === 'despublicado') return { label: 'Despublicada', tone: 'danger' };
  return { label: 'Rascunho', tone: 'neutral' };
}
