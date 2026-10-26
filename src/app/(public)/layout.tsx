import { desc, asc } from 'drizzle-orm';
import { db } from '@/db';
import { socialProfiles } from '@/db/schema';
import { getSettings } from '@/lib/settings';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { CookieManager } from '@/components/consent/CookieManager';

export const dynamic = 'force-dynamic';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [s, socials] = await Promise.all([getSettings(), db.select().from(socialProfiles).orderBy(asc(socialProfiles.sortOrder), desc(socialProfiles.id))]);
  return (
    <>
      <a href="#conteudo" className="su-skip">Ir para o conteúdo</a>
      <Header prefeituraUrl={s.prefeitura_url} ombudsmanUrl={s.ombudsman_url} />
      <main id="conteudo" tabIndex={-1}>{children}</main>
      <Footer s={s} socials={socials} />
      <CookieManager />
    </>
  );
}
