export const SETTING_FIELDS = [
  { key: 'site_name', label: 'Nome do portal', group: 'Identidade', hint: 'Usado em títulos e rodapé.' },
  { key: 'headquarters_address', label: 'Endereço da sede', group: 'Contato da Secretaria', multiline: true },
  { key: 'main_phone', label: 'Telefone principal', group: 'Contato da Secretaria' },
  { key: 'main_email', label: 'E-mail institucional', group: 'Contato da Secretaria' },
  { key: 'opening_hours', label: 'Horário de atendimento', group: 'Contato da Secretaria' },
  { key: 'maps_url', label: 'Link do endereço no mapa (opcional)', group: 'Contato da Secretaria' },
  { key: 'hero_image_id', label: 'Imagem de destaque da página inicial (ID da mídia)', group: 'Página inicial', hint: 'Deixe vazio para usar a área azul do Design System.' },
  { key: 'hero_title', label: 'Título da página inicial', group: 'Página inicial' },
  { key: 'hero_text', label: 'Texto da página inicial', group: 'Página inicial', multiline: true },
  { key: 'about_text', label: 'Apresentação da Secretaria', group: 'Textos institucionais', multiline: true },
  { key: 'mission', label: 'Missão', group: 'Textos institucionais', multiline: true },
  { key: 'attributions', label: 'Competências e atribuições', group: 'Textos institucionais', multiline: true },
  { key: 'lgpd_controller', label: 'Controlador de dados (LGPD)', group: 'LGPD', hint: 'Identificação oficial do controlador.' },
  { key: 'lgpd_dpo_name', label: 'Encarregado (DPO) — nome', group: 'LGPD' },
  { key: 'lgpd_dpo_email', label: 'Encarregado (DPO) — e-mail', group: 'LGPD' },
  { key: 'ombudsman_url', label: 'Link da Ouvidoria', group: 'Canais' },
  { key: 'prefeitura_url', label: 'Portal da Prefeitura', group: 'Canais' },
] as const;

export type SettingKey = (typeof SETTING_FIELDS)[number]['key'];
export type Settings = Record<SettingKey, string>;
