/**
 * Solid sawn timber beam (Table 6.3.1C sizes). K_H taken as 1.0 (legacy sandbox).
 */
import type {
  LoadDuration,
  ServiceCondition,
  TreatmentCondition,
  WoodGrade,
  WoodSpecies,
} from './types';
import { getSawnTimberProps } from './sawnTimber';
import { parseSectionMm } from './sections';
import { woodKD, woodKS, woodKT, woodKZ } from './modificationFactors';
import { WOOD_PHI, woodComputeKL, woodComputeKN } from './lateralStability';

const KB = 1.0;
const FF = 0.5;
/** K_H = 1.0 for timber beam module (legacy sandbox). */
const KH = 1.0;

export interface WoodSawnTimberBeamInputs {
  factoredLoading_kPa: number;
  serviceLoading_kPa: number;
  tributaryWidth_mm: number;
  beamSpan_mm: number;
  bearingLength_mm: number;
  unsupportedLength_mm: number;
  notchDepth_mm: number;
  species: WoodSpecies;
  grade: WoodGrade;
  sectionLabel: string;
  loadDuration: LoadDuration;
  serviceCondition: ServiceCondition;
  treatmentCondition: TreatmentCondition;
}

export interface WoodSawnTimberBeamResult {
  Mf_kNm: number;
  Vf_kN: number;
  Qf_kN: number;
  Mr_kNm: number;
  Vr_kN: number;
  Qr_kN: number;
  Fr_kN: number;
  delta_mm: number;
  deltaLimit_mm: number;
  utilization: {
    bending: number;
    shear: number;
    deflection: number;
    bearing: number;
    shearFracture: number;
  };
  factors: {
    KD: number;
    KH: number;
    KSb: number;
    KSv: number;
    KSf: number;
    KScp: number;
    KSE: number;
    KT: number;
    KZb: number;
    KZv: number;
    KZcp: number;
    KL: number;
    KN: number;
  };
  geometry: { b_mm: number; d_mm: number; dn_mm: number; S_mm3: number; I_mm4: number };
}

export function computeWoodSawnTimberBeam(input: WoodSawnTimberBeamInputs): WoodSawnTimberBeamResult {
  const mat = getSawnTimberProps(input.species, input.grade);
  const { b, d } = parseSectionMm(input.sectionLabel);
  const dn = Math.min(input.notchDepth_mm, 0.25 * d);

  const KD = woodKD(input.loadDuration);
  const KSb = woodKS('KSb', input.serviceCondition, b);
  const KSv = woodKS('KSv', input.serviceCondition, b);
  const KSf = woodKS('KSf', input.serviceCondition, b);
  const KScp = woodKS('KScp', input.serviceCondition, b);
  const KSE = woodKS('KSE', input.serviceCondition, b);
  const KT = woodKT(input.treatmentCondition, input.serviceCondition);

  const KZb = woodKZ(b, d, 'KZb');
  const KZv = woodKZ(b, d, 'KZv');
  const KZcp = woodKZ(b, d, 'KZcp');

  const Le = 1.92 * input.unsupportedLength_mm;
  const e_mm = input.bearingLength_mm / 2 + 2;
  const alpha = 1 - dn / d;
  const eta = e_mm / d;
  const KN = woodComputeKN(alpha, eta, d);

  const { fb, fv, fcp } = mat;
  const S = (b * d ** 2) / 6;
  const I = (b * d ** 3) / 12;
  const An = b * (d - dn);

  const KL = woodComputeKL({
    Le,
    b,
    d,
    E: mat.E,
    KSE,
    KT,
    fb,
    KD,
    KH,
    KSb,
  });

  const Mf_kNm =
    ((input.factoredLoading_kPa * input.tributaryWidth_mm * input.beamSpan_mm ** 2) / 8) * 1e-9;
  const Vf_kN =
    0.5 *
    input.factoredLoading_kPa *
    input.tributaryWidth_mm *
    input.beamSpan_mm *
    (1 - (d - dn + d) / input.beamSpan_mm) *
    1e-6;
  const Qf_kN =
    0.5 * input.factoredLoading_kPa * input.tributaryWidth_mm * input.beamSpan_mm * 1e-6;

  const Mr_kNm = (WOOD_PHI.b * fb * KD * KH * KSb * KT * S * KZb * KL) / 1e6;
  const Vr_kN =
    (WOOD_PHI.v * fv * KD * KH * KSv * KT * (2 / 3) * An * KZv) / 1e3;
  const Qr_kN =
    WOOD_PHI.cp * fcp * KD * KScp * KT * b * input.bearingLength_mm * KB * KZcp * 1e-3;
  const Fr_kN =
    WOOD_PHI.f * (FF * KD * KH * KSf * KT) * b * d * KN * 1e-3;

  const delta_mm =
    ((5 *
      input.serviceLoading_kPa *
      input.tributaryWidth_mm *
      input.beamSpan_mm ** 4) /
      (384 * mat.E * KSE * KT * I)) *
    1e-3;
  const deltaLimit_mm = (input.beamSpan_mm - input.bearingLength_mm) / 360;

  return {
    Mf_kNm,
    Vf_kN,
    Qf_kN,
    Mr_kNm,
    Vr_kN,
    Qr_kN,
    Fr_kN,
    delta_mm,
    deltaLimit_mm,
    utilization: {
      bending: Mr_kNm > 0 ? Mf_kNm / Mr_kNm : 0,
      shear: Vr_kN > 0 ? Vf_kN / Vr_kN : 0,
      deflection: deltaLimit_mm > 0 ? delta_mm / deltaLimit_mm : 0,
      bearing: Qr_kN > 0 ? Qf_kN / Qr_kN : 0,
      shearFracture: Fr_kN > 0 && Number.isFinite(Fr_kN) ? Qf_kN / Fr_kN : 0,
    },
    factors: { KD, KH, KSb, KSv, KSf, KScp, KSE, KT, KZb, KZv, KZcp, KL, KN },
    geometry: { b_mm: b, d_mm: d, dn_mm: dn, S_mm3: S, I_mm4: I },
  };
}
