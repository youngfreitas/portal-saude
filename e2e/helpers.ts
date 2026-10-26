import { Pool } from 'pg';
import { hashPassword } from '../src/lib/password';

export const ADMIN = { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com', password: process.env.SEED_ADMIN_PASSWORD ?? 'Troque-esta-senha-123' };
export const EDITOR = { email: 'editor.e2e@example.com', password: 'Editor-senha-123', name: 'Editora E2E', role: 'editor' };
export const VIEWER = { email: 'viewer.e2e@example.com', password: 'Viewer-senha-123', name: 'Leitor E2E', role: 'visualizador' };

export const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://portal:portal@localhost:5432/portal' });

export async function ensureUser(u: { email: string; password: string; name: string; role: string }) {
  await pool.query('delete from users where email=$1', [u.email]);
  await pool.query('insert into users (name,email,password_hash,role,active) values ($1,$2,$3,$4,true)', [u.name, u.email, await hashPassword(u.password), u.role]);
}

export const PUBLIC_ROUTES = [
  '/', '/secretaria', '/secretaria/organograma', '/secretaria/chefias', '/unidades', '/unidades/mapa', '/servicos',
  '/servicos/vacinacao', '/servicos/tratamentos', '/servicos/consulta-na-atencao-basica', '/noticias', '/campanhas',
  '/campanhas/outubro-rosa-2026', '/redes-sociais', '/contatos', '/busca?q=saude', '/acessibilidade', '/privacidade',
  '/termos-de-uso', '/cookies', '/rota-que-nao-existe',
];
