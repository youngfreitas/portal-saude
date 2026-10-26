import type { InputHTMLAttributes } from 'react';
export function FileInput({ className, ...rest }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  return <input type="file" className={`su-file${className ? ' ' + className : ''}`} {...rest} />;
}
