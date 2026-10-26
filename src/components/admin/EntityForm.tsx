'use client';
import { useActionState } from 'react';
import Link from 'next/link';
import { Alert, Button, Checkbox, Field as DsField, FileInput, Icon, Input, Select, Textarea } from '@/components/ds';
import { RichTextEditor } from './RichTextEditor';
import type { Field } from '@/lib/admin/entities';
import type { EntityState } from '@/app/admin/(panel)/entity-actions';

export type FormValues = Record<string, unknown>;
export type ImageInfo = { id: number; alt: string | null } | null;
export type MediaItem = { id: number; name: string; alt: string | null };

export function EntityForm({ action, fields, values, options, images, services, selectedServices, gallery, attachments, canPublish, cancelHref }: {
  action: (prev: EntityState, form: FormData) => Promise<EntityState>;
  fields: Field[];
  values: FormValues;
  options: Record<string, { value: string; label: string }[]>;
  images: Record<string, ImageInfo>;
  services: { id: number; name: string }[];
  selectedServices: number[];
  gallery: MediaItem[];
  attachments: MediaItem[];
  canPublish: boolean;
  cancelHref: string;
}) {
  const [state, formAction, pending] = useActionState<EntityState, FormData>(action, {});
  const fe = state.fieldErrors ?? {};
  const str = (n: string) => (values[n] == null ? '' : String(values[n]));
  const visible = fields.filter((f) => !(f.publishOnly && !canPublish));

  const render = (f: Field) => {
    const id = `f-${f.name}`;
    const err = fe[f.name];
    const d = err || f.hint ? `${id}-msg` : undefined;
    const common = { id, name: f.name, invalid: !!err, 'aria-describedby': d, required: f.required } as const;
    switch (f.type) {
      case 'checkbox':
        return <div key={f.name}><Checkbox name={f.name} defaultChecked={!!values[f.name]} label={f.label} />{err && <span className="su-field__error" role="alert" style={{ display: 'block' }}>{err}</span>}{f.hint && <span className="su-field__hint" style={{ display: 'block' }}>{f.hint}</span>}</div>;
      case 'richtext':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint}><RichTextEditor id={id} name={f.name} initial={str(f.name)} invalid={!!err} /></DsField>;
      case 'textarea':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint} required={f.required}><Textarea {...common} rows={4} defaultValue={str(f.name)} maxLength={f.max} /></DsField>;
      case 'lines':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint}><Textarea {...common} rows={3} defaultValue={str(f.name)} /></DsField>;
      case 'select': {
        const opts = f.options ?? options[f.optionsFrom ?? ''] ?? [];
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint} required={f.required} className={f.half ? 'half' : undefined}><Select {...common} defaultValue={str(f.name)} placeholder={f.required ? undefined : '— nenhum —'} options={opts} /></DsField>;
      }
      case 'date':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint} required={f.required}><Input {...common} type="date" defaultValue={str(f.name)} /></DsField>;
      case 'datetime':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint}><Input {...common} type="datetime-local" defaultValue={str(f.name)} /></DsField>;
      case 'number': case 'float':
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint}><Input {...common} type="text" inputMode={f.type === 'float' ? 'decimal' : 'numeric'} defaultValue={str(f.name)} /></DsField>;
      case 'image': {
        const img = images[f.name];
        return (
          <fieldset key={f.name} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <legend className="su-field__label">{f.label}</legend>
            {img && <div className="su-stack" style={{ marginBottom: 'var(--space-3)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/media/${img.id}?w=480`} alt={img.alt ?? ''} style={{ maxWidth: 240, borderRadius: 'var(--radius-md)' }} />
              <DsField label="Texto alternativo da imagem atual" htmlFor={`${id}__alt-cur`}><Input id={`${id}__alt-cur`} name={`${f.name}__alt`} defaultValue={img.alt ?? ''} /></DsField>
              <Checkbox name={`${f.name}__remove`} label="Remover esta imagem" />
            </div>}
            <div className="su-stack">
              <DsField label={img ? 'Trocar por outra imagem' : 'Enviar imagem'} htmlFor={`${id}__file`} hint={f.hint}><FileInput id={`${id}__file`} name={`${f.name}__file`} accept="image/jpeg,image/png,image/webp" /></DsField>
              {!img && <DsField label="Texto alternativo (obrigatório ao enviar imagem)" htmlFor={`${id}__alt`} hint="Descreva a imagem para quem não pode vê-la."><Input id={`${id}__alt`} name={`${f.name}__alt`} /></DsField>}
            </div>
          </fieldset>
        );
      }
      case 'services':
        return (
          <fieldset key={f.name} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <legend className="su-field__label">{f.label}</legend>
            <div className="su-grid su-grid-2" style={{ gap: 'var(--space-2)' }}>
              {services.map((s) => <Checkbox key={s.id} name="services" value={s.id} defaultChecked={selectedServices.includes(s.id)} label={s.name} />)}
            </div>
          </fieldset>
        );
      case 'gallery':
        return (
          <fieldset key={f.name} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <legend className="su-field__label">{f.label}</legend>
            {gallery.length > 0 && <div className="su-stack" style={{ marginBottom: 'var(--space-3)' }}>{gallery.map((g) => <Checkbox key={g.id} name="remove_media" value={g.id} label={`Remover: ${g.alt || g.name}`} />)}</div>}
            <div className="su-stack">
              <DsField label="Adicionar imagens" htmlFor="gal-files"><FileInput id="gal-files" name="gallery__files" multiple accept="image/jpeg,image/png,image/webp" /></DsField>
              <DsField label="Textos alternativos (um por linha, na mesma ordem das imagens)" htmlFor="gal-alts"><Textarea id="gal-alts" name="gallery__alts" rows={3} /></DsField>
            </div>
          </fieldset>
        );
      case 'attachments':
        return (
          <fieldset key={f.name} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)' }}>
            <legend className="su-field__label">{f.label}</legend>
            {attachments.length > 0 && <div className="su-stack" style={{ marginBottom: 'var(--space-3)' }}>{attachments.map((g) => <Checkbox key={g.id} name="remove_media" value={g.id} label={`Remover: ${g.alt || g.name}`} />)}</div>}
            <div className="su-stack">
              <DsField label="Adicionar PDFs" htmlFor="att-files" hint="Até 15 MB cada."><FileInput id="att-files" name="attachments__files" multiple accept="application/pdf" /></DsField>
              <DsField label="Nomes de exibição (um por linha, na mesma ordem)" htmlFor="att-names"><Textarea id="att-names" name="attachments__names" rows={2} /></DsField>
            </div>
          </fieldset>
        );
      default:
        return <DsField key={f.name} label={f.label} htmlFor={id} error={err} hint={f.hint} required={f.required}><Input {...common} type={f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'} defaultValue={str(f.name)} maxLength={f.max} /></DsField>;
    }
  };

  // agrupa campos "half" em pares
  const rows: Field[][] = [];
  for (const f of visible) {
    const last = rows[rows.length - 1];
    if (f.half && last && last.length === 1 && last[0].half) last.push(f); else rows.push([f]);
  }
  return (
    <form action={formAction} className="su-form su-form--wide" encType="multipart/form-data" noValidate>
      {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />} title="Não foi possível salvar">{state.error}</Alert>}
      {rows.map((r) => r.length === 2 ? <div key={r[0].name} className="su-grid su-grid-2">{r.map(render)}</div> : render(r[0]))}
      <div className="su-form-actions">
        <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar'}</Button>
        <Button variant="tertiary" href={cancelHref}>Cancelar</Button>
      </div>
    </form>
  );
}
