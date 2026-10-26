import type { ReactNode } from 'react';
import { cx } from './cx';

/** Imagem com texto alternativo; sem imagem, a área azul chapada do DS com o brasão. */
export function Media({ src, srcSet, alt, ratio, priority, children }: { src?: string | null; srcSet?: string; alt?: string; ratio?: 'square' | 'wide'; priority?: boolean; children?: ReactNode }) {
  if (!src) {
    return (
      <span className={cx('su-media', 'su-media--empty', ratio && `su-media--${ratio}`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/brasao-ubatuba.png" alt="" aria-hidden />
        {children}
      </span>
    );
  }
  return (
    <span className={cx('su-media', ratio && `su-media--${ratio}`)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} srcSet={srcSet} sizes="(max-width: 640px) 100vw, 480px" alt={alt ?? ''} loading={priority ? 'eager' : 'lazy'} decoding="async" />
      {children}
    </span>
  );
}
