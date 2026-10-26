import type { CSSProperties } from 'react';

const SIZES = { sm: 16, md: 20, lg: 24, xl: 32 } as const;

export interface IconProps {
  /** Nome do ícone Lucide em kebab-case, ex.: "calendar-check". */
  name: string;
  size?: keyof typeof SIZES | number;
  color?: string;
  /** Sem rótulo o ícone é decorativo (aria-hidden). */
  label?: string;
  style?: CSSProperties;
  className?: string;
}

export function Icon({ name, size = 'md', color, label, style, className }: IconProps) {
  const px = typeof size === 'number' ? size : SIZES[size];
  const url = `url("/icons/${name}.svg")`;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={`su-icon${className ? ' ' + className : ''}`}
      style={{ width: px, height: px, WebkitMaskImage: url, maskImage: url, ...(color ? { backgroundColor: color } : null), ...style }}
    />
  );
}
