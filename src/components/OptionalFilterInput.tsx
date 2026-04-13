import { useState, useEffect, useRef, useCallback } from 'react';
import { tryParseCommittedNumber, sanitizeDecimalDraft } from '../utils/numericInput';

/** Optional positive filter: empty means “no filter”; supports `-` while typing; commits on blur. */
export function OptionalFilterInput({
  value,
  onChange,
  placeholder = 'Any',
  min = 0,
}: {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  min?: number;
}) {
  const allowNegative = min < 0;
  const [draft, setDraft] = useState(() => (value === undefined ? '' : String(value)));
  const [focused, setFocused] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!focused) setDraft(value === undefined ? '' : String(value));
  }, [value, focused]);

  const commit = useCallback(() => {
    const parsed = tryParseCommittedNumber(draft);
    if (!parsed.ok) {
      const v = valueRef.current;
      setDraft(v === undefined ? '' : String(v));
      return;
    }
    if (parsed.value === null) {
      onChange(undefined);
      return;
    }
    const n = min !== undefined && parsed.value < min ? min : parsed.value;
    onChange(n);
  }, [draft, onChange, min]);

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      value={draft}
      onChange={e =>
        setDraft(sanitizeDecimalDraft(e.target.value, { allowNegative }))
      }
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
    />
  );
}
