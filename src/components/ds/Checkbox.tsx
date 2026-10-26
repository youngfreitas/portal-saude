import type { InputHTMLAttributes, ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export function Checkbox({ label, className, ...rest }: CheckboxProps) {
  return (
    <label className={`su-check${className ? ' ' + className : ''}`}>
      <input type="checkbox" {...rest} />
      <span className="su-check__box" aria-hidden />
      {label && <span>{label}</span>}
    </label>
  );
}
