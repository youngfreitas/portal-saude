import path from 'node:path';
import PDFDocument from 'pdfkit';
import { orgTree } from '@/lib/queries';

export const dynamic = 'force-dynamic';

const font = (pkg: string, file: string) => path.join(process.cwd(), 'node_modules/@fontsource', pkg, 'files', file);

export async function GET() {
  const { roots } = await orgTree();
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'Organograma — Secretaria Municipal de Saúde de Ubatuba' } });
  doc.registerFont('display', font('raleway', 'raleway-latin-700-normal.woff'));
  doc.registerFont('body', font('open-sans', 'open-sans-latin-400-normal.woff'));
  doc.registerFont('bodyBold', font('open-sans', 'open-sans-latin-600-normal.woff'));
  const chunks: Buffer[] = [];
  doc.on('data', (c) => chunks.push(c));
  const done = new Promise<Buffer>((res) => doc.on('end', () => res(Buffer.concat(chunks))));

  doc.rect(0, 0, doc.page.width, 90).fill('#003a6e');
  try { doc.image(path.join(process.cwd(), 'public/assets/brasao-ubatuba.png'), 50, 18, { height: 54 }); } catch {}
  doc.fillColor('#ffffff').font('body').fontSize(9).text('PREFEITURA MUNICIPAL DE UBATUBA', 120, 26, { characterSpacing: 1 });
  doc.font('display').fontSize(18).text('Organograma da Secretaria de Saúde', 120, 42);
  doc.fillColor('#1b1f23').y = 120;
  doc.x = 50;

  type N = (typeof roots)[number];
  const walk = (n: N, depth: number) => {
    if (doc.y > doc.page.height - 90) doc.addPage();
    const x = 50 + depth * 22;
    doc.x = x;
    doc.font(depth === 0 ? 'display' : depth === 1 ? 'bodyBold' : 'body').fontSize(depth === 0 ? 14 : 11).fillColor(depth === 0 ? '#005aab' : '#1b1f23');
    doc.text((depth ? '• ' : '') + n.name, x, doc.y, { width: doc.page.width - x - 50 });
    n.people.forEach((p) => doc.font('body').fontSize(9).fillColor('#63707c').text(`${p.role}: ${p.name}`, x + 12, doc.y, { width: doc.page.width - x - 62 }));
    doc.moveDown(0.4);
    n.children.forEach((c) => walk(c, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));

  doc.font('body').fontSize(8).fillColor('#63707c').text(`Gerado em ${new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}. Estrutura sujeita à confirmação oficial.`, 50, doc.page.height - 60, { width: doc.page.width - 100 });
  doc.end();
  const buf = await done;
  return new Response(new Uint8Array(buf), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': 'inline; filename="organograma-saude-ubatuba.pdf"', 'Cache-Control': 'public, max-age=300' } });
}
