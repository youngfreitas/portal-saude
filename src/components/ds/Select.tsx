import type { SelectHTMLAttributes } from 'react';

export type SelectOption = string | { value: string | number; label: string };
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options?: SelectOption[];
  placeholder?: string;
}

export function Select({ invalid, options = [], placeholder, className, ...rest }: SelectProps) {
  return (
    <select className={`su-select${className ? ' ' + className : ''}`} aria-invalid={invalid || undefined} {...rest}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        return <option key={opt.value} value={opt.value}>{opt.label}</option>;
      })}
    </select>
  );
}
