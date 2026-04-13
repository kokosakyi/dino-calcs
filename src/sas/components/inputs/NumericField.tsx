import { useState, useEffect, useRef, useCallback } from 'react';
import { tryParseCommittedNumber, sanitizeDecimalDraft } from '../../../utils/numericInput';

/** Sidebar / dialog numeric field: draft string while typing; commit on blur; invalid empty reverts. */
export function NumericField({
  value,
  onChange,
  step: _step = 0.1,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  className?: string;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const [focused, setFocused] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!focused) setDraft(String(value));
  }, [value, focused]);

  const commit = useCallback(() => {
    const parsed = tryParseCommittedNumber(draft);
    if (!parsed.ok) {
      setDraft(String(valueRef.current));
      return;
    }
    if (parsed.value === null) {
      setDraft(String(valueRef.current));
      return;
    }
    onChange(parsed.value);
  }, [draft, onChange]);

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      value={draft}
      onChange={e => setDraft(sanitizeDecimalDraft(e.target.value))}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        commit();
      }}
      onKeyDown={e => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
      className={className}
    />
  );
}
