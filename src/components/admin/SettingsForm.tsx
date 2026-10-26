'use client';
import { useActionState } from 'react';
import { Alert, Button, Field, Icon, Input, Select, Textarea } from '@/components/ds';
import { SETTING_FIELDS } from '@/lib/settings-fields';
import { saveSettings, type SettingsState } from '@/app/admin/(panel)/configuracoes/actions';

export function SettingsForm({ values, images }: { values: Record<string, string>; images: { id: number; alt: string | null; originalName: string }[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveSettings, {});
  const groups = [...new Set(SETTING_FIELDS.map((f) => f.group))];
  return (
    <form action={action} className="su-form su-form--wide">
      {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />}>{state.error}</Alert>}
      {state.ok && <Alert tone="success" icon={<Icon name="circle-check" />}>Configurações salvas.</Alert>}
      {groups.map((g) => (
        <fieldset key={g} style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', background: 'var(--surface-card)' }}>
          <legend style={{ font: 'var(--text-h4)', padding: '0 var(--space-2)' }}>{g}</legend>
          <div className="su-form">
            {SETTING_FIELDS.filter((f) => f.group === g).map((f) => {
              const hint = 'hint' in f ? f.hint : undefined;
              const multiline = 'multiline' in f && f.multiline;
              if (f.key === 'hero_image_id') return (
                <Field key={f.key} label="Imagem de destaque da página inicial" htmlFor={f.key} hint="Envie imagens na Biblioteca de mídia. Vazio = área azul do Design System.">
                  <Select id={f.key} name={f.key} defaultValue={values[f.key]} placeholder="— sem imagem —" options={images.map((m) => ({ value: m.id, label: `#${m.id} — ${m.alt || m.originalName}` }))} />
                </Field>
              );
              return (
                <Field key={f.key} label={f.label} htmlFor={f.key} hint={hint}>
                  {multiline ? <Textarea id={f.key} name={f.key} defaultValue={values[f.key]} rows={4} /> : <Input id={f.key} name={f.key} defaultValue={values[f.key]} />}
                </Field>
              );
            })}
          </div>
        </fieldset>
      ))}
      <div className="su-form-actions"><Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar configurações'}</Button></div>
    </form>
  );
}
