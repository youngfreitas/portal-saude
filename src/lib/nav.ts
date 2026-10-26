export type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };

export const NAV: NavItem[] = [
  { label: 'Início', href: '/' },
  {
    label: 'Secretaria', href: '/secretaria',
    children: [
      { label: 'Sobre a Secretaria', href: '/secretaria' },
      { label: 'Organograma', href: '/secretaria/organograma' },
      { label: 'Chefias e responsáveis', href: '/secretaria/chefias' },
    ],
  },
  {
    label: 'Unidades de Saúde', href: '/unidades',
    children: [
      { label: 'Todas as unidades', href: '/unidades' },
      { label: 'Mapa das unidades', href: '/unidades/mapa' },
    ],
  },
  {
    label: 'Serviços', href: '/servicos',
    children: [
      { label: 'Todos os serviços', href: '/servicos' },
      { label: 'Vacinação', href: '/servicos/vacinacao' },
      { label: 'Tratamentos', href: '/servicos/tratamentos' },
    ],
  },
  { label: 'Notícias e Comunicados', href: '/noticias' },
  { label: 'Campanhas', href: '/campanhas' },
  { label: 'Contatos', href: '/contatos' },
];
