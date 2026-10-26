import type { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { can, roleLabel, type Permission } from '@/lib/permissions';
import { AdminShell, type AdminNavItem } from '@/components/admin/AdminShell';

export const metadata: Metadata = { title: { default: 'Painel', template: '%s | Painel Saúde Ubatuba' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const NAV: (AdminNavItem & { perm: Permission })[] = [
  { href: '/admin', label: 'Início', icon: 'layout-dashboard', group: 'Painel', perm: 'content.view' },
  { href: '/admin/noticias', label: 'Notícias e comunicados', icon: 'newspaper', group: 'Conteúdo', perm: 'content.view' },
  { href: '/admin/campanhas', label: 'Campanhas', icon: 'megaphone', group: 'Conteúdo', perm: 'content.view' },
  { href: '/admin/redes', label: 'Perfis de redes sociais', icon: 'share-2', group: 'Conteúdo', perm: 'content.view' },
  { href: '/admin/publicacoes-sociais', label: 'Publicações das redes', icon: 'instagram', group: 'Conteúdo', perm: 'content.view' },
  { href: '/admin/unidades', label: 'Unidades de saúde', icon: 'map-pin', group: 'Cadastros', perm: 'content.view' },
  { href: '/admin/categorias', label: 'Categorias de unidade', icon: 'tags', group: 'Cadastros', perm: 'content.view' },
  { href: '/admin/servicos', label: 'Serviços e tratamentos', icon: 'stethoscope', group: 'Cadastros', perm: 'content.view' },
  { href: '/admin/vacinas', label: 'Calendário de vacinação', icon: 'syringe', group: 'Cadastros', perm: 'content.view' },
  { href: '/admin/organograma', label: 'Organograma', icon: 'network', group: 'Institucional', perm: 'content.view' },
  { href: '/admin/chefias', label: 'Chefias', icon: 'users', group: 'Institucional', perm: 'content.view' },
  { href: '/admin/contatos', label: 'Canais de atendimento', icon: 'phone', group: 'Institucional', perm: 'content.view' },
  { href: '/admin/mensagens', label: 'Mensagens recebidas', icon: 'inbox', group: 'Institucional', perm: 'messages.manage' },
  { href: '/admin/midia', label: 'Biblioteca de mídia', icon: 'image', group: 'Sistema', perm: 'content.view' },
  { href: '/admin/configuracoes', label: 'Configurações', icon: 'settings', group: 'Sistema', perm: 'settings.write' },
  { href: '/admin/usuarios', label: 'Usuários e perfis', icon: 'user-cog', group: 'Sistema', perm: 'users.manage' },
  { href: '/admin/logs', label: 'Log de atividades', icon: 'scroll-text', group: 'Sistema', perm: 'logs.view' },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const items = NAV.filter((n) => can(user.role, n.perm)).map(({ perm: _p, ...rest }) => rest);
  return <AdminShell user={{ name: user.name }} roleLabel={roleLabel(user.role)} items={items}>{children}</AdminShell>;
}
