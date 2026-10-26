import { NextResponse, type NextRequest } from 'next/server';

// Barreira de borda: sem cookie de sessão não se entra em /admin (exceto login).
// A validação real (token, expiração, perfil) é feita em requirePermission() em cada página e ação.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();
  if (!req.cookies.get('su_admin_session')) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = '';
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
export const config = { matcher: ['/admin/:path*'] };
