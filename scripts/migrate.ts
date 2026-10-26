import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://portal:portal@localhost:5432/portal' });
await migrate(drizzle(pool), { migrationsFolder: './drizzle' });
console.log('Migrações aplicadas.');
await pool.end();
