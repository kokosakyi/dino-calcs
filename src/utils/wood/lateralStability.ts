/** Lateral stability and notch factors (legacy sandbox formulas). */

export const WOOD_PHI = { b: 0.9, v: 0.9, cp: 0.8, f: 0.9 } as const;

/** Adjusted bending strength F_b = f_b * K_D * K_H * K_Sb * K_T (MPa) */
export function adjustedFb(fb: number, KD: number, KH: number, KSb: number, KT: number): number {
  return fb * KD * KH * KSb * KT;
}

/**
 * Stability factor K_L from effective length L_e (mm) and section/mod factors.
 */
export function woodComputeKL(params: {
  Le: number;
  b: number;
  d: number;
  E: number;
  KSE: number;
  KT: number;
  fb: number;
  KD: number;
  KH: number;
  KSb: number;
}): number {
  const { Le, b, d, E, KSE, KT, fb, KD, KH, KSb } = params;
  const Fb = adjustedFb(fb, KD, KH, KSb, KT);
  const CB = Math.sqrt((Le * d) / (b ** 2));
  const CK = Math.sqrt((0.97 * E * KSE * KT) / (fb * (KD * KH * KSb * KT)));
  if (CB <= 10) return 1;
  if (CB <= 20) return 1 - (1 / 3) * (CB / CK) ** 4;
  return (0.65 * E * KSE * KT) / (CB ** 2 * Fb);
}

/**
 * Notch factor K_N. If no notch (alpha ≥ 1), returns +∞ so shear fracture does not govern.
 */
export function woodComputeKN(alpha: number, eta: number, d: number): number {
  if (alpha >= 1 || alpha <= 0) return Number.POSITIVE_INFINITY;
  const inner = 0.006 * d * (1.6 * (1 / alpha - 1) + eta ** 2 * (1 / alpha ** 3 - 1));
  if (inner <= 0) return Number.POSITIVE_INFINITY;
  return inner ** -0.5;
}
