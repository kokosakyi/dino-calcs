export type UnitSystem = 'SI' | 'Imperial';

interface UnitConversion {
  force: { label: string; factor: number };
  length: { label: string; factor: number };
  moment: { label: string; factor: number };
  stress: { label: string; factor: number };
  area: { label: string; factor: number };
  inertia: { label: string; factor: number };
  distLoad: { label: string; factor: number };
}

const SI_UNITS: UnitConversion = {
  force: { label: 'kN', factor: 1e-3 },
  length: { label: 'm', factor: 1 },
  moment: { label: 'kN·m', factor: 1e-3 },
  stress: { label: 'MPa', factor: 1e-6 },
  area: { label: 'mm²', factor: 1e6 },
  inertia: { label: 'mm⁴', factor: 1e12 },
  distLoad: { label: 'kN/m', factor: 1e-3 },
};

const IMPERIAL_UNITS: UnitConversion = {
  force: { label: 'kip', factor: 1 / 4448.22 },
  length: { label: 'ft', factor: 3.28084 },
  moment: { label: 'kip·ft', factor: 1 / (4448.22 * 0.3048) },
  stress: { label: 'ksi', factor: 1 / 6894757 },
  area: { label: 'in²', factor: 1550 },
  inertia: { label: 'in⁴', factor: 2402509.61 },
  distLoad: { label: 'kip/ft', factor: 1 / (4448.22 / 0.3048) },
};

export function getUnits(system: UnitSystem): UnitConversion {
  return system === 'SI' ? SI_UNITS : IMPERIAL_UNITS;
}

export function formatValue(value: number, decimals: number = 4): string {
  if (Math.abs(value) < 1e-10) return '0';
  if (Math.abs(value) > 1e6 || Math.abs(value) < 1e-3) return value.toExponential(decimals);
  return value.toFixed(decimals);
}
