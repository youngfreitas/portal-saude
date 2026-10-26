import { z } from 'zod';
import { fromLocalInput } from '@/lib/format';
import { sanitizeRichText, youtubeEmbedUrl } from '@/lib/sanitize';
import type { Field } from './entities';

export type Line = { label: string; url: string };

export function parseLines(raw: string, kind: 'links' | 'videos' | 'materials'): { items: Line[]; error?: string } {
  const items: Line[] = [];
  for (const line of raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    const parts = line.split('|').map((p) => p.trim());
    const [a, b] = parts;
    const [label, url] = kind === 'videos' ? [b ?? '', a] : [a, b ?? ''];
    const okUrl = /^https?:\/\/\S+$/i.test(url) || (kind === 'materials' && /^\/media\/\d+$/.test(url));
    if (!label && kind !== 'videos') return { items, error: `Linha sem texto: “${line}”.` };
    if (!okUrl) return { items, error: `Endereço inválido na linha: “${line}”.` };
    if (kind === 'videos' && !youtubeEmbedUrl(url)) return { items, error: `Só são aceitos vídeos do YouTube: “${url}”.` };
    items.push(kind === 'videos' ? { url, ...(label ? { title: label } : {}) } as never : { label, url });
  }
  return { items };
}

export function linesToText(items: unknown, kind: 'links' | 'videos' | 'materials'): string {
  if (!Array.isArray(items)) return '';
  return items.map((i: { label?: string; url: string; title?: string }) => (kind === 'videos' ? `${i.url}${i.title ? ' | ' + i.title : ''}` : `${i.label} | ${i.url}`)).join('\n');
}

/** Converte o valor bruto do formulário no valor da coluna. Retorna `error` se inválido. */
export function parseField(f: Field, form: FormData): { value?: unknown; error?: string; skip?: boolean } {
  const rawV = form.get(f.name);
  const str = typeof rawV === 'string' ? rawV.trim() : '';
  const empty = f.emptyAs === undefined ? null : f.emptyAs;
  const need = () => (f.required && !str ? `Preencha “${f.label}”.` : undefined);
  switch (f.type) {
    case 'text': case 'textarea': case 'select': {
      const e = need(); if (e) return { error: e };
      if (f.max && str.length > f.max) return { error: `“${f.label}” aceita até ${f.max} caracteres.` };
      if (f.type === 'select') {
        if (str && f.options && !f.options.some((o) => o.value === str)) return { error: `Opção inválida em “${f.label}”.` };
        if (f.optionsFrom) return { value: str ? Number(str) : null };
        if (f.emptyAs === 0) return { value: str ? Number(str) : 0 };
      }
      return { value: str || empty };
    }
    case 'email': {
      const e = need(); if (e) return { error: e };
      if (str && !z.string().email().safeParse(str).success) return { error: `E-mail inválido em “${f.label}”.` };
      return { value: str || empty };
    }
    case 'url': {
      const e = need(); if (e) return { error: e };
      if (str && !/^https?:\/\/\S+$/i.test(str)) return { error: `“${f.label}” deve começar com http:// ou https://.` };
      return { value: str || empty };
    }
    case 'number': {
      if (!str) return { value: f.emptyAs ?? null };
      const n = Number(str);
      return Number.isInteger(n) ? { value: n } : { error: `“${f.label}” deve ser um número inteiro.` };
    }
    case 'float': {
      if (!str) return { value: null };
      const n = Number(str.replace(',', '.'));
      return Number.isFinite(n) ? { value: n } : { error: `“${f.label}” deve ser um número.` };
    }
    case 'checkbox': return { value: form.get(f.name) === 'on' };
    case 'date': {
      const e = need(); if (e) return { error: e };
      if (str && !/^\d{4}-\d{2}-\d{2}$/.test(str)) return { error: `Data inválida em “${f.label}”.` };
      return { value: str || null };
    }
    case 'datetime': {
      if (!str) return { value: null };
      const d = fromLocalInput(str);
      return d ? { value: d } : { error: `Data e hora inválidas em “${f.label}”.` };
    }
    case 'richtext': return { value: sanitizeRichText(typeof rawV === 'string' ? rawV : '') };
    case 'lines': {
      const r = parseLines(typeof rawV === 'string' ? rawV : '', f.linesKind ?? 'links');
      return r.error ? { error: r.error } : { value: r.items };
    }
    default: return { skip: true };
  }
}

/** Limites aproximados de Ubatuba/SP para barrar coordenadas digitadas errado. */
export function coordsInUbatuba(lat: number, lng: number): boolean {
  return lat >= -23.65 && lat <= -23.25 && lng >= -45.3 && lng <= -44.7;
}
