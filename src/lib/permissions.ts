export type Role = 'administrador' | 'gestor' | 'editor' | 'visualizador';

export const ROLES: { value: Role; label: string; description: string }[] = [
  { value: 'administrador', label: 'Administrador', description: 'Acesso total, inclusive usuários, logs e configurações.' },
  { value: 'gestor', label: 'Gestor', description: 'Gerencia todo o conteúdo, publica e exclui.' },
  { value: 'editor', label: 'Editor', description: 'Cria e edita notícias, campanhas e redes; não publica nem exclui.' },
  { value: 'visualizador', label: 'Visualizador', description: 'Somente leitura no painel.' },
];

export type Permission =
  | 'content.view'
  | 'news.write' | 'news.publish' | 'news.delete'
  | 'campaigns.write' | 'campaigns.publish' | 'campaigns.delete'
  | 'social.write' | 'social.delete'
  | 'catalog.write' | 'catalog.delete' // unidades, serviços, vacinas
  | 'institutional.write' | 'institutional.delete' // organograma, chefias, contatos
  | 'messages.manage'
  | 'settings.write'
  | 'users.manage'
  | 'logs.view';

const VIEW: Permission[] = ['content.view'];
const EDITOR: Permission[] = [...VIEW, 'news.write', 'campaigns.write', 'social.write'];
const GESTOR: Permission[] = [
  ...EDITOR, 'news.publish', 'news.delete', 'campaigns.publish', 'campaigns.delete', 'social.delete',
  'catalog.write', 'catalog.delete', 'institutional.write', 'institutional.delete', 'messages.manage',
];
const ADMIN: Permission[] = [...GESTOR, 'settings.write', 'users.manage', 'logs.view'];

const MATRIX: Record<Role, ReadonlySet<Permission>> = {
  visualizador: new Set(VIEW),
  editor: new Set(EDITOR),
  gestor: new Set(GESTOR),
  administrador: new Set(ADMIN),
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in MATRIX;
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  return isRole(role) && MATRIX[role].has(permission);
}

export function roleLabel(role: string): string {
  return ROLES.find((r) => r.value === role)?.label ?? role;
}
