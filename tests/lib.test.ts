import { describe, expect, it } from 'vitest';
import { can, ROLES } from '../src/lib/permissions';
import { sanitizeRichText, youtubeEmbedUrl, safeHttpUrl } from '../src/lib/sanitize';
import { slugify } from '../src/lib/slug';
import { postIsLive } from '../src/lib/publishing';
import { hashPassword, verifyPassword, passwordProblem } from '../src/lib/password';
import { parseLines, coordsInUbatuba } from '../src/lib/admin/parse';
import { contactSchema } from '../src/lib/contact';
import { fromLocalInput, toLocalInput } from '../src/lib/format';

describe('permissões', () => {
  it('visualizador só lê', () => {
    expect(can('visualizador', 'content.view')).toBe(true);
    expect(can('visualizador', 'news.write')).toBe(false);
  });
  it('editor escreve mas não publica nem exclui', () => {
    expect(can('editor', 'news.write')).toBe(true);
    expect(can('editor', 'news.publish')).toBe(false);
    expect(can('editor', 'news.delete')).toBe(false);
    expect(can('editor', 'users.manage')).toBe(false);
  });
  it('gestor publica e exclui, mas não administra usuários/logs', () => {
    expect(can('gestor', 'news.publish')).toBe(true);
    expect(can('gestor', 'catalog.delete')).toBe(true);
    expect(can('gestor', 'users.manage')).toBe(false);
    expect(can('gestor', 'logs.view')).toBe(false);
  });
  it('administrador tem tudo; perfil inválido nada', () => {
    expect(can('administrador', 'logs.view')).toBe(true);
    expect(can('hacker', 'content.view')).toBe(false);
    expect(can(null, 'content.view')).toBe(false);
    expect(ROLES).toHaveLength(4);
  });
});

describe('sanitização', () => {
  it('remove scripts, handlers e javascript:', () => {
    const out = sanitizeRichText('<p onclick="x()">oi<script>alert(1)</script><a href="javascript:alert(1)">l</a><img src=x onerror=alert(1)></p>');
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain('<p>oi');
  });
  it('links externos abrem com rel seguro', () => {
    expect(sanitizeRichText('<a href="https://x.com">x</a>')).toContain('rel="noopener noreferrer"');
  });
  it('aceita só YouTube em vídeos', () => {
    expect(youtubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    expect(youtubeEmbedUrl('https://youtu.be/dQw4w9WgXcQ')).toContain('dQw4w9WgXcQ');
    expect(youtubeEmbedUrl('https://evil.com/watch?v=dQw4w9WgXcQ')).toBeNull();
  });
  it('safeHttpUrl barra esquemas perigosos', () => {
    expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(safeHttpUrl('https://a.b')).toBe('https://a.b/');
  });
});

describe('slug e agendamento', () => {
  it('slugify remove acentos', () => expect(slugify('Saúde Bucal — UBS Centro!')).toBe('saude-bucal-ubs-centro'));
  it('notícia agendada só é pública após a data', () => {
    const now = new Date('2026-06-01T12:00:00Z');
    expect(postIsLive({ status: 'publicado', publishAt: null }, now)).toBe(true);
    expect(postIsLive({ status: 'publicado', publishAt: new Date('2026-06-02T00:00:00Z') }, now)).toBe(false);
    expect(postIsLive({ status: 'publicado', publishAt: new Date('2026-05-01T00:00:00Z') }, now)).toBe(true);
    expect(postIsLive({ status: 'rascunho', publishAt: null }, now)).toBe(false);
    expect(postIsLive({ status: 'despublicado', publishAt: null }, now)).toBe(false);
  });
  it('datetime-local é interpretado em Brasília', () => {
    const d = fromLocalInput('2026-06-01T09:30')!;
    expect(d.toISOString()).toBe('2026-06-01T12:30:00.000Z');
    expect(toLocalInput(d)).toBe('2026-06-01T09:30');
  });
});

describe('senhas', () => {
  it('hash scrypt verifica e rejeita', async () => {
    const h = await hashPassword('Senha-forte-123');
    expect(h.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('Senha-forte-123', h)).toBe(true);
    expect(await verifyPassword('outra', h)).toBe(false);
  });
  it('exige tamanho e letras+números', () => {
    expect(passwordProblem('curta1')).toBeTruthy();
    expect(passwordProblem('somenteletrasaqui')).toBeTruthy();
    expect(passwordProblem('Senha-forte-123')).toBeNull();
  });
});

describe('validação de entrada', () => {
  it('linhas de links', () => {
    expect(parseLines('Site | https://a.b', 'links').items).toEqual([{ label: 'Site', url: 'https://a.b' }]);
    expect(parseLines('Ruim | javascript:x', 'links').error).toBeTruthy();
    expect(parseLines('PDF | /media/12', 'materials').error).toBeUndefined();
    expect(parseLines('https://vimeo.com/1', 'videos').error).toBeTruthy();
  });
  it('coordenadas fora de Ubatuba são barradas', () => {
    expect(coordsInUbatuba(-23.4336, -45.0838)).toBe(true);
    expect(coordsInUbatuba(23.4336, -45.0838)).toBe(false);
    expect(coordsInUbatuba(-23.55, -46.63)).toBe(false);
  });
  it('contato exige consentimento e tamanho mínimo', () => {
    const ok = { name: 'Maria Silva', email: 'm@x.com', phone: '', subject: 'Dúvida', message: 'Mensagem longa o bastante', consent: 'on' };
    expect(contactSchema.safeParse(ok).success).toBe(true);
    expect(contactSchema.safeParse({ ...ok, consent: undefined }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, email: 'x' }).success).toBe(false);
    expect(contactSchema.safeParse({ ...ok, message: 'curta' }).success).toBe(false);
  });
});
