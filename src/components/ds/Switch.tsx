import type { InputHTMLAttributes, ReactNode } from 'react';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export function Switch({ label, className, ...rest }: SwitchProps) {
  return (
    <label className={`su-switch${className ? ' ' + className : ''}`}>
      <input type="checkbox" role="switch" {...rest} />
      <span className="su-switch__track" aria-hidden><span className="su-switch__thumb" /></span>
      {label && <span>{label}</span>}
    </label>
  );
}
