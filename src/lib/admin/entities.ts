import type { PgTable } from 'drizzle-orm/pg-core';
import { campaigns, contactChannels, orgUnits, people, posts, services, socialPosts, socialProfiles, unitCategories, units, vaccines } from '@/db/schema';
import type { Permission } from '@/lib/permissions';

export type FieldType =
  | 'text' | 'email' | 'url' | 'textarea' | 'richtext' | 'select' | 'checkbox' | 'number' | 'float'
  | 'date' | 'datetime' | 'image' | 'lines' | 'services' | 'gallery' | 'attachments';

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  max?: number;
  options?: { value: string; label: string }[];
  optionsFrom?: 'unitCategories' | 'orgUnits';
  /** Valor gravado quando o campo vem vazio (padrão: null). */
  emptyAs?: '' | 0 | null;
  half?: boolean;
  /** Para 'lines': formato esperado e se aceita caminhos /media/. */
  linesKind?: 'links' | 'videos' | 'materials';
  /** Campo só alterável por quem pode publicar. */
  publishOnly?: boolean;
};

export type EntityKey =
  | 'noticias' | 'campanhas' | 'vacinas' | 'unidades' | 'categorias' | 'servicos'
  | 'organograma' | 'chefias' | 'contatos' | 'redes' | 'publicacoes-sociais';

export type Entity = {
  key: EntityKey;
  title: string;
  singular: string;
  table: PgTable;
  entityName: string; // nome no log
  read: Permission;
  write: Permission;
  delete: Permission;
  publish?: Permission;
  /** Campo de onde nasce o slug, quando a tabela tem slug. */
  slugFrom?: string;
  nameField: string;
  fields: Field[];
};

const CATEGORIES_POST = ['Notícia', 'Comunicado', 'Vacinação', 'Campanha', 'Vigilância', 'Atenção Básica', 'Urgência', 'Outros'].map((c) => ({ value: c, label: c }));
const NETWORKS = [{ value: 'instagram', label: 'Instagram' }, { value: 'facebook', label: 'Facebook' }, { value: 'youtube', label: 'YouTube' }];

export const ENTITIES: Record<EntityKey, Entity> = {
  noticias: {
    key: 'noticias', title: 'Notícias e comunicados', singular: 'notícia', table: posts, entityName: 'noticia',
    read: 'content.view', write: 'news.write', delete: 'news.delete', publish: 'news.publish', slugFrom: 'title', nameField: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, max: 240 },
      { name: 'subtitle', label: 'Subtítulo', type: 'text', max: 300 },
      { name: 'category', label: 'Categoria', type: 'select', required: true, options: CATEGORIES_POST, half: true },
      { name: 'sector', label: 'Setor responsável', type: 'text', max: 160, half: true },
      { name: 'authorName', label: 'Autor', type: 'text', max: 160, half: true },
      { name: 'isNotice', label: 'É um comunicado oficial (aparece em destaque na página inicial)', type: 'checkbox' },
      { name: 'featured', label: 'Nível de destaque', type: 'select', emptyAs: 0, hint: 'Alerta urgente aparece em vermelho no topo da página inicial.', options: [{ value: '0', label: 'Normal' }, { value: '1', label: 'Destaque' }, { value: '2', label: 'Alerta urgente' }], half: true, publishOnly: true },
      { name: 'body', label: 'Conteúdo', type: 'richtext', emptyAs: '' },
      { name: 'coverId', label: 'Imagem de capa', type: 'image', hint: 'JPG, PNG ou WebP, até 8 MB. O texto alternativo é obrigatório.' },
      { name: 'gallery', label: 'Galeria de imagens', type: 'gallery' },
      { name: 'attachments', label: 'Anexos (PDF)', type: 'attachments' },
      { name: 'links', label: 'Links relacionados', type: 'lines', linesKind: 'links', hint: 'Um por linha, no formato: Texto do link | https://endereço' },
      { name: 'videos', label: 'Vídeos do YouTube', type: 'lines', linesKind: 'videos', hint: 'Um por linha, no formato: https://www.youtube.com/watch?v=… | Título (opcional). O vídeo só é exibido a quem permitir cookies de terceiros.' },
      { name: 'status', label: 'Situação', type: 'select', required: true, options: [{ value: 'rascunho', label: 'Rascunho' }, { value: 'revisao', label: 'Enviada para revisão' }, { value: 'publicado', label: 'Publicada' }, { value: 'despublicado', label: 'Despublicada' }], half: true },
      { name: 'publishAt', label: 'Data e hora de publicação', type: 'datetime', half: true, hint: 'Com situação “Publicada”, uma data futura agenda a publicação (horário de Brasília).' },
    ],
  },
  campanhas: {
    key: 'campanhas', title: 'Campanhas', singular: 'campanha', table: campaigns, entityName: 'campanha',
    read: 'content.view', write: 'campaigns.write', delete: 'campaigns.delete', publish: 'campaigns.publish', slugFrom: 'title', nameField: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', required: true, max: 240 },
      { name: 'summary', label: 'Resumo', type: 'textarea' },
      { name: 'objectives', label: 'Objetivos', type: 'textarea' },
      { name: 'audience', label: 'Público-alvo', type: 'textarea' },
      { name: 'startsOn', label: 'Início', type: 'date', half: true },
      { name: 'endsOn', label: 'Fim', type: 'date', half: true },
      { name: 'guidance', label: 'Orientações à população', type: 'textarea' },
      { name: 'places', label: 'Locais de atendimento', type: 'textarea' },
      { name: 'materials', label: 'Materiais de divulgação', type: 'lines', linesKind: 'materials', hint: 'Um por linha: Nome do material | https://endereço (ou /media/ID de um PDF enviado em Mídia).' },
      { name: 'coverId', label: 'Imagem de capa', type: 'image' },
      { name: 'status', label: 'Situação', type: 'select', required: true, options: [{ value: 'planejada', label: 'Programada' }, { value: 'ativa', label: 'Em andamento' }, { value: 'encerrada', label: 'Encerrada' }], half: true },
      { name: 'isVaccination', label: 'É uma campanha de vacinação', type: 'checkbox' },
      { name: 'published', label: 'Publicada no portal', type: 'checkbox', publishOnly: true },
    ],
  },
  vacinas: {
    key: 'vacinas', title: 'Calendário de vacinação', singular: 'vacina', table: vaccines, entityName: 'vacina',
    read: 'content.view', write: 'catalog.write', delete: 'catalog.delete', nameField: 'name',
    fields: [
      { name: 'name', label: 'Vacina', type: 'text', required: true, max: 200 },
      { name: 'ageGroup', label: 'Quando tomar (idade / grupo)', type: 'text', required: true, max: 200 },
      { name: 'doses', label: 'Doses', type: 'text', max: 200 },
      { name: 'notes', label: 'Observações', type: 'textarea' },
      { name: 'source', label: 'Fonte oficial', type: 'text', max: 300, hint: 'Ex.: Calendário Nacional de Vacinação — Ministério da Saúde.' },
      { name: 'sortOrder', label: 'Ordem de exibição', type: 'number', emptyAs: 0, half: true },
      { name: 'active', label: 'Visível no portal', type: 'checkbox' },
    ],
  },
  unidades: {
    key: 'unidades', title: 'Unidades de saúde', singular: 'unidade', table: units, entityName: 'unidade',
    read: 'content.view', write: 'catalog.write', delete: 'catalog.delete', slugFrom: 'name', nameField: 'name',
    fields: [
      { name: 'name', label: 'Nome da unidade', type: 'text', required: true, max: 200 },
      { name: 'categoryId', label: 'Categoria', type: 'select', optionsFrom: 'unitCategories', half: true },
      { name: 'neighborhood', label: 'Bairro', type: 'text', max: 120, half: true },
      { name: 'address', label: 'Endereço completo', type: 'textarea', hint: 'Deixe em branco se ainda não foi confirmado oficialmente — o portal exibirá “Informação pendente”.' },
      { name: 'cep', label: 'CEP', type: 'text', max: 12, half: true },
      { name: 'phone', label: 'Telefone', type: 'text', max: 60, half: true },
      { name: 'email', label: 'E-mail', type: 'email', max: 200, half: true },
      { name: 'hours', label: 'Horário de funcionamento', type: 'textarea' },
      { name: 'manager', label: 'Responsável', type: 'text', max: 200, half: true },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'photoId', label: 'Foto da unidade', type: 'image' },
      { name: 'services', label: 'Serviços oferecidos', type: 'services' },
      { name: 'lat', label: 'Latitude', type: 'float', half: true, hint: 'Ex.: -23.4336 (use ponto decimal).' },
      { name: 'lng', label: 'Longitude', type: 'float', half: true },
      { name: 'coordsVerified', label: 'Coordenadas verificadas oficialmente (só então a unidade aparece no mapa)', type: 'checkbox' },
      { name: 'active', label: 'Visível no portal', type: 'checkbox' },
    ],
  },
  categorias: {
    key: 'categorias', title: 'Categorias de unidade', singular: 'categoria', table: unitCategories, entityName: 'categoria_unidade',
    read: 'content.view', write: 'catalog.write', delete: 'catalog.delete', slugFrom: 'name', nameField: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, max: 120 },
      { name: 'sortOrder', label: 'Ordem', type: 'number', emptyAs: 0, half: true },
    ],
  },
  servicos: {
    key: 'servicos', title: 'Serviços e tratamentos', singular: 'serviço', table: services, entityName: 'servico',
    read: 'content.view', write: 'catalog.write', delete: 'catalog.delete', slugFrom: 'name', nameField: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, max: 200 },
      { name: 'kind', label: 'Tipo', type: 'select', required: true, options: [{ value: 'servico', label: 'Serviço' }, { value: 'tratamento', label: 'Tratamento' }], half: true },
      { name: 'icon', label: 'Ícone (nome Lucide)', type: 'text', max: 60, half: true, emptyAs: '', hint: 'Ex.: stethoscope, syringe, pill.' },
      { name: 'summary', label: 'Resumo', type: 'textarea' },
      { name: 'description', label: 'O que é', type: 'textarea' },
      { name: 'audience', label: 'Quem pode usar', type: 'textarea' },
      { name: 'documents', label: 'Documentos necessários', type: 'textarea' },
      { name: 'howTo', label: 'Como ter acesso', type: 'textarea' },
      { name: 'hours', label: 'Horário', type: 'textarea' },
      { name: 'externalUrl', label: 'Link do serviço online', type: 'url', max: 500, hint: 'O botão “Acessar serviço” só aparece se houver link.' },
      { name: 'sortOrder', label: 'Ordem', type: 'number', emptyAs: 0, half: true },
      { name: 'active', label: 'Visível no portal', type: 'checkbox' },
    ],
  },
  organograma: {
    key: 'organograma', title: 'Organograma', singular: 'setor', table: orgUnits, entityName: 'organograma', nameField: 'name',
    read: 'content.view', write: 'institutional.write', delete: 'institutional.delete',
    fields: [
      { name: 'name', label: 'Nome do setor', type: 'text', required: true, max: 200 },
      { name: 'parentId', label: 'Subordinado a', type: 'select', optionsFrom: 'orgUnits', half: true, hint: 'Vazio = topo da estrutura.' },
      { name: 'kind', label: 'Tipo', type: 'select', required: true, half: true, options: ['secretaria', 'gabinete', 'departamento', 'setor', 'colegiado'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) })) },
      { name: 'description', label: 'Descrição / atribuições', type: 'textarea' },
      { name: 'sortOrder', label: 'Ordem entre irmãos', type: 'number', emptyAs: 0, half: true },
    ],
  },
  chefias: {
    key: 'chefias', title: 'Chefias e responsáveis', singular: 'responsável', table: people, entityName: 'chefia', nameField: 'name',
    read: 'content.view', write: 'institutional.write', delete: 'institutional.delete',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true, max: 200 },
      { name: 'role', label: 'Cargo / função', type: 'text', required: true, max: 200 },
      { name: 'orgUnitId', label: 'Setor', type: 'select', optionsFrom: 'orgUnits' },
      { name: 'duties', label: 'Atribuições', type: 'textarea' },
      { name: 'email', label: 'E-mail institucional', type: 'email', max: 200, half: true },
      { name: 'phone', label: 'Telefone institucional', type: 'text', max: 60, half: true },
      { name: 'photoId', label: 'Foto (opcional)', type: 'image' },
      { name: 'sortOrder', label: 'Ordem', type: 'number', emptyAs: 0, half: true },
      { name: 'active', label: 'Visível no portal', type: 'checkbox' },
    ],
  },
  contatos: {
    key: 'contatos', title: 'Canais de atendimento', singular: 'canal', table: contactChannels, entityName: 'canal', nameField: 'name',
    read: 'content.view', write: 'institutional.write', delete: 'institutional.delete',
    fields: [
      { name: 'name', label: 'Nome do canal', type: 'text', required: true, max: 200 },
      { name: 'group', label: 'Grupo', type: 'select', required: true, half: true, options: [{ value: 'canal', label: 'Canal de atendimento' }, { value: 'setor', label: 'Setor' }] },
      { name: 'description', label: 'Descrição', type: 'textarea' },
      { name: 'phone', label: 'Telefone', type: 'text', max: 60, half: true },
      { name: 'email', label: 'E-mail', type: 'email', max: 200, half: true },
      { name: 'url', label: 'Link', type: 'url', max: 500 },
      { name: 'hours', label: 'Horário', type: 'text', max: 200, half: true },
      { name: 'sortOrder', label: 'Ordem', type: 'number', emptyAs: 0, half: true },
    ],
  },
  redes: {
    key: 'redes', title: 'Perfis de redes sociais', singular: 'perfil', table: socialProfiles, entityName: 'rede_social', nameField: 'label',
    read: 'content.view', write: 'social.write', delete: 'social.delete',
    fields: [
      { name: 'network', label: 'Rede', type: 'select', required: true, options: NETWORKS, half: true },
      { name: 'label', label: 'Nome do perfil', type: 'text', required: true, max: 120, half: true },
      { name: 'url', label: 'Endereço do perfil', type: 'url', required: true, max: 500 },
      { name: 'sortOrder', label: 'Ordem', type: 'number', emptyAs: 0, half: true },
    ],
  },
  'publicacoes-sociais': {
    key: 'publicacoes-sociais', title: 'Publicações das redes', singular: 'publicação', table: socialPosts, entityName: 'publicacao_social', nameField: 'caption',
    read: 'content.view', write: 'social.write', delete: 'social.delete',
    fields: [
      { name: 'network', label: 'Rede', type: 'select', required: true, options: NETWORKS, half: true },
      { name: 'postedOn', label: 'Data da publicação', type: 'date', half: true },
      { name: 'url', label: 'Endereço da publicação', type: 'url', required: true, max: 500 },
      { name: 'caption', label: 'Legenda', type: 'textarea' },
      { name: 'imageId', label: 'Imagem', type: 'image' },
    ],
  },
};

export const ENTITY_KEYS = Object.keys(ENTITIES) as EntityKey[];
export function getEntity(key: string): Entity | null {
  return (ENTITIES as Record<string, Entity>)[key] ?? null;
}
