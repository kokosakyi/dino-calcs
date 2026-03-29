import type { LoadDuration, ServiceCondition, TreatmentCondition, SystemCase } from './types';

type KsKind =
  | 'KSb'
  | 'KSf'
  | 'KSv'
  | 'KSc'
  | 'KScp'
  | 'KSt'
  | 'KSE';

type KhStrength = 'KHb' | 'KHv' | 'KHc' | 'KHt';

/**
 * Load duration factor K_D (CSA O86).
 * @param PL – permanent load (optional, long-term refined case)
 * @param PS – total factored load (optional)
 */
export function woodKD(loadDuration: LoadDuration, PL?: number, PS?: number): number {
  switch (loadDuration) {
    case 'Short Term':
      return 1.15;
    case 'Standard Term':
      return 1.0;
    case 'Long Term':
      if (PL === undefined && PS === undefined) return 0.65;
      return Math.max(1 - 0.5 * Math.log10(PL! / PS!), 0.65);
    default:
      return 1.0;
  }
}

/** Size / service condition factor K_S */
export function woodKS(
  property: KsKind,
  serviceCondition: ServiceCondition,
  leastDimension: number
): number {
  const ld = typeof leastDimension === 'string' ? parseFloat(String(leastDimension)) : leastDimension;
  if (serviceCondition === 'Dry') return 1.0;

  switch (property) {
    case 'KSb':
      return ld <= 89 ? 0.84 : 1.0;
    case 'KSf':
      return 0.7;
    case 'KSv':
      return ld <= 89 ? 0.96 : 1.0;
    case 'KSc':
      return ld <= 89 ? 0.69 : 0.91;
    case 'KScp':
      return 0.67;
    case 'KSt':
      return ld <= 89 ? 0.84 : 1.0;
    case 'KSE':
      return ld <= 89 ? 0.94 : 1.0;
    default:
      return 1.0;
  }
}

/** System factor K_H */
export function woodKH(
  caseType: SystemCase,
  specifiedStrength: KhStrength,
  grading: 'visual' | 'machine'
): number {
  switch (caseType) {
    case 'Case 1':
      switch (specifiedStrength) {
        case 'KHb':
        case 'KHv':
        case 'KHc':
        case 'KHt':
          return 1.1;
        default:
          return 1.0;
      }
    case 'Case 2':
      if (grading === 'visual') {
        switch (specifiedStrength) {
          case 'KHb':
          case 'KHv':
            return 1.4;
          case 'KHc':
            return 1.1;
          case 'KHt':
            return 0.0;
          default:
            return 1.0;
        }
      }
      switch (specifiedStrength) {
        case 'KHb':
        case 'KHv':
          return 1.2;
        case 'KHc':
          return 1.1;
        case 'KHt':
          return 0;
        default:
          return 1.0;
      }
    default:
      switch (specifiedStrength) {
        case 'KHb':
        case 'KHv':
          return 1.1;
        case 'KHc':
        case 'KHt':
          return 1.0;
        default:
          return 1.0;
      }
  }
}

/**
 * Treatment factor K_T. When property is omitted (legacy sandbox behavior), returns 1.0.
 */
export function woodKT(
  product: TreatmentCondition,
  serviceCondition: ServiceCondition,
  property?: 'modulusOfElasticity' | 'strength'
): number {
  if (!property) return 1.0;
  if (serviceCondition === 'Dry') {
    if (product === 'Treated-Incised') {
      return property === 'modulusOfElasticity' ? 0.9 : 0.75;
    }
    return 1.0;
  }
  if (product === 'Treated-Incised') {
    return property === 'modulusOfElasticity' ? 0.95 : 0.85;
  }
  return 1.0;
}

type KzKind = 'KZb' | 'KZv' | 'KZt' | 'KZcp';

/** Size factor K_Zv / K_Zb / bearing geometry */
export function woodKZ(b: number, d: number, specifiedStrength: KzKind): number {
  const bd = typeof b === 'string' ? parseFloat(String(b)) : b;
  const dd = typeof d === 'string' ? parseFloat(String(d)) : d;
  const smallerDimension = Math.min(bd, dd);
  const largerDimension = Math.max(bd, dd);

  if (specifiedStrength === 'KZcp') {
    const bOverD = bd / dd;
    if (bOverD <= 1.0) return 1.0;
    if (bOverD >= 2.0) return 1.15;
    return 0.15 * bOverD + 0.85;
  }

  if (specifiedStrength === 'KZt') {
    if (largerDimension <= 89) return 1.5;
    if (largerDimension === 114) return 1.4;
    if (largerDimension === 140) return 1.3;
    if (largerDimension <= 191) return 1.2;
    if (largerDimension <= 241) return 1.1;
    if (largerDimension <= 292) return 1.0;
    if (largerDimension <= 343) return 0.9;
    return 0.8;
  }

  // KZb, KZv
  if (specifiedStrength === 'KZb' || specifiedStrength === 'KZv') {
    if (smallerDimension <= 64) {
      if (largerDimension <= 89) return 1.7;
      if (largerDimension === 114) return 1.5;
      if (largerDimension === 140) return 1.4;
      if (largerDimension <= 191) return 1.2;
      if (largerDimension <= 241) return 1.1;
      if (largerDimension <= 292) return 1.0;
      if (largerDimension <= 343) return 0.9;
      return 0.8;
    }
    if (smallerDimension <= 102) {
      if (largerDimension <= 89) return 1.7;
      if (largerDimension === 114) return 1.6;
      if (largerDimension === 140) return 1.5;
      if (largerDimension <= 191) return 1.3;
      if (largerDimension <= 241) return 1.2;
      if (largerDimension <= 292) return 1.1;
      if (largerDimension <= 343) return 1.0;
      return 0.9;
    }
    if (largerDimension <= 89) return 1.3;
    if (largerDimension === 114) return 1.3;
    if (largerDimension === 140) return 1.3;
    if (largerDimension <= 191) return 1.3;
    if (largerDimension <= 241) return 1.2;
    if (largerDimension <= 292) return 1.1;
    if (largerDimension <= 343) return 1.0;
    return 0.9;
  }

  return 1.0;
}
