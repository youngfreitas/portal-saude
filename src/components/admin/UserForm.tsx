'use client';
import { useActionState, useState } from 'react';
import { Alert, Button, Checkbox, Dialog, Field, Icon, Input, Select } from '@/components/ds';
import { ROLES } from '@/lib/permissions';
import type { UserState } from '@/app/admin/(panel)/usuarios/actions';

export function UserForm({ action, user, label }: { action: (p: UserState, f: FormData) => Promise<UserState>; user?: { name: string; email: string; role: string; active: boolean }; label: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<UserState, FormData>(async (p, f) => { const r = await action(p, f); if (r.ok) setOpen(false); return r; }, {});
  return (
    <>
      <Button size="sm" variant={user ? 'secondary' : 'primary'} onClick={() => setOpen(true)}><Icon name={user ? 'pencil' : 'plus'} size="sm" />{label}</Button>
      <Dialog open={open} title={user ? 'Editar usuário' : 'Novo usuário'} cancelLabel="Cancelar" hideConfirm onClose={() => setOpen(false)}>
        <form action={formAction} className="su-form" style={{ marginTop: 'var(--space-4)' }}>
          {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />}>{state.error}</Alert>}
          <Field label="Nome" htmlFor="u-name" required><Input id="u-name" name="name" defaultValue={user?.name} required /></Field>
          <Field label="E-mail" htmlFor="u-email" required><Input id="u-email" name="email" type="email" defaultValue={user?.email} required /></Field>
          <Field label="Perfil" htmlFor="u-role" required hint={ROLES.find((r) => r.value === (user?.role ?? 'visualizador'))?.description}><Select id="u-role" name="role" defaultValue={user?.role ?? 'visualizador'} options={ROLES.map((r) => ({ value: r.value, label: `${r.label} — ${r.description}` }))} /></Field>
          <Field label={user ? 'Nova senha (deixe vazio para manter)' : 'Senha inicial'} htmlFor="u-pw" hint="Mínimo de 10 caracteres, com letras e números." required={!user}><Input id="u-pw" name="password" type="password" autoComplete="new-password" /></Field>
          <Checkbox name="active" defaultChecked={user?.active ?? true} label="Usuário ativo" />
          <Button type="submit" disabled={pending}>{pending ? 'Salvando…' : 'Salvar usuário'}</Button>
        </form>
      </Dialog>
    </>
  );
}
