/**
 * CSA A23.3 One-Way Slab Design
 * Flexural design per 1 m strip width with shear and crack control checks
 */

import {
  type SupportCondition,
  type ExposureClass,
  REBAR_DATA,
  PHI_C,
  PHI_S,
} from './types';

export type SlabBarSize = '10M' | '15M' | '20M' | '25M';

export const SLAB_BAR_SIZES: readonly SlabBarSize[] = ['10M', '15M', '20M', '25M'];

export interface ConcreteSlabInputs {
  Mf_kNm_m: number;
  Vf_kN_m: number;
  Ln_mm: number;
  h_mm: number;
  fc_MPa: number;
  fy_MPa: number;
  cover_mm: number;
  mainBarSize: SlabBarSize;
  supportCondition: SupportCondition;
  exposureClass: ExposureClass;
  isExterior: boolean;
  concreteDensity_kgm3: number;
}

export interface SlabFlexuralResult {
  d_mm: number;
  alpha1: number;
  beta1: number;
  As_required_mm2_m: number;
  As_min_mm2_m: number;
  As_provided_mm2_m: number;
  barSpacing_mm: number;
  barSpacingMax_mm: number;
  a_mm: number;
  c_mm: number;
  Mr_kNm_m: number;
  cdRatio: number;
  cdLimit: number;
  ductilityOk: boolean;
  utilizationFlexure: number;
}

export interface SlabShearResult {
  dv_mm: number;
  Vr_max_kN_m: number;
  beta: number;
  Vc_kN_m: number;
  Vr_kN_m: number;
  utilizationShear: number;
  shearOk: boolean;
}

export interface SlabCrackControlResult {
  fs_MPa: number;
  dc_mm: number;
  A_mm2: number;
  z_Nmm: number;
  zLimit_Nmm: number;
  crackControlOk: boolean;
}

export interface SlabMinThicknessResult {
  hMin_mm: number;
  thicknessOk: boolean;
  thicknessModifier: number;
}

export interface ConcreteSlabResult {
  inputs: ConcreteSlabInputs;
  minThickness: SlabMinThicknessResult;
  flexure: SlabFlexuralResult;
  shear: SlabShearResult;
  crackControl: SlabCrackControlResult;
  overallOk: boolean;
}

const STRIP_WIDTH = 1000;

export function getSlabThicknessDivisor(support: SupportCondition): number {
  switch (support) {
    case 'Simply Supported': return 20;
    case 'One End Continuous': return 24;
    case 'Both Ends Continuous': return 28;
    case 'Cantilever': return 10;
  }
}

export function computeConcreteSlab(input: ConcreteSlabInputs): ConcreteSlabResult {
  const {
    Mf_kNm_m,
    Vf_kN_m,
    Ln_mm,
    h_mm,
    fc_MPa,
    fy_MPa,
    cover_mm,
    mainBarSize,
    supportCondition,
    isExterior,
    concreteDensity_kgm3,
  } = input;

  const b_mm = STRIP_WIDTH;
  const mainBarDia = REBAR_DATA[mainBarSize].diameter;
  const mainBarArea = REBAR_DATA[mainBarSize].area;

  // Step 1: Minimum thickness (Table 9.2 — solid one-way slab row)
  const divisor = getSlabThicknessDivisor(supportCondition);
  let thicknessModifier = 1.0;
  if (concreteDensity_kgm3 <= 2150) {
    thicknessModifier *= Math.max(1.0, 1.65 - 0.0003 * concreteDensity_kgm3);
  }
  if (fy_MPa !== 400) {
    thicknessModifier *= (0.4 + fy_MPa / 670);
  }
  const hMin_mm = (Ln_mm / divisor) * thicknessModifier;
  const thicknessOk = h_mm >= hMin_mm;

  // Effective depth (no stirrups in slab)
  const d_mm = h_mm - cover_mm - mainBarDia / 2;

  // Step 2: Flexural design
  const alpha1 = Math.max(0.67, 0.85 - 0.0015 * fc_MPa);
  const beta1 = Math.max(0.67, 0.97 - 0.0025 * fc_MPa);

  // Minimum reinforcement (Cl. 10.5.1.2)
  const As_min_mm2_m = (0.2 * Math.sqrt(fc_MPa) / fy_MPa) * b_mm * h_mm;

  // Solve quadratic for As from Mr = φs·As·fy·(d - a/2)
  const Mf_Nmm = Mf_kNm_m * 1e6;
  const k1 = 2 * alpha1 * PHI_C * fc_MPa * b_mm;
  const discriminant = (k1 * d_mm) ** 2 - 2 * k1 * Mf_Nmm;

  let As_required_mm2_m: number;
  if (discriminant < 0) {
    As_required_mm2_m = Infinity;
  } else {
    const X = k1 * d_mm - Math.sqrt(discriminant);
    As_required_mm2_m = X / (PHI_S * fy_MPa);
  }

  const As_design_mm2_m = Math.max(As_required_mm2_m, As_min_mm2_m);

  // Bar spacing
  const barSpacingCalc_mm = Number.isFinite(As_design_mm2_m)
    ? (b_mm * mainBarArea) / As_design_mm2_m
    : 0;
  const barSpacingMax_mm = Math.min(3 * h_mm, 500);
  let barSpacing_mm = Math.min(barSpacingCalc_mm, barSpacingMax_mm);
  barSpacing_mm = Math.max(Math.floor(barSpacing_mm / 10) * 10, 50);

  const As_provided_mm2_m = (b_mm * mainBarArea) / barSpacing_mm;

  // Stress block depth with provided steel
  const a_mm = (PHI_S * As_provided_mm2_m * fy_MPa) / (alpha1 * PHI_C * fc_MPa * b_mm);
  const c_mm = a_mm / beta1;

  // Moment resistance
  const Mr_kNm_m = (PHI_S * As_provided_mm2_m * fy_MPa * (d_mm - a_mm / 2)) / 1e6;

  // Ductility check (Cl. 10.5.2)
  const cdRatio = c_mm / d_mm;
  const cdLimit = 700 / (700 + fy_MPa);
  const ductilityOk = cdRatio <= cdLimit;

  const utilizationFlexure = Mr_kNm_m > 0 ? Mf_kNm_m / Mr_kNm_m : Infinity;

  // Step 3: Shear (concrete only — slabs have no transverse reinforcement)
  const dv_mm = Math.max(0.9 * d_mm, 0.72 * h_mm);
  const Vr_max_kN_m = (0.25 * PHI_C * fc_MPa * b_mm * dv_mm) / 1000;

  // β for members without minimum transverse reinforcement (Cl. 11.3.6.3c)
  const beta_v = 230 / (1000 + dv_mm);
  const lambda = 1.0;
  const Vc_kN_m = (PHI_C * lambda * beta_v * Math.sqrt(fc_MPa) * b_mm * dv_mm) / 1000;
  const Vr_kN_m = Math.min(Vc_kN_m, Vr_max_kN_m);
  const utilizationShear = Vr_kN_m > 0 ? Vf_kN_m / Vr_kN_m : Infinity;
  const shearOk = utilizationShear <= 1.0;

  // Step 4: Crack control (Cl. 10.6.1)
  const fs_MPa = 0.6 * fy_MPa;
  const dc_mm = Math.min(cover_mm + mainBarDia / 2, 50);
  const numBarsPerMetre = b_mm / barSpacing_mm;
  const effectiveTensionDepth = 2 * (h_mm - d_mm);
  const A_mm2 = (effectiveTensionDepth * b_mm) / numBarsPerMetre;
  const z_Nmm = fs_MPa * Math.pow(dc_mm * A_mm2, 1 / 3);
  const zLimit_Nmm = isExterior ? 25000 : 30000;
  const crackControlOk = z_Nmm <= zLimit_Nmm;

  const overallOk = thicknessOk && ductilityOk && utilizationFlexure <= 1.0 && shearOk && crackControlOk;

  return {
    inputs: input,
    minThickness: { hMin_mm, thicknessOk, thicknessModifier },
    flexure: {
      d_mm,
      alpha1,
      beta1,
      As_required_mm2_m,
      As_min_mm2_m,
      As_provided_mm2_m,
      barSpacing_mm,
      barSpacingMax_mm,
      a_mm,
      c_mm,
      Mr_kNm_m,
      cdRatio,
      cdLimit,
      ductilityOk,
      utilizationFlexure,
    },
    shear: {
      dv_mm,
      Vr_max_kN_m,
      beta: beta_v,
      Vc_kN_m,
      Vr_kN_m,
      utilizationShear,
      shearOk,
    },
    crackControl: {
      fs_MPa,
      dc_mm,
      A_mm2,
      z_Nmm,
      zLimit_Nmm,
      crackControlOk,
    },
    overallOk,
  };
}
