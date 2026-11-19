// Cloudflare Pages (modo avançado). Serve os arquivos estáticos e responde rápido ao que o site real faria no servidor.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // O Next.js tenta "pré-carregar" páginas pedindo dados RSC; em hospedagem estática isso não existe.
    if (url.searchParams.has('_rsc') || request.headers.get('rsc') === '1') return new Response(null, { status: 404 });
    // Registro de consentimento de cookies (no site real grava no banco): aqui só confirma.
    if (url.pathname === '/api/consent') return new Response(null, { status: request.method === 'POST' ? 204 : 405 });
    if (url.pathname.startsWith('/api/')) return new Response(null, { status: 404 });
    // O painel administrativo não faz parte da demonstração estática.
    if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) return Response.redirect(url.origin + '/', 302);
    return env.ASSETS.fetch(request);
  },
};
