import {
  pgTable, serial, text, varchar, boolean, integer, timestamp, doublePrecision, jsonb, primaryKey, index, uniqueIndex,
} from 'drizzle-orm/pg-core';

const ts = (name: string) => timestamp(name, { withTimezone: true });

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('visualizador'),
  active: boolean('active').notNull().default(true),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: ts('expires_at').notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),
  userName: varchar('user_name', { length: 160 }),
  action: varchar('action', { length: 40 }).notNull(),
  entity: varchar('entity', { length: 60 }).notNull(),
  entityId: varchar('entity_id', { length: 60 }),
  summary: text('summary'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const loginAttempts = pgTable('login_attempts', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 300 }).notNull(),
  success: boolean('success').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [index('login_attempts_key_idx').on(t.key, t.createdAt)]);

export const settings = pgTable('settings', {
  key: varchar('key', { length: 80 }).primaryKey(),
  value: text('value').notNull().default(''),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const media = pgTable('media', {
  id: serial('id').primaryKey(),
  kind: varchar('kind', { length: 10 }).notNull(), // image | file
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 255 }).notNull(),
  mime: varchar('mime', { length: 100 }).notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const unitCategories = pgTable('unit_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 120 }).notNull(),
  slug: varchar('slug', { length: 140 }).notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const units = pgTable('units', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  categoryId: integer('category_id').references(() => unitCategories.id, { onDelete: 'set null' }),
  neighborhood: varchar('neighborhood', { length: 120 }),
  address: text('address'),
  cep: varchar('cep', { length: 12 }),
  phone: varchar('phone', { length: 60 }),
  email: varchar('email', { length: 200 }),
  hours: text('hours'),
  manager: varchar('manager', { length: 200 }),
  description: text('description'),
  photoId: integer('photo_id').references(() => media.id, { onDelete: 'set null' }),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  coordsVerified: boolean('coords_verified').notNull().default(false),
  active: boolean('active').notNull().default(true),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 220 }).notNull().unique(),
  kind: varchar('kind', { length: 20 }).notNull().default('servico'), // servico | tratamento
  summary: text('summary'),
  description: text('description'),
  audience: text('audience'),
  documents: text('documents'),
  howTo: text('how_to'),
  hours: text('hours'),
  externalUrl: varchar('external_url', { length: 500 }),
  icon: varchar('icon', { length: 60 }).default('stethoscope'),
  active: boolean('active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const unitServices = pgTable('unit_services', {
  unitId: integer('unit_id').notNull().references(() => units.id, { onDelete: 'cascade' }),
  serviceId: integer('service_id').notNull().references(() => services.id, { onDelete: 'cascade' }),
}, (t) => [primaryKey({ columns: [t.unitId, t.serviceId] })]);

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 240 }).notNull(),
  subtitle: varchar('subtitle', { length: 300 }),
  slug: varchar('slug', { length: 260 }).notNull().unique(),
  body: text('body').notNull().default(''),
  coverId: integer('cover_id').references(() => media.id, { onDelete: 'set null' }),
  category: varchar('category', { length: 80 }).notNull().default('Notícia'),
  sector: varchar('sector', { length: 160 }),
  authorName: varchar('author_name', { length: 160 }),
  status: varchar('status', { length: 20 }).notNull().default('rascunho'), // rascunho | publicado | despublicado | revisao
  publishAt: ts('publish_at'),
  featured: integer('featured').notNull().default(0), // 0 normal | 1 destaque | 2 alerta/comunicado urgente
  isNotice: boolean('is_notice').notNull().default(false),
  links: jsonb('links').$type<{ label: string; url: string }[]>().notNull().default([]),
  videos: jsonb('videos').$type<{ url: string; title?: string }[]>().notNull().default([]),
  createdAt: ts('created_at').notNull().defaultNow(),
  updatedAt: ts('updated_at').notNull().defaultNow(),
}, (t) => [index('posts_status_idx').on(t.status, t.publishAt)]);

export const postMedia = pgTable('post_media', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  mediaId: integer('media_id').notNull().references(() => media.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 10 }).notNull().default('gallery'), // gallery | attachment
  sortOrder: integer('sort_order').notNull().default(0),
});

export const campaigns = pgTable('campaigns', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 240 }).notNull(),
  slug: varchar('slug', { length: 260 }).notNull().unique(),
  summary: text('summary'),
  objectives: text('objectives'),
  audience: text('audience'),
  startsOn: varchar('starts_on', { length: 10 }),
  endsOn: varchar('ends_on', { length: 10 }),
  guidance: text('guidance'),
  places: text('places'),
  materials: jsonb('materials').$type<{ label: string; url: string }[]>().notNull().default([]),
  coverId: integer('cover_id').references(() => media.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 20 }).notNull().default('planejada'), // planejada | ativa | encerrada
  isVaccination: boolean('is_vaccination').notNull().default(false),
  published: boolean('published').notNull().default(false),
  updatedAt: ts('updated_at').notNull().defaultNow(),
});

export const vaccines = pgTable('vaccines', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  ageGroup: varchar('age_group', { length: 200 }).notNull(),
  doses: varchar('doses', { length: 200 }),
  notes: text('notes'),
  source: varchar('source', { length: 300 }),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
});

export const orgUnits = pgTable('org_units', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id'),
  name: varchar('name', { length: 200 }).notNull(),
  kind: varchar('kind', { length: 40 }).notNull().default('setor'),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const people = pgTable('people', {
  id: serial('id').primaryKey(),
  orgUnitId: integer('org_unit_id').references(() => orgUnits.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 200 }).notNull(),
  role: varchar('role', { length: 200 }).notNull(),
  duties: text('duties'),
  email: varchar('email', { length: 200 }),
  phone: varchar('phone', { length: 60 }),
  photoId: integer('photo_id').references(() => media.id, { onDelete: 'set null' }),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
});

export const contactChannels = pgTable('contact_channels', {
  id: serial('id').primaryKey(),
  group: varchar('group_name', { length: 60 }).notNull().default('canal'), // canal | setor
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  phone: varchar('phone', { length: 60 }),
  email: varchar('email', { length: 200 }),
  url: varchar('url', { length: 500 }),
  hours: varchar('hours', { length: 200 }),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const socialProfiles = pgTable('social_profiles', {
  id: serial('id').primaryKey(),
  network: varchar('network', { length: 30 }).notNull(), // instagram | facebook | youtube
  label: varchar('label', { length: 120 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const socialPosts = pgTable('social_posts', {
  id: serial('id').primaryKey(),
  network: varchar('network', { length: 30 }).notNull().default('instagram'),
  caption: text('caption'),
  url: varchar('url', { length: 500 }).notNull(),
  imageId: integer('image_id').references(() => media.id, { onDelete: 'set null' }),
  postedOn: varchar('posted_on', { length: 10 }),
  source: varchar('source', { length: 20 }).notNull().default('manual'), // manual | api
  externalId: varchar('external_id', { length: 100 }),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [uniqueIndex('social_posts_ext_idx').on(t.network, t.externalId)]);

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  email: varchar('email', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 60 }),
  subject: varchar('subject', { length: 200 }).notNull(),
  message: text('message').notNull(),
  emailed: boolean('emailed').notNull().default(false),
  read: boolean('read').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const consentRecords = pgTable('consent_records', {
  id: serial('id').primaryKey(),
  version: varchar('version', { length: 20 }).notNull(),
  necessary: boolean('necessary').notNull().default(true),
  performance: boolean('performance').notNull().default(false),
  thirdParty: boolean('third_party').notNull().default(false),
  createdAt: ts('created_at').notNull().defaultNow(),
});

export const rateLimits = pgTable('rate_limits', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 200 }).notNull(),
  createdAt: ts('created_at').notNull().defaultNow(),
}, (t) => [index('rate_limits_key_idx').on(t.key, t.createdAt)]);
