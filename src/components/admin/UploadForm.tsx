'use client';
import { useActionState } from 'react';
import { Alert, Button, Field, FileInput, Icon, Input } from '@/components/ds';
import { uploadMedia, type MediaState } from '@/app/admin/(panel)/midia/actions';

export function UploadForm() {
  const [state, action, pending] = useActionState<MediaState, FormData>(uploadMedia, {});
  return (
    <form action={action} className="su-form su-form--wide" encType="multipart/form-data">
      {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />}>{state.error}</Alert>}
      {state.ok && <Alert tone="success" icon={<Icon name="circle-check" />}>Arquivo enviado.</Alert>}
      <Field label="Arquivo (JPG, PNG, WebP ou PDF)" htmlFor="m-file" required><FileInput id="m-file" name="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /></Field>
      <Field label="Texto alternativo / descrição" htmlFor="m-alt" hint="Obrigatório para imagens."><Input id="m-alt" name="alt" /></Field>
      <div><Button type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar'}</Button></div>
    </form>
  );
}
