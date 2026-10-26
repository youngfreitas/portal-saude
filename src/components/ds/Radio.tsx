export interface RadioOption { value: string; label: string }
export interface RadioProps {
  name: string;
  options?: (string | RadioOption)[];
  defaultValue?: string;
  direction?: 'column' | 'row';
  legend?: string;
}

export function Radio({ name, options = [], defaultValue, direction = 'column', legend }: RadioProps) {
  return (
    <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
      {legend && <legend className="su-field__label" style={{ marginBottom: 8 }}>{legend}</legend>}
      <div className={`su-radio-group${direction === 'row' ? ' su-radio-group--row' : ''}`}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return (
            <label key={opt.value} className="su-radio">
              <input type="radio" name={name} value={opt.value} defaultChecked={defaultValue === opt.value} />
              <span className="su-radio__dot" aria-hidden />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
