# Publicar a demonstração na Cloudflare Pages

A Cloudflare Pages hospeda **arquivos estáticos**. O portal real usa PostgreSQL, painel `/admin` e ações de servidor, então a demonstração é publicada como uma **cópia estática** do site (HTML, imagens e scripts), gerada por `npm run export:demo`.

## Publicar (via .zip)
No painel atual da Cloudflare, **Create application** abre o fluxo de Workers. Para Pages, use o link **“Looking to deploy Pages? Get started”** no fim da página (ou `dash.cloudflare.com/?to=/:account/workers-and-pages/create/pages`). O pacote também funciona em Workers com arquivos estáticos, ou por `npx wrangler deploy` (usa o `wrangler.jsonc` da raiz).

1. Entre em **dash.cloudflare.com → Workers & Pages → Create application → Pages → Upload assets**.
2. Dê um nome ao projeto (ex.: `portal-saude-demo`) e envie o arquivo `portal-saude-demo-cloudflare.zip` (ou a pasta `dist-demo/`).
3. **Deploy site**. O endereço será `https://<nome>.pages.dev`.

Para atualizar, repita o envio no mesmo projeto (**Create deployment**).

## Gerar o .zip de novo
Com o banco e a demonstração carregados (`npm run db:migrate && npm run db:seed && npm run db:seed:demo`):

```bash
npm run export:demo
```

Saída: `dist-demo/` e `portal-saude-demo-cloudflare.zip`. Para definir o domínio usado em sitemap e prévias de compartilhamento: `DEMO_SITE_URL=https://meu-dominio.pages.dev npm run export:demo`.

## O que funciona na versão estática
- Todas as páginas públicas (início, secretaria, organograma e PDF, unidades e mapa, serviços, notícias, campanhas, contatos, redes sociais, políticas), com as imagens da demonstração.
- **Busca, filtros e ordenação** das listas: refeitos no navegador (`demo-static.js` e `search-index.json`).
- **Formulário de contato**: valida e mostra confirmação, mas **não envia nem guarda nada**.
- Cookies, acessibilidade (A−/A+, alto contraste) e mapa (com consentimento de terceiros).

## Limitações
- **Somente leitura**: não há painel `/admin`; `/admin` redireciona para a página inicial. Para editar conteúdo, altere os dados e gere o .zip de novo.
- A busca e os filtros leem o conteúdo gerado no momento da exportação.
- Listas com paginação (`?page=`) não são geradas; a demonstração tem poucos itens.
- O pacote é **100% estático** (sem `_worker.js`): o `demo-static.js` responde localmente ao pré-carregamento do Next e a `/api/*`, e `_redirects` leva `/admin` à página inicial. Por isso funciona em Pages e em Workers (Static Assets).
- `_headers` inclui `X-Robots-Tag: noindex` para não indexar dados fictícios. Remova essa linha ao publicar conteúdo real.

## Produção de verdade
Para o portal completo (banco, painel e envio de e-mails) use uma hospedagem com Node.js e PostgreSQL ou adapte o projeto para Workers + banco gerenciado; a versão estática não substitui isso.
