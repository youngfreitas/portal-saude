import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  icon?: ReactNode;
}

export function Input({ invalid, icon, className, ...rest }: InputProps) {
  const input = <input className={`su-input${className ? ' ' + className : ''}`} aria-invalid={invalid || undefined} {...rest} />;
  if (!icon) return input;
  return (
    <span className="su-input-wrap">
      <span className="su-input-wrap__icon">{icon}</span>
      {input}
    </span>
  );
}
