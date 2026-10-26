// Semente: apenas ESTRUTURA. Nenhum endereço, telefone, nome de responsável ou coordenada é inventado.
// Registros sem dado oficial aparecem no portal com “Informação pendente de confirmação oficial”.
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, count, sql } from 'drizzle-orm';
import * as s from '../src/db/schema';
import { hashPassword, passwordProblem } from '../src/lib/password';
import { slugify } from '../src/lib/slug';

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://portal:portal@localhost:5432/portal' });
const db = drizzle(pool, { schema: s });

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!email || !password) { console.log('SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD ausentes: administrador não criado.'); return; }
  const problem = passwordProblem(password);
  if (problem) throw new Error('SEED_ADMIN_PASSWORD fraca: ' + problem);
  const [exists] = await db.select().from(s.users).where(eq(s.users.email, email));
  if (exists) { console.log('Administrador já existe.'); return; }
  await db.insert(s.users).values({ name: process.env.SEED_ADMIN_NAME ?? 'Administrador', email, passwordHash: await hashPassword(password), role: 'administrador' });
  console.log('Administrador criado:', email);
}

async function empty(table: Parameters<typeof db.select>[0] extends never ? never : any) {
  const [{ n }] = await db.select({ n: count() }).from(table);
  return n === 0;
}

async function main() {
  await seedAdmin();

  if (await empty(s.settings)) {
    await db.insert(s.settings).values([
      { key: 'site_name', value: 'Secretaria Municipal de Saúde de Ubatuba' },
      { key: 'hero_title', value: 'Saúde pública em Ubatuba, perto de você' },
      { key: 'hero_text', value: 'Encontre unidades de saúde, serviços, campanhas e comunicados oficiais da Secretaria Municipal de Saúde.' },
      { key: 'prefeitura_url', value: 'https://www.ubatuba.sp.gov.br' },
    ]);
  }

  if (await empty(s.unitCategories)) {
    const cats = ['Unidade Básica de Saúde (UBS)', 'Estratégia Saúde da Família (ESF)', 'Pronto atendimento / UPA 24h', 'Atenção especializada', 'Saúde mental (CAPS)', 'Vigilância em Saúde', 'Farmácia', 'Outros serviços'];
    await db.insert(s.unitCategories).values(cats.map((name, i) => ({ name, slug: slugify(name), sortOrder: i })));
  }

  if (await empty(s.services)) {
    const list: { name: string; kind: string; summary: string; icon: string }[] = [
      { name: 'Consulta na atenção básica', kind: 'servico', icon: 'stethoscope', summary: 'Atendimento médico e de enfermagem de rotina nas unidades de saúde do município.' },
      { name: 'Vacinação', kind: 'servico', icon: 'syringe', summary: 'Vacinas do Calendário Nacional de Vacinação e campanhas, gratuitas pelo SUS.' },
      { name: 'Pré-natal', kind: 'servico', icon: 'baby', summary: 'Acompanhamento da gestação, com consultas, exames e orientações.' },
      { name: 'Saúde bucal', kind: 'servico', icon: 'smile', summary: 'Atendimento odontológico básico pelo SUS.' },
      { name: 'Farmácia e medicamentos', kind: 'servico', icon: 'pill', summary: 'Dispensação de medicamentos da rede municipal mediante prescrição.' },
      { name: 'Urgência e emergência', kind: 'servico', icon: 'ambulance', summary: 'Atendimento de urgência. Em emergências, ligue para o SAMU 192.' },
      { name: 'Saúde mental', kind: 'servico', icon: 'brain', summary: 'Cuidado em saúde mental na rede de atenção psicossocial.' },
      { name: 'Vigilância epidemiológica', kind: 'servico', icon: 'activity', summary: 'Monitoramento de doenças e agravos e ações de prevenção.' },
      { name: 'Vigilância sanitária', kind: 'servico', icon: 'clipboard-check', summary: 'Fiscalização e orientação sobre riscos sanitários.' },
      { name: 'Exames e diagnóstico', kind: 'servico', icon: 'microscope', summary: 'Exames laboratoriais e de imagem solicitados pela rede.' },
      { name: 'Tratamento de hipertensão e diabetes', kind: 'tratamento', icon: 'heart-pulse', summary: 'Acompanhamento contínuo de pessoas com doenças crônicas.' },
      { name: 'Tratamento de tuberculose', kind: 'tratamento', icon: 'shield-plus', summary: 'Tratamento gratuito pelo SUS, com acompanhamento até a cura.' },
      { name: 'Tratamento de hanseníase', kind: 'tratamento', icon: 'shield-plus', summary: 'Diagnóstico e tratamento gratuitos pelo SUS.' },
      { name: 'Cuidado de IST, HIV/aids e hepatites virais', kind: 'tratamento', icon: 'shield-check', summary: 'Testagem, prevenção e tratamento gratuitos pelo SUS.' },
    ];
    await db.insert(s.services).values(list.map((x, i) => ({ ...x, slug: slugify(x.name), sortOrder: i })));
  }

  if (await empty(s.vaccines)) {
    const src = 'Calendário Nacional de Vacinação — Ministério da Saúde (Programa Nacional de Imunizações). Confirmar a versão vigente.';
    const v: [string, string][] = [
      ['BCG', 'Ao nascer'], ['Hepatite B', 'Ao nascer'], ['Pentavalente (DTP + Hib + Hepatite B)', '2, 4 e 6 meses'],
      ['Poliomielite inativada (VIP)', '2, 4 e 6 meses'], ['Pneumocócica conjugada', '2 e 4 meses, com reforço aos 12 meses'],
      ['Rotavírus humano', '2 e 4 meses'], ['Meningocócica C', '3 e 5 meses, com reforço aos 12 meses'],
      ['Febre amarela', '9 meses, com reforço aos 4 anos'], ['Tríplice viral (sarampo, caxumba e rubéola)', '12 meses'],
      ['Hepatite A', '15 meses'], ['Varicela', '15 meses e 4 anos'], ['HPV', '9 a 14 anos'],
    ];
    await db.insert(s.vaccines).values(v.map(([name, ageGroup], i) => ({ name, ageGroup, source: src, sortOrder: i })));
  }

  if (await empty(s.campaigns)) {
    const c: { t: string; sum: string; a: string; b: string; st: string; vac?: boolean }[] = [
      { t: 'Janeiro Branco', sum: 'Mês de conscientização sobre a saúde mental e emocional.', a: '2026-01-01', b: '2026-01-31', st: 'encerrada' },
      { t: 'Agosto Dourado', sum: 'Mês de incentivo ao aleitamento materno.', a: '2026-08-01', b: '2026-08-31', st: 'encerrada' },
      { t: 'Setembro Amarelo', sum: 'Mês de prevenção ao suicídio e valorização da vida.', a: '2026-09-01', b: '2026-09-30', st: 'encerrada' },
      { t: 'Outubro Rosa', sum: 'Mês de conscientização sobre a prevenção e o diagnóstico precoce do câncer de mama.', a: '2026-10-01', b: '2026-10-31', st: 'ativa' },
      { t: 'Novembro Azul', sum: 'Mês de conscientização sobre a saúde do homem e o diagnóstico precoce do câncer de próstata.', a: '2026-11-01', b: '2026-11-30', st: 'planejada' },
      { t: 'Dezembro Vermelho', sum: 'Mês de mobilização na prevenção do HIV/aids e de outras infecções sexualmente transmissíveis.', a: '2026-12-01', b: '2026-12-31', st: 'planejada' },
    ];
    await db.insert(s.campaigns).values(c.map((x) => ({ title: x.t, slug: slugify(x.t + '-2026'), summary: x.sum, startsOn: x.a, endsOn: x.b, status: x.st, published: true })));
  }

  if (await empty(s.orgUnits)) {
    const ins = async (name: string, parentId: number | null, kind: string, sortOrder: number) =>
      (await db.insert(s.orgUnits).values({ name, parentId, kind, sortOrder }).returning({ id: s.orgUnits.id }))[0].id;
    const root = await ins('Secretaria Municipal de Saúde', null, 'secretaria', 0);
    const gab = await ins('Gabinete do(a) Secretário(a)', root, 'gabinete', 0);
    await ins('Ouvidoria da Saúde', gab, 'setor', 0);
    await ins('Assessoria de Comunicação', gab, 'setor', 1);
    await ins('Conselho Municipal de Saúde', root, 'colegiado', 1);
    const aps = await ins('Departamento de Atenção Básica', root, 'departamento', 2);
    await ins('Unidades Básicas e Saúde da Família', aps, 'setor', 0);
    await ins('Saúde Bucal', aps, 'setor', 1);
    await ins('Imunização', aps, 'setor', 2);
    const urg = await ins('Departamento de Urgência e Atenção Especializada', root, 'departamento', 3);
    await ins('Pronto atendimento e urgência', urg, 'setor', 0);
    await ins('Especialidades e regulação', urg, 'setor', 1);
    await ins('Saúde mental (CAPS)', urg, 'setor', 2);
    const vig = await ins('Departamento de Vigilância em Saúde', root, 'departamento', 4);
    await ins('Vigilância Epidemiológica', vig, 'setor', 0);
    await ins('Vigilância Sanitária', vig, 'setor', 1);
    await ins('Controle de Zoonoses e Vetores', vig, 'setor', 2);
    const farm = await ins('Assistência Farmacêutica', root, 'departamento', 5);
    await ins('Farmácia municipal', farm, 'setor', 0);
    const adm = await ins('Departamento Administrativo e Financeiro', root, 'departamento', 6);
    await ins('Planejamento e Fundo Municipal de Saúde', adm, 'setor', 0);
    await ins('Compras, contratos e almoxarifado', adm, 'setor', 1);
    await ins('Gestão de pessoas', adm, 'setor', 2);
  }

  if (await empty(s.contactChannels)) {
    await db.insert(s.contactChannels).values([
      { group: 'canal', name: 'SAMU — urgência e emergência', description: 'Serviço de atendimento móvel de urgência, 24 horas.', phone: '192', sortOrder: 0 },
      { group: 'canal', name: 'Disque Saúde — Ministério da Saúde', description: 'Informações e orientações sobre o SUS.', phone: '136', sortOrder: 1 },
      { group: 'canal', name: 'Ouvidoria da Saúde', description: 'Elogios, sugestões, reclamações e denúncias.', sortOrder: 2 },
      { group: 'canal', name: 'Lei de Acesso à Informação (LAI)', description: 'Pedidos de acesso à informação pública.', sortOrder: 3 },
      { group: 'canal', name: 'Portal da Prefeitura de Ubatuba', url: 'https://www.ubatuba.sp.gov.br', sortOrder: 4 },
    ]);
  }
  console.log('Semente concluída.');
}

main().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
