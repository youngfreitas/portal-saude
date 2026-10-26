# Portal da Secretaria Municipal de Saúde de Ubatuba

Portal público + painel administrativo (CMS) em **Next.js 15 (App Router) + React 19 + TypeScript**, banco **PostgreSQL** (Drizzle ORM) e identidade visual do **Saúde Ubatuba Design System**.

## Rodando localmente

```bash
cp .env.example .env            # ajuste DATABASE_URL e SEED_ADMIN_*
npm install                     # copia os ícones Lucide para public/icons
npm run db:migrate              # aplica drizzle/*.sql
npm run db:seed                 # estrutura inicial + primeiro administrador
npm run dev                     # ou: npm run build && npm start
```

Painel: `/admin` (login com `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`; troque a senha em *Usuários*).

## Conteúdo oficial x pendente

Nenhum endereço, telefone, responsável ou coordenada foi inventado. A semente traz apenas estrutura (categorias, tipos de serviço,
setores genéricos do organograma, campanhas nacionais, calendário nacional de vacinação com fonte). Todo dado oficial ausente aparece no
portal como **“Informação pendente de confirmação oficial”**. O mapa só exibe unidades cuja coordenada foi marcada como *verificada* no painel.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run typecheck` | TypeScript |
| `npm test` | testes unitários (Vitest) |
| `npx playwright test` | fluxos e acessibilidade (axe) — requer `npm run build && npm start`; use `E2E_CHROMIUM=/caminho/do/chromium` se necessário |
| `npm run db:generate` | gera nova migração a partir de `src/db/schema.ts` |

## Variáveis de ambiente
Veja `.env.example` (banco, `SITE_URL`, admin inicial, armazenamento, SMTP opcional, Turnstile opcional, webhook de erros opcional).

## Mais
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) · [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) · [`docs/LGPD.md`](docs/LGPD.md)
