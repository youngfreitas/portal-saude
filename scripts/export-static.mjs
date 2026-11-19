// Gera uma cópia ESTÁTICA do portal (HTML + arquivos) para hospedar na Cloudflare Pages.
// Requer o site rodando em produção (next start). Uso: scripts/export-demo.sh
import { mkdir, writeFile, readFile, cp, rm, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { zipSync } from 'fflate';

const BASE = (process.env.EXPORT_BASE ?? 'http://localhost:3100').replace(/\/$/, '');
const OUT = path.resolve(process.env.EXPORT_OUT ?? 'dist-demo');
const ZIP = path.resolve(process.env.EXPORT_ZIP ?? 'portal-saude-demo-cloudflare.zip');
const SKIP_PREFIX = ['/admin', '/api', '/_next', '/media', '/assets', '/icons'];
const PDF_FROM = '/secretaria/organograma/pdf';
const PDF_TO = '/secretaria/organograma/organograma-secretaria-saude.pdf';

const log = (...a) => console.log(...a);
const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/';
const get = (p) => fetch(BASE + p, { redirect: 'follow' });
async function save(rel, data) { const f = path.join(OUT, rel); await mkdir(path.dirname(f), { recursive: true }); await writeFile(f, data); }
const textOf = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();
const meta = (html, name) => (html.match(new RegExp(`<meta[^>]+name="${name}"[^>]+content="([^"]*)"`)) ?? [])[1] ?? '';
const title = (html) => ((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) ?? [])[1] ?? (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? '').replace(/<[^>]+>/g, '').replace(/\s*\|\s*Saúde Ubatuba$/, '').trim();

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp('public', OUT, { recursive: true });
await cp('.next/static', path.join(OUT, '_next/static'), { recursive: true });

const mediaWanted = new Map(); // url original -> arquivo
const rewrite = (html) => html
  .replace(/\/media\/(\d+)\?w=(\d+)/g, (m, id, w) => { mediaWanted.set(m, `/media/${id}-${w}.webp`); return `/media/${id}-${w}.webp`; })
  .replace(/\/media\/(\d+)(?![\d\-?.])/g, (m, id) => { mediaWanted.set(m, `/media/${id}`); return `/media/${id}.__EXT__`; })
  .replaceAll(PDF_FROM, PDF_TO);

const seen = new Set();
const queue = ['/'];
const pages = [];
while (queue.length) {
  const route = queue.shift();
  if (seen.has(route)) continue;
  seen.add(route);
  const res = await get(route);
  const ct = res.headers.get('content-type') ?? '';
  if (!res.ok || !ct.includes('text/html')) { log('  ignorado', route, res.status); continue; }
  const html = await res.text();
  for (const m of html.matchAll(/href="(\/[^"#?]*)[^"]*"/g)) {
    const p = norm(m[1].replace(/&amp;/g, '&'));
    if (p.startsWith('//') || /\.[a-z0-9]{2,5}$/i.test(p) || SKIP_PREFIX.some((s) => p === s || p.startsWith(s + '/')) || p === PDF_FROM) continue;
    if (!seen.has(p)) queue.push(p);
  }
  pages.push({ route, html });
  log('  página', route);
}

// Arquivos de mídia referenciados (imagens redimensionadas e eventuais PDFs).
const fileExt = (ct) => (ct.includes('pdf') ? 'pdf' : ct.includes('webp') ? 'webp' : ct.includes('png') ? 'png' : ct.includes('jpeg') ? 'jpg' : 'bin');
const extFor = new Map();
let out = pages.map((p) => ({ ...p, html: rewrite(p.html) }));
for (const [orig, target] of mediaWanted) {
  const res = await get(orig);
  if (!res.ok) { log('  mídia falhou', orig, res.status); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  if (target.endsWith('.webp')) await save(target, buf);
  else { const ext = fileExt(res.headers.get('content-type') ?? ''); extFor.set(target, ext); await save(`${target}.${ext}`, buf); }
}
out = out.map((p) => ({ ...p, html: p.html.replace(/(\/media\/\d+)\.__EXT__/g, (m, base) => `${base}.${extFor.get(base) ?? 'bin'}`) }));

// PDF do organograma (gerado no servidor no site real).
const pdf = await get(PDF_FROM);
if (pdf.ok) await save(PDF_TO, Buffer.from(await pdf.arrayBuffer())); else log('  PDF do organograma indisponível', pdf.status);

// Páginas HTML + índice de busca.
const index = [];
const groupOf = (r) => (r.startsWith('/unidades/') && r !== '/unidades/mapa' ? 'Unidades' : r.startsWith('/servicos/') && !['/servicos/vacinacao', '/servicos/tratamentos'].includes(r) ? 'Serviços' : r.startsWith('/campanhas/') ? 'Campanhas' : r.startsWith('/noticias/') ? 'Notícias' : null);
for (const { route, html } of out) {
  const tag = '<script src="/demo-static.js" defer></script>';
  const page = html.includes('</body>') ? html.replace('</body>', tag + '</body>') : html + tag;
  await save(route === '/' ? 'index.html' : `${route.slice(1)}/index.html`, page);
  const g = groupOf(route);
  if (g) index.push({ g, t: title(html), u: route, d: meta(html, 'description').slice(0, 140), x: textOf((html.match(/<main[\s\S]*?<\/main>/) ?? [html])[0]).slice(0, 4000) });
}
await save('search-index.json', JSON.stringify(index));

// Página 404 e arquivos auxiliares (robots/sitemap).
const nf = await get('/pagina-nao-encontrada-404');
if (nf.status === 404) { const h = rewrite(await nf.text()); await save('404.html', h.replace('</body>', '<script src="/demo-static.js" defer></script></body>')); }
for (const f of ['/robots.txt', '/sitemap.xml']) { const r = await get(f); if (r.ok) await save(f.slice(1), Buffer.from(await r.arrayBuffer())); }
for (const f of ['_worker.js', '_headers', 'demo-static.js']) await cp(path.join('scripts/cloudflare', f), path.join(OUT, f));
await writeFile(path.join(OUT, 'LEIA-ME.txt'), `Portal Saúde Ubatuba — versão estática de demonstração\n\nCloudflare Pages > Create application > Pages > Upload assets > envie ESTE .zip (ou a pasta já extraída).\nDados fictícios. Veja docs/CLOUDFLARE.md no repositório para detalhes e limitações.\n`);

// .zip (arquivos na raiz, como a Cloudflare espera)
const files = {};
async function walk(dir, rel = '') {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name), r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) await walk(abs, r); else files[r] = new Uint8Array(await readFile(abs));
  }
}
await walk(OUT);
await writeFile(ZIP, zipSync(files, { level: 6 }));
const mb = ((await stat(ZIP)).size / 1048576).toFixed(1);
log(`\nPronto: ${pages.length} páginas, ${mediaWanted.size} arquivos de mídia, ${Object.keys(files).length} arquivos no total.\nPasta: ${OUT}\nZIP:   ${ZIP} (${mb} MB)`);
