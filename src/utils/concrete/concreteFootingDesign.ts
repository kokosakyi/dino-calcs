/**
 * CSA A23.3 Rectangular isolated spread footing (centered column)
 * SLS bearing, ULS one-way shear, punching, flexure, simplified development — per project spec / A23.3-19
 */

import { type MainBarSize, REBAR_DATA, PHI_C, PHI_S } from './types';

const LAMBDA = 1.0;
const GAMMA_CONCRETE_KNM3 = 24;
const SHEAR_BETA = 0.18; // Cl. 11.3.6.2 simplified method

export interface ConcreteFootingInputs {
  columnCx_mm: number;
  columnCy_mm: number;
  deadLoad_kN: number;
  liveLoad_kN: number;
  qAllow_kPa: number;
  footingB_mm: number;
  footingL_mm: number;
  footingH_mm: number;
  fc_MPa: number;
  fy_MPa: number;
  cover_mm: number;
  barSizeB: MainBarSize;
  barSizeL: MainBarSize;
  backfillDepth_mm: number;
  soilUnitWeight_kNm3: number;
}

export interface FootingSlsResult {
  area_m2: number;
  selfWeightConcrete_kN: number;
  selfWeightBackfill_kN: number;
  totalService_kN: number;
  qService_kPa: number;
  bearingOk: boolean;
  utilizationBearing: number;
}

export interface FootingUlsResult {
  factoredLoad_kN: number;
  qu_kPa: number;
}

export interface FootingOneWayShearResult {
  d_mm: number;
  dAvg_mm: number;
  VfB_kN: number;
  VcB_kN: number;
  unityB: number;
  okB: boolean;
  VfL_kN: number;
  VcL_kN: number;
  unityL: number;
  okL: boolean;
}

export interface FootingPunchingResult {
  bo_mm: number;
  beta_c: number;
  alpha_s: number;
  vc_MPa: number;
  Vr_punch_kN: number;
  Vf_punch_kN: number;
  unityPunch: number;
  ok: boolean;
}

export interface FootingFlexureDirectionResult {
  cantilever_mm: number;
  Mf_kNm: number;
  b_mm: number;
  d_mm: number;
  As_required_mm2: number;
  As_min_mm2: number;
  As_provided_mm2: number;
  numBars: number;
  barSpacing_mm: number;
  Mr_kNm: number;
  utilization: number;
  ductilityOk: boolean;
  cdRatio: number;
  cdLimit: number;
}

export interface FootingFlexureResult {
  dirB: FootingFlexureDirectionResult;
  dirL: FootingFlexureDirectionResult;
}

export interface FootingDevelopmentResult {
  ld_mm: number;
  availB_mm: number;
  availL_mm: number;
  okB: boolean;
  okL: boolean;
}

export interface ConcreteFootingResult {
  inputs: ConcreteFootingInputs;
  sls: FootingSlsResult;
  uls: FootingUlsResult;
  oneWay: FootingOneWayShearResult;
  punching: FootingPunchingResult;
  flexure: FootingFlexureResult;
  development: FootingDevelopmentResult;
  overallOk: boolean;
}

function areaM2(B_mm: number, L_mm: number): number {
  return (B_mm * L_mm) / 1e6;
}

function volumeM3(B_mm: number, L_mm: number, h_mm: number): number {
  return (B_mm * L_mm * h_mm) / 1e9;
}

/** Factored load on footing (NBCC-style gravity: 1.25D + 1.5L on column; 1.25 on footing/backfill self-weight) */
function factoredFootingLoad_kN(
  D_kN: number,
  L_kN: number,
  W_conc_kN: number,
  W_bf_kN: number
): number {
  return 1.25 * (D_kN + W_conc_kN + W_bf_kN) + 1.5 * L_kN;
}

export function computeConcreteFooting(input: ConcreteFootingInputs): ConcreteFootingResult {
  const {
    columnCx_mm: cx,
    columnCy_mm: cy,
    deadLoad_kN: D,
    liveLoad_kN: L,
    qAllow_kPa,
    footingB_mm: B,
    footingL_mm: Lf,
    footingH_mm: h,
    fc_MPa,
    fy_MPa,
    cover_mm,
    barSizeB,
    barSizeL,
    backfillDepth_mm,
    soilUnitWeight_kNm3,
  } = input;

  const dbB = REBAR_DATA[barSizeB].diameter;
  const dbL = REBAR_DATA[barSizeL].diameter;
  const areaB = REBAR_DATA[barSizeB].area;
  const areaL = REBAR_DATA[barSizeL].area;

  const dB_mm = h - cover_mm - dbL / 2;
  const dL_mm = h - cover_mm - dbB / 2;
  const dAvg_mm = (dB_mm + dL_mm) / 2;

  const A_m2 = areaM2(B, Lf);
  const W_conc = volumeM3(B, Lf, h) * GAMMA_CONCRETE_KNM3;
  const W_bf = volumeM3(B, Lf, backfillDepth_mm) * soilUnitWeight_kNm3;
  const totalService = D + L + W_conc + W_bf;
  const qService_kPa = A_m2 > 0 ? totalService / A_m2 : Infinity;
  const utilizationBearing = qAllow_kPa > 0 ? qService_kPa / qAllow_kPa : Infinity;
  const bearingOk = qService_kPa <= qAllow_kPa;

  const Pu_kN = factoredFootingLoad_kN(D, L, W_conc, W_bf);
  const qu_kPa = A_m2 > 0 ? Pu_kN / A_m2 : Infinity;

  const cantB_mm = (B - cx) / 2;
  const cantL_mm = (Lf - cy) / 2;

  const spanB_m = Math.max(0, (cantB_mm - dB_mm) / 1000);
  const VfB_kN = qu_kPa * (Lf / 1000) * spanB_m;

  const spanL_m = Math.max(0, (cantL_mm - dL_mm) / 1000);
  const VfL_kN = qu_kPa * (B / 1000) * spanL_m;

  const VcB_kN = (PHI_C * LAMBDA * SHEAR_BETA * Math.sqrt(fc_MPa) * Lf * dB_mm) / 1000;
  const VcL_kN = (PHI_C * LAMBDA * SHEAR_BETA * Math.sqrt(fc_MPa) * B * dL_mm) / 1000;

  const unityB = VcB_kN > 0 ? VfB_kN / VcB_kN : Infinity;
  const unityL = VcL_kN > 0 ? VfL_kN / VcL_kN : Infinity;

  const bo_mm = 2 * (cx + dAvg_mm) + 2 * (cy + dAvg_mm);
  const beta_c = Math.min(cx, cy) > 0 ? Math.max(cx, cy) / Math.min(cx, cy) : 1;
  const alpha_s = 4;

  const rootFc = Math.sqrt(fc_MPa);
  const vc1 = (1 + 2 / beta_c) * 0.19 * PHI_C * LAMBDA * rootFc;
  const vc2 = (alpha_s * (dAvg_mm / bo_mm) + 0.19) * PHI_C * LAMBDA * rootFc;
  const vc3 = 0.38 * PHI_C * LAMBDA * rootFc;
  const vc_MPa = Math.min(vc1, vc2, vc3);
  const Vr_punch_kN = (vc_MPa * bo_mm * dAvg_mm) / 1000;

  const A_inside_mm2 = (cx + dAvg_mm) * (cy + dAvg_mm);
  const A_inside_m2 = A_inside_mm2 / 1e6;
  const A_out_m2 = Math.max(0, A_m2 - A_inside_m2);
  const Vf_punch_kN = qu_kPa * A_out_m2;

  const unityPunch = Vr_punch_kN > 0 ? Vf_punch_kN / Vr_punch_kN : Infinity;
  const punchOk = Vf_punch_kN <= Vr_punch_kN;

  const alpha1 = Math.max(0.67, 0.85 - 0.0015 * fc_MPa);
  const beta1 = Math.max(0.67, 0.97 - 0.0025 * fc_MPa);

  function flexDir(
    cant_mm: number,
    width_mm: number,
    d_mm: number,
    barArea: number
  ): FootingFlexureDirectionResult {
    const w_kN_m = qu_kPa * (width_mm / 1000);
    const cant_m = cant_mm / 1000;
    const Mf_kNm = (w_kN_m * cant_m * cant_m) / 2;
    const Mf_Nmm = Mf_kNm * 1e6;

    const As_min_mm2 = (0.2 * Math.sqrt(fc_MPa) / fy_MPa) * width_mm * h;

    const k1 = 2 * alpha1 * PHI_C * fc_MPa * width_mm;
    const disc = (k1 * d_mm) ** 2 - 2 * k1 * Mf_Nmm;
    let As_req: number;
    if (disc < 0) {
      As_req = Infinity;
    } else {
      const X = k1 * d_mm - Math.sqrt(disc);
      As_req = X / (PHI_S * fy_MPa);
    }

    const As_design = Math.max(As_req, As_min_mm2);
    const numBars = Math.max(1, Math.ceil(As_design / barArea));
    const As_prov = numBars * barArea;
    const barSpacing_mm = numBars > 1 ? width_mm / (numBars - 1) : width_mm;

    const a_mm = (PHI_S * As_prov * fy_MPa) / (alpha1 * PHI_C * fc_MPa * width_mm);
    const c_mm = a_mm / beta1;
    const Mr_kNm = (PHI_S * As_prov * fy_MPa * (d_mm - a_mm / 2)) / 1e6;
    const cdRatio = d_mm > 0 ? c_mm / d_mm : Infinity;
    const cdLimit = 700 / (700 + fy_MPa);
    const ductilityOk = cdRatio <= cdLimit;
    const utilization = Mr_kNm > 0 ? Mf_kNm / Mr_kNm : Infinity;

    return {
      cantilever_mm: cant_mm,
      Mf_kNm,
      b_mm: width_mm,
      d_mm,
      As_required_mm2: As_req,
      As_min_mm2: As_min_mm2,
      As_provided_mm2: As_prov,
      numBars,
      barSpacing_mm,
      Mr_kNm,
      utilization,
      ductilityOk,
      cdRatio,
      cdLimit,
    };
  }

  const dirB = flexDir(cantB_mm, Lf, dB_mm, areaB);
  const dirL = flexDir(cantL_mm, B, dL_mm, areaL);

  const k_ld = 1.15;
  const db_ld = Math.max(dbB, dbL);
  const ld_mm = fc_MPa > 0 ? k_ld * (fy_MPa / rootFc) * db_ld : Infinity;
  const availB_mm = Math.max(0, cantB_mm - cover_mm);
  const availL_mm = Math.max(0, cantL_mm - cover_mm);
  const okDevB = ld_mm <= availB_mm;
  const okDevL = ld_mm <= availL_mm;

  const overallOk =
    bearingOk &&
    unityB <= 1 &&
    unityL <= 1 &&
    punchOk &&
    dirB.utilization <= 1 &&
    dirL.utilization <= 1 &&
    dirB.ductilityOk &&
    dirL.ductilityOk &&
    okDevB &&
    okDevL;

  return {
    inputs: input,
    sls: {
      area_m2: A_m2,
      selfWeightConcrete_kN: W_conc,
      selfWeightBackfill_kN: W_bf,
      totalService_kN: totalService,
      qService_kPa,
      bearingOk,
      utilizationBearing,
    },
    uls: {
      factoredLoad_kN: Pu_kN,
      qu_kPa,
    },
    oneWay: {
      d_mm: dB_mm,
      dAvg_mm,
      VfB_kN,
      VcB_kN,
      unityB,
      okB: unityB <= 1,
      VfL_kN,
      VcL_kN,
      unityL,
      okL: unityL <= 1,
    },
    punching: {
      bo_mm,
      beta_c,
      alpha_s,
      vc_MPa,
      Vr_punch_kN,
      Vf_punch_kN,
      unityPunch,
      ok: punchOk,
    },
    flexure: { dirB, dirL },
    development: {
      ld_mm,
      availB_mm,
      availL_mm,
      okB: okDevB,
      okL: okDevL,
    },
    overallOk,
  };
}
