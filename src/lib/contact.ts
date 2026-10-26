import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo.').max(160),
  email: z.string().trim().email('Informe um e-mail válido.').max(200),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Informe o assunto.').max(200),
  message: z.string().trim().min(10, 'Escreva ao menos 10 caracteres.').max(4000, 'A mensagem pode ter até 4.000 caracteres.'),
  consent: z.literal('on', { message: 'Você precisa concordar com o tratamento dos dados para enviar.' }),
});

export const MIN_FILL_MS = 3000;

export type ContactState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };
