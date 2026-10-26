'use server';
import { createHash } from 'node:crypto';
import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { db } from '@/db';
import { contactMessages } from '@/db/schema';
import { contactSchema, MIN_FILL_MS, type ContactState } from '@/lib/contact';
import { allow } from '@/lib/rate-limit';

async function verifyTurnstile(token: string | null, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // desativado
  if (!token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: token, remoteip: ip }) });
  return !!(await r.json().catch(() => ({}))).success;
}

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const raw = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')) as Record<string, string>;
  const h = await headers();
  const ip = (h.get('x-forwarded-for') ?? 'local').split(',')[0].trim();

  // anti-spam: campo isca preenchido ou envio rápido demais → finge sucesso sem gravar
  const started = Number(raw.t);
  if (raw.website || !started || Date.now() - started < MIN_FILL_MS) return { ok: true };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { fieldErrors, values: raw, error: 'Revise os campos destacados.' };
  }
  const ipKey = 'contact:' + createHash('sha256').update(ip).digest('hex').slice(0, 24);
  if (!(await allow(ipKey, 3, 60 * 60_000))) return { error: 'Muitos envios em pouco tempo. Tente novamente mais tarde.', values: raw };
  if (!(await verifyTurnstile(raw['cf-turnstile-response'] ?? null, ip))) return { error: 'Não foi possível validar o desafio anti-spam. Tente novamente.', values: raw };

  const d = parsed.data;
  let emailed = false;
  if (process.env.SMTP_HOST && process.env.CONTACT_TO) {
    try {
      const t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587), auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined });
      await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to: process.env.CONTACT_TO, replyTo: d.email, subject: `[Portal Saúde] ${d.subject}`, text: `De: ${d.name} <${d.email}> ${d.phone ?? ''}\n\n${d.message}` });
      emailed = true;
    } catch (e) { console.error('Falha SMTP', e); }
  }
  await db.insert(contactMessages).values({ name: d.name, email: d.email, phone: d.phone || null, subject: d.subject, message: d.message, emailed });
  return { ok: true };
}
