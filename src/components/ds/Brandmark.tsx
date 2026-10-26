import Link from 'next/link';
import { cx } from './cx';

export interface BrandmarkProps {
  variant?: 'full' | 'mark';
  tone?: 'dark' | 'light';
  size?: number;
  href?: string;
}

export function Brandmark({ variant = 'full', tone = 'dark', size = 48, href }: BrandmarkProps) {
  const inner = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/brasao-ubatuba.png" alt="Brasão de Ubatuba" height={size} style={{ height: size }} />
      {variant !== 'mark' && (
        <span className="su-brandmark__text">
          <span className="su-brandmark__over">Prefeitura Municipal de Ubatuba</span>
          <span className="su-brandmark__name" style={{ fontSize: size * 0.38 }}>Secretaria de Saúde</span>
        </span>
      )}
    </>
  );
  const cls = cx('su-brandmark', tone === 'light' && 'su-brandmark--light');
  return href ? <Link href={href} className={cls} aria-label="Secretaria de Saúde de Ubatuba — página inicial">{inner}</Link> : <span className={cls}>{inner}</span>;
}
