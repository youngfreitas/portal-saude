import type { ReactNode } from 'react';

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children?: ReactNode;
  className?: string;
}

/** Envelope de campo. O controle filho deve ter id={htmlFor}; ligue aria-describedby a `${htmlFor}-msg`. */
export function Field({ label, hint, error, required, htmlFor, children, className }: FieldProps) {
  return (
    <div className={`su-field${className ? ' ' + className : ''}`}>
      {label && (
        <label htmlFor={htmlFor} className="su-field__label">
          {label}{required && <span className="su-field__req" aria-hidden> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span id={`${htmlFor}-msg`} className="su-field__error" role="alert">{error}</span>
      ) : hint ? (
        <span id={`${htmlFor}-msg`} className="su-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}
