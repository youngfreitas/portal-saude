# Arquitetura

- **App Router** com dois blocos: `src/app/(public)` (portal) e `src/app/admin` (painel; `admin/login` fora do shell, `admin/(panel)` autenticado). `middleware.ts` barra `/admin/*` sem cookie; a verificação real está em `requirePermission()`.
- **Banco**: `src/db/schema.ts` (Drizzle) → migrações em `drizzle/`. Qualquer PostgreSQL via `DATABASE_URL` (inclusive Supabase).
- **Autenticação**: senha com scrypt; sessão = token aleatório em cookie `httpOnly`/`SameSite=Lax` (`Secure` em produção), só o hash SHA-256 fica no banco, validade de 8 h; 5 falhas/15 min por e-mail+IP bloqueiam novas tentativas.
- **Perfis** (`src/lib/permissions.ts`): Administrador (tudo, usuários, logs, configurações) · Gestor (todo o conteúdo, publica e exclui) · Editor (cria/edita notícias, campanhas e redes; só rascunho/revisão; não publica, despublica, agenda nem exclui) · Visualizador (leitura). Regras de publicação são reforçadas no servidor (`entity-actions.ts`).
- **CMS genérico**: `src/lib/admin/entities.ts` descreve cada cadastro (campos, permissões); `[entity]` lista, `[entity]/[id]` edita, `entity-actions.ts` valida (zod/parse), sanitiza HTML, faz upload e registra log. Páginas próprias: usuários, logs, configurações, mensagens, mídia.
- **Log de atividades**: login, logout, falha de login, criar, editar, excluir, publicar, despublicar.
- **Agendamento**: notícia “Publicada” com data futura fica invisível ao público até a data (consulta filtra por `publish_at`); não depende de cron.
- **Mídia**: `src/lib/storage` (disco local em `STORAGE_DIR`; troque o adaptador por S3/Supabase). Imagens viram WebP 480/960/1600 (sharp), servidas por `/media/[id]?w=`. Texto alternativo obrigatório.
- **HTML rico**: TipTap no painel; `sanitize-html` ao salvar e ao renderizar.
- **Formulário de contato**: zod, campo isca, tempo mínimo (3 s), limite de 3 envios/hora por IP (hash), Turnstile opcional; sem SMTP a mensagem fica só no painel (marcada “Somente no painel”).
- **PDF do organograma**: `pdfkit` com Raleway/Open Sans do `@fontsource`.
- **SEO**: metadados/Open Graph, `sitemap.xml`, `robots.txt`, slugs. **Erros**: `instrumentation.ts` (log JSON; `ERROR_WEBHOOK_URL` opcional).
- **Não implementado**: sincronização automática com a Instagram Graph API (hoje só cadastro manual de perfis e publicações); ferramenta de estatísticas (nenhuma é carregada).
