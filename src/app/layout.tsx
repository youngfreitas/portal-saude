import type { Metadata, Viewport } from 'next';
import '@fontsource/raleway/500.css';
import '@fontsource/raleway/600.css';
import '@fontsource/raleway/700.css';
import '@fontsource/raleway/800.css';
import '@fontsource/open-sans/400.css';
import '@fontsource/open-sans/600.css';
import '@fontsource/open-sans/700.css';
import '@fontsource/open-sans/400-italic.css';
import '@fontsource/roboto-mono/400.css';
import '@fontsource/roboto-mono/500.css';
import '@/styles/tokens.css';
import '@/styles/foundation.css';
import '@/styles/components.css';
import '@/styles/site.css';
import '@/styles/admin.css';

const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Secretaria Municipal de Saúde de Ubatuba', template: '%s | Saúde Ubatuba' },
  description: 'Portal institucional da Secretaria Municipal de Saúde de Ubatuba: unidades, serviços, campanhas, notícias e comunicados oficiais.',
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'Secretaria Municipal de Saúde de Ubatuba', images: ['/assets/pmu-social-default.jpeg'] },
  icons: { icon: '/assets/brasao-ubatuba.png' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#005aab' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
