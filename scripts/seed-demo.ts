// Dados FICTÍCIOS para demonstração. Rode: npm run db:seed:demo
// Idempotente: pode ser executado de novo (por exemplo, depois de colocar imagens em demo-images/).
// Tudo o que este script cria é inventado para apresentação — marca `demo_mode=1` e o site exibe um aviso.
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import * as s from '../src/db/schema';
import { slugify } from '../src/lib/slug';

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? 'postgres://portal:portal@localhost:5432/portal' });
const db = drizzle(pool, { schema: s });
const IMG_DIR = path.resolve('demo-images');
const STORAGE = path.resolve(process.env.STORAGE_DIR ?? './storage');
const WIDTHS = [480, 960, 1600];

/** Importa demo-images/<nome>.(jpg|jpeg|png|webp) para a mídia do portal. Sem arquivo → null (o site usa o brasão). */
async function img(name: string, alt: string): Promise<number | null> {
  const file = ['jpg', 'jpeg', 'png', 'webp'].map((e) => path.join(IMG_DIR, `${name}.${e}`)).find(existsSync);
  if (!file) return null;
  const [dup] = await db.select().from(s.media).where(eq(s.media.originalName, `demo:${name}`));
  if (dup) return dup.id;
  const buf = await sharp(file).rotate().toBuffer();
  const meta = await sharp(buf).metadata();
  const id = randomUUID();
  for (const w of WIDTHS) {
    const out = await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    await mkdir(path.join(STORAGE, 'images'), { recursive: true });
    await writeFile(path.join(STORAGE, 'images', `${id}-${w}.webp`), out);
  }
  const [row] = await db.insert(s.media).values({ kind: 'image', originalName: `demo:${name}`, storageKey: `images/${id}`, mime: 'image/webp', size: buf.length, width: meta.width ?? null, height: meta.height ?? null, alt }).returning({ id: s.media.id });
  return row.id;
}

async function setSetting(key: string, value: string) {
  await db.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value, updatedAt: new Date() } });
}

const daysAgo = (n: number) => new Date(Date.now() - n * 864e5);

async function settingsDemo() {
  const heroId = await img('hero', 'Vista da orla de Ubatuba com profissionais de saúde em primeiro plano');
  const v: Record<string, string> = {
    demo_mode: '1',
    headquarters_address: 'Rua de Demonstração, 100 — Centro, Ubatuba/SP',
    main_phone: '(12) 0000-0000',
    main_email: 'saude@exemplo.gov.br',
    opening_hours: 'Segunda a sexta-feira, das 8h às 17h',
    about_text: 'A Secretaria Municipal de Saúde planeja, coordena e executa as ações de saúde pública do município, garantindo acesso universal, integral e gratuito pelo SUS.',
    mission: 'Promover a saúde e a qualidade de vida da população de Ubatuba, com atendimento humanizado, ações de prevenção e vigilância, e gestão transparente dos recursos públicos.',
    attributions: 'Gerir a rede municipal de atenção básica, urgência e especializada;\nExecutar a vigilância epidemiológica, sanitária e ambiental;\nCoordenar a imunização e as campanhas de saúde;\nGarantir a assistência farmacêutica;\nSecretariar o Conselho Municipal de Saúde.',
    lgpd_controller: 'Município de Ubatuba — Secretaria Municipal de Saúde (dados de demonstração)',
    lgpd_dpo_name: 'Encarregado(a) de demonstração',
    lgpd_dpo_email: 'lgpd@exemplo.gov.br',
    ombudsman_url: '/contatos#ouvidoria',
  };
  if (heroId) v.hero_image_id = String(heroId);
  for (const [k, val] of Object.entries(v)) await setSetting(k, val);
}

async function unitsDemo() {
  const cats = await db.select().from(s.unitCategories);
  const cat = (frag: string) => cats.find((c) => c.name.includes(frag))?.id ?? null;
  const svc = await db.select().from(s.services);
  const sv = (...names: string[]) => svc.filter((x) => names.some((n) => x.name.toLowerCase().includes(n))).map((x) => x.id);
  const list = [
    { name: 'UBS Centro', img: 'unidade-ubs-centro', cat: 'UBS', nb: 'Centro', addr: 'Rua de Demonstração, 100 — Centro', lat: -23.4336, lng: -45.0838, hours: 'Segunda a sexta, das 7h às 17h', mgr: 'Enf. Patrícia Gomes', services: sv('consulta', 'vacina', 'pré-natal', 'bucal', 'hipertensão'), desc: 'Unidade Básica de Saúde com clínica geral, enfermagem, sala de vacina e saúde bucal.' },
    { name: 'ESF Itaguá', img: 'unidade-esf-itagua', cat: 'ESF', nb: 'Itaguá', addr: 'Avenida Exemplo, 250 — Itaguá', lat: -23.4466, lng: -45.0689, hours: 'Segunda a sexta, das 7h às 17h', mgr: 'Dr. Bruno Teixeira', services: sv('consulta', 'vacina', 'pré-natal', 'hipertensão'), desc: 'Equipe de Saúde da Família com visitas domiciliares e acompanhamento de gestantes e crônicos.' },
    { name: 'UBS Perequê-Açu', img: null, cat: 'UBS', nb: 'Perequê-Açu', addr: 'Rua Modelo, 45 — Perequê-Açu', lat: -23.4045, lng: -45.097, hours: 'Segunda a sexta, das 7h às 16h', mgr: 'Enf. Camila Rocha', services: sv('consulta', 'vacina', 'farmácia'), desc: 'Atendimento de rotina e vacinação para os moradores da região norte.' },
    { name: 'UPA 24h Ubatuba', img: 'unidade-upa', cat: 'Pronto', nb: 'Estufa II', addr: 'Avenida Demonstração, 1000 — Estufa II', lat: -23.4398, lng: -45.0774, hours: 'Atendimento 24 horas, todos os dias', mgr: 'Dr. Marcelo Tavares', services: sv('urgência', 'exames'), desc: 'Pronto atendimento para urgências e emergências, com classificação de risco.' },
    { name: 'CAPS Ubatuba', img: 'unidade-caps', cat: 'CAPS', nb: 'Centro', addr: 'Rua Exemplo, 77 — Centro', lat: -23.435, lng: -45.082, hours: 'Segunda a sexta, das 8h às 17h', mgr: 'Psic. Luciana Prado', services: sv('saúde mental'), desc: 'Centro de Atenção Psicossocial: acolhimento, terapias em grupo e acompanhamento individual.' },
    { name: 'Farmácia Municipal', img: 'unidade-farmacia', cat: 'Farmácia', nb: 'Centro', addr: 'Rua Modelo, 12 — Centro', lat: -23.4325, lng: -45.086, hours: 'Segunda a sexta, das 8h às 16h', mgr: 'Farm. Ricardo Alves', services: sv('farmácia'), desc: 'Dispensação de medicamentos da rede municipal mediante receita do SUS.' },
    { name: 'Vigilância em Saúde', img: null, cat: 'Vigilância', nb: 'Centro', addr: 'Rua de Demonstração, 210 — Centro', lat: -23.431, lng: -45.085, hours: 'Segunda a sexta, das 8h às 17h', mgr: 'Dra. Cláudia Mendes', services: sv('vigilância'), desc: 'Vigilâncias epidemiológica e sanitária, controle de zoonoses e de vetores.' },
    { name: 'ESF Maranduba', img: null, cat: 'ESF', nb: 'Maranduba', addr: 'Estrada Exemplo, km 3 — Maranduba', lat: -23.5148, lng: -45.1296, hours: 'Segunda a sexta, das 7h às 16h', mgr: 'Dra. Isabela Furtado', services: sv('consulta', 'vacina', 'pré-natal'), desc: 'Atendimento de saúde da família para a região sul do município.' },
  ];
  for (const u of list) {
    const slug = slugify(u.name);
    const [ex] = await db.select().from(s.units).where(eq(s.units.slug, slug));
    const photoId = u.img ? await img(u.img, `Fachada da ${u.name}`) : null;
    const base = { name: u.name, slug, categoryId: cat(u.cat), neighborhood: u.nb, address: u.addr, cep: '11680-000', phone: '(12) 0000-0' + String(10 + list.indexOf(u)).padStart(3, '0'), email: `${slug}@exemplo.gov.br`, hours: u.hours, manager: u.mgr, description: u.desc, lat: u.lat, lng: u.lng, coordsVerified: true, active: true };
    let id: number;
    if (ex) { id = ex.id; await db.update(s.units).set({ ...base, photoId: photoId ?? ex.photoId }).where(eq(s.units.id, id)); }
    else id = (await db.insert(s.units).values({ ...base, photoId }).returning({ id: s.units.id }))[0].id;
    await db.delete(s.unitServices).where(eq(s.unitServices.unitId, id));
    if (u.services.length) await db.insert(s.unitServices).values(u.services.map((serviceId) => ({ unitId: id, serviceId })));
  }
}

async function peopleDemo() {
  const orgs = await db.select().from(s.orgUnits);
  const o = (frag: string) => orgs.find((x) => x.name.toLowerCase().includes(frag.toLowerCase()))?.id ?? null;
  const people: [string, string, string | null, string, string][] = [
    ['Dra. Helena Marques', 'Secretária Municipal de Saúde', 'Secretaria Municipal de Saúde', 'Coordena a política municipal de saúde e representa a Secretaria.', 'helena.marques'],
    ['Rafael Duarte', 'Chefe de Gabinete', 'Gabinete', 'Apoia a Secretária na agenda, nos despachos e na articulação entre departamentos.', 'rafael.duarte'],
    ['Marta Silveira', 'Ouvidora da Saúde', 'Ouvidoria', 'Recebe e encaminha elogios, sugestões, reclamações e denúncias.', 'ouvidoria'],
    ['Paulo Nogueira', 'Assessor de Comunicação', 'Assessoria de Comunicação', 'Divulga comunicados, campanhas e orientações à população.', 'comunicacao'],
    ['Ana Beatriz Lemos', 'Presidente do Conselho', 'Conselho Municipal', 'Preside as reuniões e o controle social das ações de saúde.', 'conselho'],
    ['Dr. Carlos Eduardo Pires', 'Diretor do Departamento', 'Departamento de Atenção Básica', 'Coordena UBS e equipes de Saúde da Família.', 'atencao.basica'],
    ['Enf. Juliana Castro', 'Coordenadora de Imunização', 'Imunização', 'Organiza o calendário de vacinação e as campanhas.', 'imunizacao'],
    ['Dra. Renata Fonseca', 'Coordenadora de Saúde Bucal', 'Saúde Bucal', 'Gerencia o atendimento odontológico da rede.', 'saude.bucal'],
    ['Dr. Marcelo Tavares', 'Diretor do Departamento', 'Departamento de Urgência', 'Coordena a UPA 24h, a regulação e as especialidades.', 'urgencia'],
    ['Psic. Luciana Prado', 'Coordenadora do CAPS', 'Saúde mental', 'Coordena o cuidado em saúde mental e atenção psicossocial.', 'caps'],
    ['Dra. Cláudia Mendes', 'Diretora de Vigilância em Saúde', 'Departamento de Vigilância', 'Responde pelas vigilâncias epidemiológica, sanitária e ambiental.', 'vigilancia'],
    ['Enf. Thiago Ramos', 'Coordenador de Epidemiologia', 'Vigilância Epidemiológica', 'Monitora doenças e agravos de notificação.', 'epidemiologia'],
    ['Fernanda Lopes', 'Fiscal-chefe', 'Vigilância Sanitária', 'Orienta e fiscaliza estabelecimentos e serviços de interesse da saúde.', 'visa'],
    ['Farm. Ricardo Alves', 'Responsável técnico', 'Farmácia municipal', 'Garante a dispensação e o controle de medicamentos.', 'farmacia'],
    ['Sérgio Batista', 'Diretor do Departamento', 'Departamento Administrativo', 'Coordena planejamento, compras, contratos e gestão de pessoas.', 'administrativo'],
  ];
  for (const [name, role, unit, duties, mail] of people) {
    const orgUnitId = o(unit ?? '');
    const [ex] = await db.select().from(s.people).where(and(eq(s.people.name, name), eq(s.people.role, role)));
    const vals = { name, role, duties, orgUnitId, email: `${mail}@exemplo.gov.br`, phone: '(12) 0000-0000', active: true, sortOrder: 0 };
    if (ex) await db.update(s.people).set(vals).where(eq(s.people.id, ex.id));
    else await db.insert(s.people).values(vals);
  }
  const desc: Record<string, string> = {
    'Gabinete': 'Apoio direto à Secretária, agenda, protocolo e articulação institucional.',
    'Conselho Municipal': 'Instância de controle social, com representantes de usuários, trabalhadores e gestores.',
    'Departamento de Atenção Básica': 'Porta de entrada do SUS: UBS, Saúde da Família, saúde bucal e imunização.',
    'Departamento de Urgência': 'Pronto atendimento, especialidades, regulação e saúde mental.',
    'Departamento de Vigilância': 'Vigilância epidemiológica, sanitária e controle de zoonoses e vetores.',
    'Assistência Farmacêutica': 'Seleção, programação e dispensação de medicamentos essenciais.',
    'Departamento Administrativo': 'Planejamento, orçamento, Fundo Municipal de Saúde, compras e pessoas.',
  };
  for (const [frag, text] of Object.entries(desc)) { const id = o(frag); if (id) await db.update(s.orgUnits).set({ description: text }).where(eq(s.orgUnits.id, id)); }
}

async function postsDemo() {
  const items = [
    { t: 'Vacinação contra a gripe segue até o fim do mês em todas as UBS', sub: 'Idosos, gestantes, crianças e profissionais de saúde são os grupos prioritários.', cat: 'Vacinação', img: 'noticia-vacinacao', days: 2, feat: 1, notice: false,
      body: '<p>A Secretaria Municipal de Saúde lembra que a vacinação contra a gripe continua nas unidades de saúde do município, de segunda a sexta-feira.</p><p>Leve um documento com foto e a caderneta de vacinação. A vacina é gratuita e está disponível para os grupos prioritários definidos pelo Ministério da Saúde.</p>' },
    { t: 'Mutirão contra a dengue percorre bairros da região central', sub: 'Equipes orientam moradores sobre eliminação de criadouros do mosquito.', cat: 'Vigilância', img: 'noticia-dengue', days: 5, feat: 0, notice: false,
      body: '<p>Agentes de endemias e da Vigilância Sanitária visitam residências e comércios para orientar a população e eliminar focos do mosquito <em>Aedes aegypti</em>.</p><p>Pratos de plantas, calhas e pneus são os principais pontos de atenção. Mantenha o quintal limpo e sem água parada.</p>' },
    { t: 'UBS Centro amplia atendimento às quintas-feiras', sub: 'Novo horário facilita o acesso de quem trabalha durante a semana.', cat: 'Atenção Básica', img: 'noticia-ubs', days: 9, feat: 0, notice: false,
      body: '<p>A UBS Centro passa a atender até as 19h às quintas-feiras, com consultas, vacinação e coleta de exames.</p><p>Os agendamentos podem ser feitos na própria unidade ou pelo telefone institucional.</p>' },
    { t: 'Novembro Azul: unidades oferecem orientação sobre a saúde do homem', sub: 'Consultas e exames de rotina para prevenção do câncer de próstata.', cat: 'Campanha', img: 'noticia-novembro-azul', days: 12, feat: 0, notice: false,
      body: '<p>Durante todo o mês, as unidades de saúde promovem ações de conscientização sobre os cuidados com a saúde do homem.</p><p>Procure a UBS mais próxima, converse com a equipe e mantenha os exames em dia.</p>' },
    { t: 'Comunicado: atendimento no feriado de 20 de novembro', sub: 'Somente a UPA 24h funcionará normalmente.', cat: 'Comunicado', img: null, days: 1, feat: 2, notice: true,
      body: '<p>Em razão do feriado, as UBS e ESF não terão expediente. A <strong>UPA 24h</strong> segue com atendimento ininterrupto.</p><p>Em caso de emergência, ligue para o SAMU <strong>192</strong>.</p>' },
  ];
  for (const p of items) {
    const slug = slugify(p.t);
    const coverId = p.img ? await img(p.img, p.t) : null;
    const [ex] = await db.select().from(s.posts).where(eq(s.posts.slug, slug));
    const vals = { title: p.t, subtitle: p.sub, slug, body: p.body, category: p.cat, authorName: 'Assessoria de Comunicação', sector: 'Secretaria Municipal de Saúde', status: 'publicado', publishAt: daysAgo(p.days), featured: p.feat, isNotice: p.notice };
    if (ex) await db.update(s.posts).set({ ...vals, coverId: coverId ?? ex.coverId }).where(eq(s.posts.id, ex.id));
    else await db.insert(s.posts).values({ ...vals, coverId });
  }
}

async function campaignsDemo() {
  const info: Record<string, { img: string | null; status: string; objectives: string; audience: string; guidance: string; places: string }> = {
    'outubro-rosa-2026': { img: 'campanha-outubro-rosa', status: 'encerrada', objectives: 'Ampliar o acesso à mamografia e incentivar o autoexame e a consulta de rotina.', audience: 'Mulheres a partir dos 40 anos (ou conforme orientação médica).', guidance: 'Procure a UBS mais próxima para agendar a mamografia.', places: 'UBS e ESF da rede municipal.' },
    'novembro-azul-2026': { img: 'campanha-novembro-azul', status: 'ativa', objectives: 'Conscientizar sobre a saúde do homem e o diagnóstico precoce do câncer de próstata.', audience: 'Homens a partir dos 50 anos (45 com histórico familiar).', guidance: 'Converse com a equipe da UBS sobre exames e hábitos de vida saudáveis.', places: 'UBS Centro, ESF Itaguá, UBS Perequê-Açu e ESF Maranduba.' },
    'dezembro-vermelho-2026': { img: 'campanha-dezembro-vermelho', status: 'planejada', objectives: 'Ampliar a testagem e a prevenção do HIV/aids e de outras IST.', audience: 'População em geral, com foco em jovens e adultos.', guidance: 'Testes rápidos e preservativos são gratuitos nas unidades de saúde.', places: 'Todas as UBS e o CAPS.' },
  };
  for (const [slug, c] of Object.entries(info)) {
    const [ex] = await db.select().from(s.campaigns).where(eq(s.campaigns.slug, slug));
    if (!ex) continue;
    const coverId = c.img ? await img(c.img, `Arte da campanha ${ex.title}`) : null;
    await db.update(s.campaigns).set({ status: c.status, objectives: c.objectives, audience: c.audience, guidance: c.guidance, places: c.places, coverId: coverId ?? ex.coverId, published: true }).where(eq(s.campaigns.id, ex.id));
  }
  const slug = 'vacinacao-contra-a-gripe-2026';
  const [ex] = await db.select().from(s.campaigns).where(eq(s.campaigns.slug, slug));
  const coverId = await img('campanha-gripe', 'Arte da campanha de vacinação contra a gripe');
  const vals = { title: 'Vacinação contra a gripe 2026', slug, summary: 'Vacine-se nas unidades de saúde. Idosos, gestantes, crianças e profissionais de saúde são prioridade.', objectives: 'Proteger a população contra a gripe e suas complicações.', audience: 'Grupos prioritários definidos pelo Ministério da Saúde.', startsOn: '2026-11-01', endsOn: '2026-11-30', guidance: 'Leve documento com foto e a caderneta de vacinação.', places: 'Todas as UBS e ESF, de segunda a sexta.', status: 'ativa', isVaccination: true, published: true };
  if (ex) await db.update(s.campaigns).set({ ...vals, coverId: coverId ?? ex.coverId }).where(eq(s.campaigns.id, ex.id));
  else await db.insert(s.campaigns).values({ ...vals, coverId });
}

async function contactsDemo() {
  const have = await db.select().from(s.contactChannels).where(eq(s.contactChannels.group, 'setor'));
  if (!have.length) {
    await db.insert(s.contactChannels).values([
      { group: 'setor', name: 'Gabinete da Secretária', phone: '(12) 0000-0001', email: 'gabinete@exemplo.gov.br', hours: 'Seg. a sex., 8h às 17h', sortOrder: 0 },
      { group: 'setor', name: 'Ouvidoria da Saúde', phone: '(12) 0000-0002', email: 'ouvidoria@exemplo.gov.br', hours: 'Seg. a sex., 8h às 17h', sortOrder: 1 },
      { group: 'setor', name: 'Vigilância Epidemiológica', phone: '(12) 0000-0003', email: 'epidemiologia@exemplo.gov.br', hours: 'Seg. a sex., 8h às 17h', sortOrder: 2 },
      { group: 'setor', name: 'Vigilância Sanitária', phone: '(12) 0000-0004', email: 'visa@exemplo.gov.br', hours: 'Seg. a sex., 8h às 17h', sortOrder: 3 },
      { group: 'setor', name: 'Imunização', phone: '(12) 0000-0005', email: 'imunizacao@exemplo.gov.br', hours: 'Seg. a sex., 8h às 16h', sortOrder: 4 },
    ]);
  }
  await db.update(s.contactChannels).set({ email: 'ouvidoria@exemplo.gov.br', phone: '(12) 0000-0002' }).where(and(eq(s.contactChannels.name, 'Ouvidoria da Saúde'), eq(s.contactChannels.group, 'canal'), isNull(s.contactChannels.email)));
}

async function socialDemo() {
  const profiles = await db.select().from(s.socialProfiles);
  if (!profiles.length) {
    await db.insert(s.socialProfiles).values([
      { network: 'instagram', label: 'Instagram da Secretaria', url: 'https://www.instagram.com/', sortOrder: 0 },
      { network: 'facebook', label: 'Facebook da Secretaria', url: 'https://www.facebook.com/', sortOrder: 1 },
      { network: 'youtube', label: 'Canal no YouTube', url: 'https://www.youtube.com/', sortOrder: 2 },
    ]);
  }
  const posts = [
    ['social-1', 'Vacina é proteção! Procure sua UBS e atualize a caderneta. 💉', 'Chamada de vacinação'],
    ['social-2', 'Novembro Azul: cuide da sua saúde, converse com a equipe da UBS. 💙', 'Arte do Novembro Azul'],
    ['social-3', 'Mutirão contra a dengue: elimine água parada no seu quintal. 🦟', 'Orientações contra a dengue'],
  ];
  for (const [i, [name, caption, alt]] of posts.entries()) {
    const url = `https://www.instagram.com/p/demo${i + 1}/`;
    const [ex] = await db.select().from(s.socialPosts).where(eq(s.socialPosts.url, url));
    const imageId = await img(name, alt);
    if (ex) await db.update(s.socialPosts).set({ imageId: imageId ?? ex.imageId, caption }).where(eq(s.socialPosts.id, ex.id));
    else await db.insert(s.socialPosts).values({ network: 'instagram', caption, url, imageId, postedOn: daysAgo(i + 1).toISOString().slice(0, 10), source: 'manual' });
  }
}

async function main() {
  await settingsDemo();
  await unitsDemo();
  await peopleDemo();
  await postsDemo();
  await campaignsDemo();
  await contactsDemo();
  await socialDemo();
  const found = await db.select({ n: s.media.originalName }).from(s.media).where(inArray(s.media.kind, ['image']));
  console.log(`Demonstração pronta. Imagens importadas: ${found.filter((f) => f.n.startsWith('demo:')).length} (coloque arquivos em demo-images/ e rode de novo para adicionar mais).`);
}

main().then(() => pool.end()).catch((e) => { console.error(e); process.exit(1); });
