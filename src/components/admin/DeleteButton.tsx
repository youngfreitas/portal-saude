'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Dialog, Icon } from '@/components/ds';

export function DeleteButton({ name, onDelete }: { name: string; onDelete: () => Promise<{ error?: string }> }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => { setError(null); setOpen(true); }} aria-label={`Excluir ${name}`}><Icon name="trash-2" size="sm" />Excluir</Button>
      <Dialog open={open} tone="danger" title="Excluir registro?" description={`“${name}” será removido definitivamente. Esta ação não pode ser desfeita.`}
        confirmLabel={pending ? 'Excluindo…' : 'Excluir'} cancelLabel="Cancelar" onClose={() => setOpen(false)}
        onConfirm={() => start(async () => { const r = await onDelete(); if (r.error) setError(r.error); else { setOpen(false); router.refresh(); } })}>
        {error && <Alert tone="danger" style={{ marginTop: 'var(--space-3)' }}>{error}</Alert>}
      </Dialog>
    </>
  );
}
