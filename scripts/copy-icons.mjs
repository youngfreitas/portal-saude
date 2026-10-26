// Copia os SVGs do Lucide 0.462.0 (versão do DS) para public/icons, servidos localmente.
import { cpSync, existsSync, mkdirSync } from 'node:fs';
const src = 'node_modules/lucide-static/icons';
if (!existsSync(src)) { console.warn('lucide-static não instalado'); process.exit(0); }
mkdirSync('public/icons', { recursive: true });
cpSync(src, 'public/icons', { recursive: true });
console.log('Ícones Lucide copiados para public/icons');
