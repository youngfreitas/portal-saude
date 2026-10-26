import 'server-only';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';

/** Adaptador de armazenamento. Hoje: disco local. Para S3/Supabase, implemente esta interface e troque `storage`. */
export interface StorageAdapter {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  remove(key: string): Promise<void>;
}

const root = () => path.resolve(process.env.STORAGE_DIR ?? './storage');

function safe(key: string): string {
  const full = path.resolve(root(), key);
  if (!full.startsWith(root() + path.sep)) throw new Error('Caminho inválido');
  return full;
}

export const storage: StorageAdapter = {
  async put(key, data) {
    const file = safe(key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
  },
  async get(key) {
    try {
      return await readFile(safe(key));
    } catch {
      return null;
    }
  },
  async remove(key) {
    await rm(safe(key), { force: true });
  },
};
