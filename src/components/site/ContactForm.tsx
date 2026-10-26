'use client';
import { useActionState, useState } from 'react';
import Script from 'next/script';
import { Alert, Button, Checkbox, Field, Icon, Input, Textarea } from '@/components/ds';
import { sendContact } from '@/app/(public)/contatos/actions';
import type { ContactState } from '@/lib/contact';

const TURNSTILE = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContact, {});
  const [t] = useState(() => Date.now());
  if (state.ok) {
    return <Alert tone="success" icon={<Icon name="circle-check" />} title="Mensagem enviada">Recebemos sua mensagem e ela será analisada pela equipe da Secretaria. Obrigado por entrar em contato.</Alert>;
  }
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const d = (id: string, hint?: boolean) => (fe[id] || hint ? `${'c-' + id}-msg` : undefined);
  return (
    <form action={action} className="su-form" noValidate>
      {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />} title="Não foi possível enviar">{state.error}</Alert>}
      <input type="hidden" name="t" value={t} />
      <div aria-hidden style={{ position: 'absolute', left: -9999, width: 1, height: 1, overflow: 'hidden' }}>
        <label>Não preencha este campo<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <Field label="Nome completo" htmlFor="c-name" required error={fe.name}><Input id="c-name" name="name" defaultValue={v.name} autoComplete="name" required invalid={!!fe.name} aria-describedby={d('name')} /></Field>
      <div className="su-grid su-grid-2">
        <Field label="E-mail" htmlFor="c-email" required error={fe.email}><Input id="c-email" name="email" type="email" defaultValue={v.email} autoComplete="email" required invalid={!!fe.email} aria-describedby={d('email')} /></Field>
        <Field label="Telefone (opcional)" htmlFor="c-phone"><Input id="c-phone" name="phone" type="tel" defaultValue={v.phone} autoComplete="tel" /></Field>
      </div>
      <Field label="Assunto" htmlFor="c-subject" required error={fe.subject}><Input id="c-subject" name="subject" defaultValue={v.subject} required invalid={!!fe.subject} aria-describedby={d('subject')} /></Field>
      <Field label="Mensagem" htmlFor="c-message" required error={fe.message} hint="Não informe dados de saúde nem documentos pessoais.">
        <Textarea id="c-message" name="message" rows={6} defaultValue={v.message} required invalid={!!fe.message} aria-describedby={d('message', true)} />
      </Field>
      <div>
        <Checkbox name="consent" defaultChecked={!!v.consent} label={<>Li e concordo com o tratamento dos meus dados para responder a esta mensagem, conforme a <a href="/privacidade" target="_blank">Política de Privacidade</a>.</>} />
        {fe.consent && <span className="su-field__error" role="alert" style={{ display: 'block', marginTop: 4 }}>{fe.consent}</span>}
      </div>
      {TURNSTILE && (<><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /><div className="cf-turnstile" data-sitekey={TURNSTILE} /></>)}
      <div className="su-form-actions"><Button type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar mensagem'}</Button></div>
    </form>
  );
}
