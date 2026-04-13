import type { ReactNode } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { tryParseCommittedNumber, clamp, sanitizeDecimalDraft } from '../utils/numericInput';

interface InputFieldProps {
  label: ReactNode;
  value: number | null;
  onChange: (value: number | null) => void;
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  /** If false, clearing the field on blur restores the last value (no `null`). Default true. */
  allowEmpty?: boolean;
}

export function InputField({
  label,
  value,
  onChange,
  unit,
  min = 0,
  max,
  step: _step = 1,
  placeholder,
  allowEmpty = true,
}: InputFieldProps) {
  const allowNegative = min < 0;
  const [draft, setDraft] = useState(() => (value === null || value === undefined ? '' : String(value)));
  const [focused, setFocused] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!focused) {
      setDraft(value === null || value === undefined ? '' : String(value));
    }
  }, [value, focused]);

  const commit = useCallback(() => {
    const parsed = tryParseCommittedNumber(draft);
    if (!parsed.ok) {
      const v = valueRef.current;
      setDraft(v === null || v === undefined ? '' : String(v));
      return;
    }
    if (parsed.value === null) {
      if (!allowEmpty) {
        const v = valueRef.current;
        setDraft(v === null || v === undefined ? '' : String(v));
        return;
      }
      onChange(null);
      return;
    }
    onChange(clamp(parsed.value, min, max));
  }, [draft, onChange, min, max, allowEmpty]);

  return (
    <div className="input-field">
      <label>{label}</label>
      <div className="input-wrapper">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={draft}
          onChange={e =>
            setDraft(sanitizeDecimalDraft(e.target.value, { allowNegative }))
          }
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit();
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          placeholder={placeholder}
        />
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}
