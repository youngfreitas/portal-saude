import type { Metadata } from 'next';
import { LoginForm } from './LoginForm';
import { Brandmark } from '@/components/ds';

export const metadata: Metadata = { title: 'Entrar no painel', robots: { index: false } };

export default function Page() {
  return (
    <div className="su-admin-login">
      <div style={{ marginBottom: 'var(--space-6)' }}><Brandmark size={52} /></div>
      <h1 style={{ marginBottom: 'var(--space-2)' }}>Entrar no painel</h1>
      <p className="su-muted">Acesso restrito a servidores autorizados da Secretaria.</p>
      <LoginForm />
    </div>
  );
}
