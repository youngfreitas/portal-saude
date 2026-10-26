import { test, expect, type Page } from '@playwright/test';
import { ADMIN, EDITOR, VIEWER, ensureUser, pool } from './helpers';

async function login(page: Page, u: { email: string; password: string }, expectOk = true) {
  await page.goto('/admin/login');
  await page.getByLabel('E-mail').fill(u.email);
  await page.getByLabel('Senha').fill(u.password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  if (expectOk) await page.waitForURL(/\/admin$/);
}

test.beforeAll(async () => {
  await ensureUser(EDITOR); await ensureUser(VIEWER);
  await pool.query("delete from posts where title like 'E2E %'");
  await pool.query("delete from units where name like 'E2E %'");
  await pool.query("delete from contact_messages where email='e2e@example.com'");
  await pool.query('delete from rate_limits'); await pool.query('delete from login_attempts');
});
test.afterAll(async () => {
  await pool.query("delete from posts where title like 'E2E %'");
  await pool.query("delete from units where name like 'E2E %'");
  await pool.query("delete from contact_messages where email='e2e@example.com'");
  await pool.query("delete from users where email like '%.e2e@example.com'");
  await pool.end();
});

test('painel exige login e rejeita senha errada', async ({ page }) => {
  await page.goto('/admin/noticias');
  await expect(page).toHaveURL(/\/admin\/login/);
  await login(page, { email: ADMIN.email, password: 'errada-errada-1' }, false);
  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible();
});

test('perfis: visualizador só lê; editor não publica nem exclui', async ({ page }) => {
  await login(page, VIEWER);
  await expect(page).toHaveURL(/\/admin$/);
  await page.goto('/admin/noticias');
  await expect(page.getByRole('link', { name: /Novo notícia/ })).toHaveCount(0);
  await page.goto('/admin/noticias/novo');
  await expect(page.getByText('Página não encontrada').or(page.getByText('This page could not be found'))).toBeVisible();
  await page.goto('/admin/usuarios');
  await expect(page).toHaveURL(/negado=1|\/admin\?/);
  await page.context().clearCookies();

  await login(page, EDITOR);
  await page.goto('/admin/noticias/novo');
  await expect(page.getByLabel('Nível de destaque')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Excluir/ })).toHaveCount(0);
  await page.goto('/admin/logs');
  await expect(page).toHaveURL(/\/admin\?/);
});

test('admin cria notícia agendada e publicada; portal respeita a data', async ({ page }) => {
  await login(page, ADMIN);
  const create = async (title: string, status: string, when?: string) => {
    await page.goto('/admin/noticias/novo');
    await page.locator('#f-title').fill(title);
    await page.locator('.ProseMirror').click();
    await page.keyboard.type('Texto de teste da notícia.');
    await page.getByLabel('Situação').selectOption(status);
    if (when) await page.getByLabel('Data e hora de publicação').fill(when);
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByText('Alterações salvas.')).toBeVisible();
  };
  await create('E2E Notícia publicada', 'publicado');
  await create('E2E Notícia agendada', 'publicado', '2099-01-01T10:00');
  await create('E2E Notícia rascunho', 'rascunho');
  await expect(page.locator('.su-badge', { hasText: 'Agendada' })).toBeVisible();

  const pub = await page.context().newPage();
  await pub.goto('/noticias');
  await expect(pub.getByRole('link', { name: 'E2E Notícia publicada' })).toBeVisible();
  await expect(pub.getByText('E2E Notícia agendada')).toHaveCount(0);
  await expect(pub.getByText('E2E Notícia rascunho')).toHaveCount(0);
  await pub.getByRole('link', { name: 'E2E Notícia publicada' }).click();
  await expect(pub.getByRole('heading', { name: 'E2E Notícia publicada' })).toBeVisible();
  const slug = await pool.query("select slug from posts where title='E2E Notícia agendada'");
  expect((await pub.goto(`/noticias/${slug.rows[0].slug}`))!.status()).toBe(404);
  const log = await pool.query("select 1 from audit_logs where action='publicar' and summary like 'E2E %'");
  expect(log.rowCount).toBeGreaterThan(0);
});

test('unidade só aparece no mapa com coordenada verificada', async ({ page }) => {
  await login(page, ADMIN);
  const make = async (name: string, verified: boolean, lat = '-23.4336', lng = '-45.0838') => {
    await page.goto('/admin/unidades/novo');
    await page.getByLabel('Nome da unidade').fill(name);
    await page.getByLabel('Latitude').fill(lat);
    await page.getByLabel('Longitude').fill(lng);
    if (verified) await page.getByLabel(/Coordenadas verificadas/).check();
    await page.getByRole('button', { name: 'Salvar' }).click();
  };
  await make('E2E Unidade fora', false, '-10', '-45');
  await expect(page.getByText(/fora da região de Ubatuba/)).toBeVisible();
  await make('E2E Unidade sem verificação', false);
  await expect(page.getByText('Alterações salvas.')).toBeVisible();
  await make('E2E Unidade verificada', true);
  await expect(page.getByText('Alterações salvas.')).toBeVisible();

  const pub = await page.context().newPage();
  await pub.goto('/unidades/mapa');
  await expect(pub.getByRole('button', { name: /E2E Unidade verificada/ })).toBeVisible();
  await expect(pub.getByText('E2E Unidade sem verificação')).toHaveCount(0);
  await pub.goto('/unidades');
  await expect(pub.getByText('E2E Unidade sem verificação')).toBeVisible();
  await pub.getByRole('link', { name: 'E2E Unidade sem verificação' }).click();
  await expect(pub.getByText('Informação pendente de confirmação oficial').first()).toBeVisible();
});

test('banner de cookies: escolha persiste e pode ser reaberta', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toBeVisible();
  await page.getByRole('button', { name: 'Rejeitar não necessários' }).click();
  await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('region', { name: 'Aviso de cookies' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Preferências de cookies' }).first().click();
  const dlg = page.getByRole('dialog', { name: 'Preferências de cookies' });
  await expect(dlg).toBeVisible();
  await dlg.getByRole('switch', { name: 'Conteúdo de terceiros' }).check({ force: true });
  await dlg.getByRole('button', { name: 'Salvar preferências' }).click();
  const n = await pool.query('select count(*)::int c from consent_records where third_party=true');
  expect(n.rows[0].c).toBeGreaterThan(0);
});

test('formulário de contato: erro, anti-spam e sucesso', async ({ page }) => {
  await page.goto('/contatos');
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByText('Revise os campos destacados.')).toBeVisible();
  await expect(page.getByText('Informe seu nome completo.')).toBeVisible();
  await page.waitForTimeout(3200);
  await page.locator('#c-name').fill('Maria E2E');
  await page.locator('#c-email').fill('e2e@example.com');
  await page.locator('#c-subject').fill('Teste automatizado');
  await page.locator('#c-message').fill('Mensagem de teste com mais de dez caracteres.');
  await page.getByLabel(/Li e concordo/).check();
  await page.getByRole('button', { name: 'Enviar mensagem' }).click();
  await expect(page.getByText('Mensagem enviada')).toBeVisible();
  expect((await pool.query("select count(*)::int c from contact_messages where email='e2e@example.com'")).rows[0].c).toBe(1);
});

test('organograma: expandir, zoom e PDF', async ({ page }) => {
  await page.goto('/secretaria/organograma');
  await expect(page.getByText('Departamento de Vigilância em Saúde')).toBeVisible();
  await expect(page.getByText('Vigilância Sanitária')).toHaveCount(0);
  await page.getByRole('button', { name: 'Ver tudo' }).click();
  await expect(page.getByText('Vigilância Sanitária')).toBeVisible();
  await page.getByRole('button', { name: 'Aumentar zoom' }).click();
  await expect(page.getByRole('button', { name: /Zoom 110%/ })).toBeVisible();
  const r = await page.request.get('/secretaria/organograma/pdf');
  expect(r.headers()['content-type']).toContain('application/pdf');
});
