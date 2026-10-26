'use client';
import { useActionState } from 'react';
import { Alert, Button, Field, Icon, Input } from '@/components/ds';
import { loginAction, type LoginState } from '../actions';

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="su-form">
      {state.error && <Alert tone="danger" icon={<Icon name="circle-alert" />}>{state.error}</Alert>}
      <Field label="E-mail" htmlFor="l-email" required><Input id="l-email" name="email" type="email" autoComplete="username" required /></Field>
      <Field label="Senha" htmlFor="l-pass" required><Input id="l-pass" name="password" type="password" autoComplete="current-password" required /></Field>
      <Button type="submit" size="lg" fullWidth disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</Button>
    </form>
  );
}
