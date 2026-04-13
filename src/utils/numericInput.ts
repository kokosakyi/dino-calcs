/**
 * Parse a committed text field value on blur.
 * Returns `null` for intentional empty; `{ ok: false }` for invalid partials (e.g. lone "-") so UI can revert.
 */
export function tryParseCommittedNumber(
  raw: string,
): { ok: true; value: number | null } | { ok: false } {
  const t = raw.trim();
  if (t === '') return { ok: true, value: null };
  if (t === '-' || t === '+' || t === '.' || t === '-.' || t === '+.') return { ok: false };
  const n = Number(t);
  if (!Number.isFinite(n)) return { ok: false };
  return { ok: true, value: n };
}

export function clamp(n: number, min?: number, max?: number): number {
  let x = n;
  if (min !== undefined && x < min) x = min;
  if (max !== undefined && x > max) x = max;
  return x;
}

/**
 * Strip letters and other non-numeric characters while typing/pasting.
 * Keeps valid partials: "", "-", ".", "-.", "12", "12.", etc.
 */
export function sanitizeDecimalDraft(
  raw: string,
  opts?: { allowNegative?: boolean },
): string {
  const allowNegative = opts?.allowNegative ?? true;
  let out = '';
  let hasDot = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch >= '0' && ch <= '9') {
      out += ch;
      continue;
    }
    if (ch === '.' && !hasDot) {
      hasDot = true;
      out += '.';
      continue;
    }
    if (allowNegative && ch === '-' && out === '') {
      out += '-';
    }
  }
  return out;
}
