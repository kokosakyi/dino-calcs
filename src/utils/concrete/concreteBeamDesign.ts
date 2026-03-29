/**
 * CSA A23.3 Rectangular Reinforced Concrete Beam Design
 * Flexural and shear design with crack control checks
 */

import {
  type SupportCondition,
  type ExposureClass,
  type MainBarSize,
  type StirrupSize,
  REBAR_DATA,
  PHI_C,
  PHI_S,
} from './types';

export interface ConcreteBeamInputs {
  Mf_kNm: number;
  Vf_kN: number;
  Ln_mm: number;
  b_mm: number;
  h_mm: number;
  fc_MPa: number;
  fy_MPa: number;
  cover_mm: number;
  stirrupSize: StirrupSize;
  mainBarSize: MainBarSize;
  supportCondition: SupportCondition;
  exposureClass: ExposureClass;
  isExterior: boolean;
  concreteDensity_kgm3: number;
}

export interface FlexuralDesignResult {
  d_mm: number;
  alpha1: number;
  beta1: number;
  As_required_mm2: number;
  As_min_mm2: number;
  As_provided_mm2: number;
  numBars: number;
  a_mm: number;
  c_mm: number;
  Mr_kNm: number;
  cdRatio: number;
  cdLimit: number;
  ductilityOk: boolean;
  utilizationFlexure: number;
}

export interface ShearDesignResult {
  dv_mm: number;
  Vr_max_kN: number;
  beta: number;
  theta_deg: number;
  Vc_kN: number;
  Vs_required_kN: number;
  stirrupSpacing_mm: number;
  stirrupSpacingMax_mm: number;
  Av_mm2: number;
  Av_min_mm2: number;
  Vr_kN: number;
  utilizationShear: number;
  shearReinfRequired: boolean;
}

export interface CrackControlResult {
  fs_MPa: number;
  dc_mm: number;
  A_mm2: number;
  z_Nmm: number;
  zLimit_Nmm: number;
  crackControlOk: boolean;
}

export interface MinThicknessResult {
  hMin_mm: number;
  thicknessOk: boolean;
  thicknessModifier: number;
}

export interface ConcreteBeamResult {
  inputs: ConcreteBeamInputs;
  minThickness: MinThicknessResult;
  flexure: FlexuralDesignResult;
  shear: ShearDesignResult;
  crackControl: CrackControlResult;
  overallOk: boolean;
}

function getMinThicknessDivisor(support: SupportCondition): number {
  switch (support) {
    case 'Simply Supported': return 16;
    case 'One End Continuous': return 18;
    case 'Both Ends Continuous': return 21;
    case 'Cantilever': return 8;
  }
}

function getMinCover(exposure: ExposureClass): number {
  switch (exposure) {
    case 'N':
    case 'F-2':
      return 30;
    case 'F-1':
    case 'S-3':
      return 40;
    case 'C-1':
    case 'C-2':
    case 'C-3':
    case 'C-4':
    case 'A-1':
    case 'A-2':
    case 'A-3':
    case 'A-4':
    case 'S-1':
    case 'S-2':
      return 50;
    default:
      return 40;
  }
}

export function computeConcreteBeam(input: ConcreteBeamInputs): ConcreteBeamResult {
  const {
    Mf_kNm,
    Vf_kN,
    Ln_mm,
    b_mm,
    h_mm,
    fc_MPa,
    fy_MPa,
    cover_mm,
    stirrupSize,
    mainBarSize,
    supportCondition,
    isExterior,
    concreteDensity_kgm3,
  } = input;

  const stirrupDia = REBAR_DATA[stirrupSize].diameter;
  const mainBarDia = REBAR_DATA[mainBarSize].diameter;
  const mainBarArea = REBAR_DATA[mainBarSize].area;
  const stirrupArea = REBAR_DATA[stirrupSize].area;

  // Step 1: Minimum thickness check (Table 9.2)
  const divisor = getMinThicknessDivisor(supportCondition);
  let thicknessModifier = 1.0;
  
  if (concreteDensity_kgm3 <= 2150) {
    thicknessModifier *= Math.max(1.0, 1.65 - 0.0003 * concreteDensity_kgm3);
  }
  if (fy_MPa !== 400) {
    thicknessModifier *= (0.4 + fy_MPa / 670);
  }
  
  const hMin_mm = (Ln_mm / divisor) * thicknessModifier;
  const thicknessOk = h_mm >= hMin_mm;

  // Effective depth
  const d_mm = h_mm - cover_mm - stirrupDia - mainBarDia / 2;

  // Step 2: Flexural design
  const alpha1 = Math.max(0.67, 0.85 - 0.0015 * fc_MPa);
  const beta1 = Math.max(0.67, 0.97 - 0.0025 * fc_MPa);

  // Minimum reinforcement (Cl. 10.5.1.2)
  const As_min_mm2 = (0.2 * Math.sqrt(fc_MPa) / fy_MPa) * b_mm * h_mm;

  // Solve quadratic for As: Mr = φs·As·fy·(d - a/2), where a = φs·As·fy / (α1·φc·f'c·b)
  // Mf = φs·As·fy·d - (φs·As·fy)² / (2·α1·φc·f'c·b)
  // Let X = φs·As·fy, then: Mf = X·d - X²/(2·α1·φc·f'c·b)
  // Rearranging: X² - 2·α1·φc·f'c·b·d·X + 2·α1·φc·f'c·b·Mf = 0
  
  const Mf_Nmm = Mf_kNm * 1e6;
  const k1 = 2 * alpha1 * PHI_C * fc_MPa * b_mm;
  const discriminant = (k1 * d_mm) ** 2 - 2 * k1 * Mf_Nmm;
  
  let As_required_mm2: number;
  if (discriminant < 0) {
    As_required_mm2 = Infinity;
  } else {
    const X = k1 * d_mm - Math.sqrt(discriminant);
    As_required_mm2 = X / (PHI_S * fy_MPa);
  }

  const As_design_mm2 = Math.max(As_required_mm2, As_min_mm2);
  const numBars = Math.ceil(As_design_mm2 / mainBarArea);
  const As_provided_mm2 = numBars * mainBarArea;

  // Stress block depth with provided steel
  const a_mm = (PHI_S * As_provided_mm2 * fy_MPa) / (alpha1 * PHI_C * fc_MPa * b_mm);
  const c_mm = a_mm / beta1;

  // Moment resistance
  const Mr_kNm = (PHI_S * As_provided_mm2 * fy_MPa * (d_mm - a_mm / 2)) / 1e6;

  // Ductility check (Cl. 10.5.2)
  const cdRatio = c_mm / d_mm;
  const cdLimit = 700 / (700 + fy_MPa);
  const ductilityOk = cdRatio <= cdLimit;

  const utilizationFlexure = Mr_kNm > 0 ? Mf_kNm / Mr_kNm : Infinity;

  // Step 3: Shear design
  const dv_mm = Math.max(0.9 * d_mm, 0.72 * h_mm);
  
  // Maximum shear limit (Cl. 11.3.3)
  const Vr_max_kN = (0.25 * PHI_C * fc_MPa * b_mm * dv_mm) / 1000;

  // Simplified method (Cl. 11.3.6.2): β = 0.18, θ = 35° for members with min transverse reinf and fy ≤ 400
  const beta = 0.18;
  const theta_deg = 35;
  const theta_rad = (theta_deg * Math.PI) / 180;
  const lambda = 1.0; // Normal density concrete

  // Concrete shear resistance (Cl. 11.3.4)
  const Vc_kN = (PHI_C * lambda * beta * Math.sqrt(fc_MPa) * b_mm * dv_mm) / 1000;

  // Steel shear resistance required
  const Vs_required_kN = Math.max(0, Vf_kN - Vc_kN);
  const shearReinfRequired = Vf_kN > Vc_kN;

  // Stirrup spacing for required Vs (Cl. 11.3.5.1)
  // Vs = φs·Av·fy·dv·cot(θ) / s
  const Av_mm2 = 2 * stirrupArea; // Two legs
  let stirrupSpacing_mm: number;
  
  if (Vs_required_kN > 0) {
    stirrupSpacing_mm = (PHI_S * Av_mm2 * fy_MPa * dv_mm * (1 / Math.tan(theta_rad))) / (Vs_required_kN * 1000);
  } else {
    stirrupSpacing_mm = 600; // Default max
  }

  // Minimum shear reinforcement (Cl. 11.2.8.2)
  const Av_min_mm2 = (0.06 * Math.sqrt(fc_MPa) * b_mm * stirrupSpacing_mm) / fy_MPa;

  // Maximum spacing (Cl. 11.3.8.1)
  let stirrupSpacingMax_mm = Math.min(0.7 * dv_mm, 600);
  
  // Reduce by half if high shear (Cl. 11.3.8.3)
  const highShearLimit_kN = (0.125 * lambda * PHI_C * fc_MPa * b_mm * dv_mm) / 1000;
  if (Vf_kN > highShearLimit_kN) {
    stirrupSpacingMax_mm /= 2;
  }

  stirrupSpacing_mm = Math.min(stirrupSpacing_mm, stirrupSpacingMax_mm);
  stirrupSpacing_mm = Math.floor(stirrupSpacing_mm / 25) * 25; // Round down to 25mm increments

  // Actual shear resistance
  const Vs_kN = (PHI_S * Av_mm2 * fy_MPa * dv_mm * (1 / Math.tan(theta_rad))) / (stirrupSpacing_mm * 1000);
  const Vr_kN = Math.min(Vc_kN + Vs_kN, Vr_max_kN);

  const utilizationShear = Vr_kN > 0 ? Vf_kN / Vr_kN : Infinity;

  // Step 4: Crack control (Cl. 10.6.1)
  const fs_MPa = 0.6 * fy_MPa;
  const dc_mm = Math.min(cover_mm + stirrupDia + mainBarDia / 2, 50); // Capped at 50mm
  
  // Effective tension area per bar
  const effectiveTensionDepth = 2 * (h_mm - d_mm);
  const A_mm2 = (effectiveTensionDepth * b_mm) / numBars;
  
  const z_Nmm = fs_MPa * Math.pow(dc_mm * A_mm2, 1 / 3);
  const zLimit_Nmm = isExterior ? 25000 : 30000;
  const crackControlOk = z_Nmm <= zLimit_Nmm;

  const overallOk = thicknessOk && ductilityOk && utilizationFlexure <= 1.0 && utilizationShear <= 1.0 && crackControlOk;

  return {
    inputs: input,
    minThickness: {
      hMin_mm,
      thicknessOk,
      thicknessModifier,
    },
    flexure: {
      d_mm,
      alpha1,
      beta1,
      As_required_mm2,
      As_min_mm2,
      As_provided_mm2,
      numBars,
      a_mm,
      c_mm,
      Mr_kNm,
      cdRatio,
      cdLimit,
      ductilityOk,
      utilizationFlexure,
    },
    shear: {
      dv_mm,
      Vr_max_kN,
      beta,
      theta_deg,
      Vc_kN,
      Vs_required_kN,
      stirrupSpacing_mm,
      stirrupSpacingMax_mm,
      Av_mm2,
      Av_min_mm2,
      Vr_kN,
      utilizationShear,
      shearReinfRequired,
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

export { getMinCover };
