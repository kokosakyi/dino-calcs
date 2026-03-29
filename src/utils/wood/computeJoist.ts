/**
 * Dimension lumber joist — simply supported, UDL.
 * Units: span/spacing/bearing in mm; factored/service loading in kPa; strengths in MPa; E in MPa.
 * Moment in kN·m; shear/bearing in kN; deflection in mm.
 */
import type {
  LoadDuration,
  ServiceCondition,
  SystemCase,
  TreatmentCondition,
  WoodGrade,
  WoodSpecies,
} from './types';
import { getSawnLumberProps } from './sawnLumber';
import { parseSectionMm } from './sections';
import { woodKD, woodKH, woodKS, woodKT, woodKZ } from './modificationFactors';
import { WOOD_PHI, woodComputeKL } from './lateralStability';

export interface WoodJoistInputs {
  factoredLoading_kPa: number;
  serviceLoading_kPa: number;
  joistSpacing_mm: number;
  joistSpan_mm: number;
  bearingLength_mm: number;
  unsupportedLength_mm: number;
  species: WoodSpecies;
  grade: WoodGrade;
  sectionLabel: string;
  loadDuration: LoadDuration;
  serviceCondition: ServiceCondition;
  treatmentCondition: TreatmentCondition;
  systemCase: SystemCase;
}

export interface WoodJoistResult {
  Mf_kNm: number;
  Vf_kN: number;
  Qf_kN: number;
  Mr_kNm: number;
  Vr_kN: number;
  Qr_kN: number;
  delta_mm: number;
  deltaLimit_mm: number;
  utilization: {
    bending: number;
    shear: number;
    deflection: number;
    bearing: number;
  };
  factors: {
    KD: number;
    KH: number;
    KSb: number;
    KSv: number;
    KScp: number;
    KSE: number;
    KT: number;
    KZb: number;
    KZv: number;
    KZcp: number;
    KL: number;
  };
  geometry: { b_mm: number; d_mm: number; S_mm3: number; I_mm4: number };
}

const KB = 1.0;

export function computeWoodJoist(input: WoodJoistInputs): WoodJoistResult {
  const mat = getSawnLumberProps(input.species, input.grade);
  const { b, d } = parseSectionMm(input.sectionLabel);
  const breadth = b;

  const KD = woodKD(input.loadDuration);
  const KH = woodKH(input.systemCase, 'KHb', 'visual');
  const KSb = woodKS('KSb', input.serviceCondition, breadth);
  const KSv = woodKS('KSv', input.serviceCondition, breadth);
  const KScp = woodKS('KScp', input.serviceCondition, breadth);
  const KSE = woodKS('KSE', input.serviceCondition, breadth);
  const KT = woodKT(input.treatmentCondition, input.serviceCondition);

  const KZb = woodKZ(b, d, 'KZb');
  const KZv = woodKZ(b, d, 'KZv');
  const KZcp = woodKZ(b, d, 'KZcp');

  const Le = 1.92 * input.unsupportedLength_mm;
  const KL = woodComputeKL({
    Le,
    b,
    d,
    E: mat.E,
    KSE,
    KT,
    fb: mat.fb,
    KD,
    KH,
    KSb,
  });

  const { fb, fv, fcp } = mat;
  const S = (b * d ** 2) / 6;
  const I = (b * d ** 3) / 12;

  const Mf_kNm =
    ((input.factoredLoading_kPa * input.joistSpacing_mm * input.joistSpan_mm ** 2) / 8) * 1e-9;
  const Vf_kN =
    0.5 *
    input.factoredLoading_kPa *
    input.joistSpacing_mm *
    input.joistSpan_mm *
    (1 - (2 * d) / input.joistSpan_mm) *
    1e-6;
  const Qf_kN = 0.5 * input.factoredLoading_kPa * input.joistSpacing_mm * input.joistSpan_mm * 1e-6;

  const Mr_kNm =
    (WOOD_PHI.b * fb * KD * KH * KSb * KT * S * KZb * KL) / 1e6;
  const An = b * d;
  const Vr_kN =
    (WOOD_PHI.v * fv * KD * KH * KSv * KT * (2 / 3) * An * KZv) / 1e3;
  const Qr_kN =
    WOOD_PHI.cp * fcp * KD * KScp * KT * b * input.bearingLength_mm * KB * KZcp * 1e-3;

  const delta_mm =
    ((5 * input.serviceLoading_kPa * input.joistSpacing_mm * input.joistSpan_mm ** 4) /
      (384 * mat.E * KSE * KT * I)) *
    1e-3;
  const deltaLimit_mm = (input.joistSpan_mm - input.bearingLength_mm) / 360;

  return {
    Mf_kNm,
    Vf_kN,
    Qf_kN,
    Mr_kNm,
    Vr_kN,
    Qr_kN,
    delta_mm,
    deltaLimit_mm,
    utilization: {
      bending: Mr_kNm > 0 ? Mf_kNm / Mr_kNm : 0,
      shear: Vr_kN > 0 ? Vf_kN / Vr_kN : 0,
      deflection: deltaLimit_mm > 0 ? delta_mm / deltaLimit_mm : 0,
      bearing: Qr_kN > 0 ? Qf_kN / Qr_kN : 0,
    },
    factors: { KD, KH, KSb, KSv, KScp, KSE, KT, KZb, KZv, KZcp, KL },
    geometry: { b_mm: b, d_mm: d, S_mm3: S, I_mm4: I },
  };
}
