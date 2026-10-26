import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, ...rest }: TextareaProps) {
  return <textarea className={`su-textarea${className ? ' ' + className : ''}`} aria-invalid={invalid || undefined} {...rest} />;
}
