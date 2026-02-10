import type { WSection, DesignInputs, DesignResult, SectionClassification, LateralTorsionalBucklingResult, DeflectionResult, NBCLoadInputs, NBCCombinationResult } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';

// CISC S16-19 resistance factor for steel
const PHI = 0.9;

// Material constants
const E = 200000;  // Elastic modulus (MPa)
const G = 77000;   // Shear modulus (MPa)

/**
 * Calculate factored moment resistance (Mr) for a section with continuous lateral support
 * Per CSA S16-19 Clause 13.5
 * For Class 1 or 2: Mr = φ × Zx × Fy
 * For Class 3: Mr = φ × Sx × Fy
 */
export function calculateMomentResistance(section: WSection, Fy: number): number {
  // Check section classification
  const sectionClass = checkSectionClass(section, Fy);
  
  let Mr: number;
  
  if (sectionClass.overallClass <= 2) {
    // Class 1 or 2: use plastic section modulus
    const Zx = parseFloat(section.Zx) * 1000; // Convert from ×10³ mm³ to mm³
    // Mr in N·mm, convert to kN·m
    Mr = (PHI * Zx * Fy) / 1e6;
  } else if (sectionClass.overallClass === 3) {
    // Class 3: use elastic section modulus
    const Sx = parseFloat(section.Sx) * 1000; // Convert from ×10³ mm³ to mm³
    // Mr in N·mm, convert to kN·m
    Mr = (PHI * Sx * Fy) / 1e6;
  } else {
    // Class 4 sections are not typically used for moment resistance without special considerations
    // For now, use elastic section modulus as a conservative approach
    const Sx = parseFloat(section.Sx) * 1000; // Convert from ×10³ mm³ to mm³
    Mr = (PHI * Sx * Fy) / 1e6;
  }
  
  return Mr;
}

/**
 * Calculate factored moment resistance (Mr) for laterally unsupported beams
 * Per CSA S16-19 Clause 13.6
 * 
 * For doubly symmetric Class 1 and 2 sections:
 * - When Mu > 0.67Mp: Mr = 1.15φMp(1 - 0.28Mp/Mu) ≤ φMp
 * - When Mu ≤ 0.67Mp: Mr = φMu
 * 
 * Critical elastic moment: Mu = (ω2 × π / L) × √(E×Iy×G×J + (π×E/L)²×Iy×Cw)
 */
export function calculateLateralTorsionalBuckling(
  section: WSection,
  Fy: number,
  unbracedLength: number,  // L in mm
  omega2: number = 1.0     // moment gradient coefficient
): LateralTorsionalBucklingResult {
  // Section properties
  const Zx = parseFloat(section.Zx) * 1000;      // mm³ (from ×10³ mm³)
  const Iy = parseFloat(section.Iy) * 1e6;       // mm⁴ (from ×10⁶ mm⁴)
  const J = parseFloat(section.J) * 1000;        // mm⁴ (from ×10³ mm⁴)
  const Cw = parseFloat(section.Cw) * 1e9;       // mm⁶ (from ×10⁹ mm⁶)
  
  const L = unbracedLength;  // mm
  
  // Plastic moment: Mp = Zx × Fy (N·mm)
  const Mp_Nmm = Zx * Fy;
  const Mp = Mp_Nmm / 1e6;  // kN·m
  
  // Critical elastic moment: Mu = (ω2 × π / L) × √(E×Iy×G×J + (π×E/L)²×Iy×Cw)
  const piOverL = Math.PI / L;
  const term1 = E * Iy * G * J;
  const term2 = Math.pow(Math.PI * E / L, 2) * Iy * Cw;
  const Mu_Nmm = omega2 * piOverL * Math.sqrt(term1 + term2);
  const Mu = Mu_Nmm / 1e6;  // kN·m
  
  // Determine Mr based on Mu vs 0.67Mp
  let Mr: number;
  let governingCase: 'yielding' | 'inelastic_ltb' | 'elastic_ltb';
  
  const threshold = 0.67 * Mp;
  
  if (Mu > threshold) {
    // Inelastic lateral-torsional buckling
    // Mr = 1.15φMp(1 - 0.28Mp/Mu) ≤ φMp
    const Mr_calc = 1.15 * PHI * Mp * (1 - 0.28 * Mp / Mu);
    const Mr_max = PHI * Mp;
    Mr = Math.min(Mr_calc, Mr_max);
    
    if (Mr_calc >= Mr_max) {
      governingCase = 'yielding';
    } else {
      governingCase = 'inelastic_ltb';
    }
  } else {
    // Elastic lateral-torsional buckling
    // Mr = φMu
    Mr = PHI * Mu;
    governingCase = 'elastic_ltb';
  }
  
  return {
    Mu,
    Mp,
    Mr,
    governingCase,
    omega2,
    unbracedLength,
  };
}

/**
 * Calculate factored shear resistance (Vr)
 * Per CSA S16-19 Clause 13.4.1.1
 * Vr = φ × Aw × 0.66 × Fy (for unstiffened webs)
 * where Aw = d × w (web area)
 */
export function calculateShearResistance(section: WSection, Fy: number): number {
  const d = parseFloat(section.D);   // Depth in mm
  const w = parseFloat(section.W);   // Web thickness in mm
  const Aw = d * w;                  // Web area in mm²
  
  // Check web slenderness for shear
  const hw = parseFloat(section.HW);
  const kvLimit = 1014 / Math.sqrt(Fy);
  
  let Fs: number;
  if (hw <= kvLimit) {
    // Yielding governs
    Fs = 0.66 * Fy;
  } else {
    // Inelastic buckling - simplified
    Fs = 0.66 * Fy * (kvLimit / hw);
  }
  
  // Vr in N, convert to kN
  const Vr = (PHI * Aw * Fs) / 1000;
  return Vr;
}

/**
 * Check section class for local buckling per CSA S16-19 Table 2
 * Classifies flange and web separately, overall class is the worst (highest) of the two
 * 
 * Flange classification (bel/t ratios):
 *   Class 1: bel/t <= 145/sqrt(Fy)
 *   Class 2: bel/t <= 170/sqrt(Fy)
 *   Class 3: bel/t <= 200/sqrt(Fy)
 *   Class 4: bel/t > 200/sqrt(Fy)
 * 
 * Web classification (h/w ratios):
 *   Class 1: h/w <= 1100/sqrt(Fy)
 *   Class 2: h/w <= 1700/sqrt(Fy)
 *   Class 3: h/w <= 1900/sqrt(Fy)
 *   Class 4: h/w > 1900/sqrt(Fy)
 */
export function checkSectionClass(section: WSection, Fy: number): SectionClassification {
  const bt = parseFloat(section.BT);  // b/t ratio for flange (bel/t)
  const hw = parseFloat(section.HW);  // h/w ratio for web
  const sqrtFy = Math.sqrt(Fy);
  
  // Flange class limits per CSA S16-19 Table 2
  const flangeLimit1 = 145 / sqrtFy;
  const flangeLimit2 = 170 / sqrtFy;
  const flangeLimit3 = 200 / sqrtFy;
  
  // Web class limits per CSA S16-19 Table 2
  const webLimit1 = 1100 / sqrtFy;
  const webLimit2 = 1700 / sqrtFy;
  const webLimit3 = 1900 / sqrtFy;
  
  // Determine flange class
  let flangeClass: number;
  if (bt <= flangeLimit1) flangeClass = 1;
  else if (bt <= flangeLimit2) flangeClass = 2;
  else if (bt <= flangeLimit3) flangeClass = 3;
  else flangeClass = 4;
  
  // Determine web class
  let webClass: number;
  if (hw <= webLimit1) webClass = 1;
  else if (hw <= webLimit2) webClass = 2;
  else if (hw <= webLimit3) webClass = 3;
  else webClass = 4;
  
  // Overall class is the worst (highest number) of flange and web
  const overallClass = Math.max(flangeClass, webClass);
  
  return {
    flangeClass,
    webClass,
    overallClass,
    flangeBT: bt,
    webHW: hw,
    flangeLimit1,
    flangeLimit2,
    flangeLimit3,
    webLimit1,
    webLimit2,
    webLimit3,
  };
}

/**
 * Check if a section passes the optional dimension filters
 */
function passesSectionFilters(section: WSection, filters?: DesignInputs['sectionFilters']): boolean {
  if (!filters) return true;
  
  const depth = parseFloat(section.D);
  const flangeWidth = parseFloat(section.B);
  const flangeThickness = parseFloat(section.T);
  const webThickness = parseFloat(section.W);
  
  if (filters.minDepth !== undefined && depth < filters.minDepth) return false;
  if (filters.minFlangeWidth !== undefined && flangeWidth < filters.minFlangeWidth) return false;
  if (filters.minFlangeThickness !== undefined && flangeThickness < filters.minFlangeThickness) return false;
  if (filters.minWebThickness !== undefined && webThickness < filters.minWebThickness) return false;
  
  return true;
}

/**
 * Find the most economical section that satisfies the design requirements
 * Economical = lightest section that works
 * 
 * @param sections - Array of W-sections to evaluate
 * @param inputs - Design inputs (Mf, Vf, steel grade, lateral support, etc.)
 * @param deflectionRequirement - Optional deflection requirement for UDL/NBC modes
 */
export function findOptimalSection(
  sections: WSection[],
  inputs: DesignInputs,
  deflectionRequirement?: DeflectionResult
): DesignResult[] {
  const { Fy } = STEEL_PROPERTIES[inputs.steelGrade];
  
  const results: DesignResult[] = [];
  
  for (const section of sections) {
    // Apply optional section dimension filters
    if (!passesSectionFilters(section, inputs.sectionFilters)) {
      continue;
    }
    
    // Check deflection requirement first (if provided)
    const Ix = parseFloat(section.Ix);  // ×10⁶ mm⁴
    let deflectionUtilization: number | undefined;
    
    if (deflectionRequirement) {
      if (Ix < deflectionRequirement.requiredIx) {
        // Section doesn't meet deflection requirement, skip
        continue;
      }
      deflectionUtilization = deflectionRequirement.requiredIx / Ix;
    }
    
    let Mr: number;
    let ltbResult: LateralTorsionalBucklingResult | undefined;
    
    // Check section class first
    const sectionClass = checkSectionClass(section, Fy);
    
    if (inputs.lateralSupport === 'unsupported' && inputs.unbracedLength && inputs.unbracedLength > 0) {
      // Laterally unsupported beam - calculate LTB resistance
      // Only valid for Class 1 and 2 sections per CSA S16-19 Cl. 13.6(a)
      if (sectionClass.overallClass <= 2) {
        ltbResult = calculateLateralTorsionalBuckling(
          section,
          Fy,
          inputs.unbracedLength,
          inputs.omega2 ?? 1.0
        );
        Mr = ltbResult.Mr;
      } else {
        // Class 3 or 4 sections - use elastic section modulus (simplified)
        // For now, skip Class 3/4 for unsupported beams
        continue;
      }
    } else {
      // Continuous lateral support - use plastic moment resistance
      Mr = calculateMomentResistance(section, Fy);
    }
    
    const Vr = calculateShearResistance(section, Fy);
    
    const momentUtilization = inputs.factoredMoment / Mr;
    const shearUtilization = inputs.factoredShear / Vr;
    
    const isAdequate = momentUtilization <= 1.0 && shearUtilization <= 1.0;
    
    if (isAdequate) {
      results.push({
        section,
        Mr,
        Vr,
        momentUtilization,
        shearUtilization,
        isAdequate,
        ltbResult,
        deflectionUtilization,
      });
    }
  }
  
  // Sort by mass (most economical first)
  results.sort((a, b) => parseFloat(a.section.Mass) - parseFloat(b.section.Mass));
  
  return results;
}

/**
 * Format a number for display
 */
export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}

/**
 * Calculate utilization percentage
 */
export function utilizationPercent(utilization: number): string {
  return (utilization * 100).toFixed(1) + '%';
}

/**
 * Calculate maximum moment and shear for a simply supported beam with UDL
 * Mf = w × L² / 8 (maximum moment at midspan)
 * Vf = w × L / 2 (maximum shear at supports)
 * 
 * @param w - UDL in kN/m
 * @param L - Span in mm
 * @returns Mf in kN·m, Vf in kN
 */
export function calculateSimplySupported(w: number, L: number): { Mf: number; Vf: number } {
  const L_m = L / 1000;  // Convert mm to m
  const Mf = (w * L_m * L_m) / 8;  // kN·m
  const Vf = (w * L_m) / 2;        // kN
  return { Mf, Vf };
}

/**
 * Calculate required moment of inertia for deflection control
 * For simply supported beam with UDL: δmax = 5wL⁴ / (384EI)
 * Solving for I: I_required = 5wL⁴ / (384E × δallowable)
 * 
 * @param wSLS - Service load UDL in kN/m
 * @param L - Span in mm
 * @param deflectionLimit - Denominator for L/x (240, 300, or 360)
 * @returns DeflectionResult with requiredIx in ×10⁶ mm⁴
 */
export function calculateRequiredIx(
  wSLS: number,
  L: number,
  deflectionLimit: number
): DeflectionResult {
  const allowableDeflection = L / deflectionLimit;  // mm
  
  // Convert wSLS from kN/m to N/mm: kN/m × 1000 N/kN × 1 m/1000 mm = N/mm
  const w_Nmm = wSLS;  // kN/m = N/mm (numerically equal)
  
  // δ = 5wL⁴ / (384EI) → I = 5wL⁴ / (384E × δ)
  // E = 200,000 MPa = 200,000 N/mm²
  const requiredIx_mm4 = (5 * w_Nmm * Math.pow(L, 4)) / (384 * E * allowableDeflection);
  const requiredIx = requiredIx_mm4 / 1e6;  // Convert to ×10⁶ mm⁴
  
  return {
    requiredIx,
    allowableDeflection,
  };
}

/**
 * Calculate actual deflection for a given section
 * δ = 5wL⁴ / (384EI)
 * 
 * @param wSLS - Service load UDL in kN/m
 * @param L - Span in mm
 * @param Ix - Moment of inertia in ×10⁶ mm⁴
 * @returns Actual deflection in mm
 */
export function calculateActualDeflection(wSLS: number, L: number, Ix: number): number {
  const w_Nmm = wSLS;  // kN/m = N/mm
  const Ix_mm4 = Ix * 1e6;  // Convert from ×10⁶ mm⁴ to mm⁴
  const deflection = (5 * w_Nmm * Math.pow(L, 4)) / (384 * E * Ix_mm4);
  return deflection;
}

/**
 * Calculate NBC 2020 load combinations per Cl. 4.1.3.2
 * Returns the governing ULS and SLS combinations with all combinations listed
 * 
 * @param loads - NBC load inputs
 * @returns Governing combinations, wULS, wSLS, and all ULS/SLS combinations
 */
export function calculateNBCCombinations(loads: NBCLoadInputs): NBCCombinationResult {
  const { deadLoad: D, liveLoad: L, snowLoad: S, windLoad: W, earthquakeLoad: E } = loads;
  
  // ULS Load Combinations per NBC 2020 Cl. 4.1.3.2
  const ulsCombinationsRaw: { name: string; value: number }[] = [
    { name: '1.4D', value: 1.4 * D },
    { name: '1.25D + 1.5L', value: 1.25 * D + 1.5 * L },
    { name: '1.25D + 1.5S', value: 1.25 * D + 1.5 * S },
    { name: '1.25D + 1.4W', value: 1.25 * D + 1.4 * W },
    { name: '1.0D + 1.0E', value: 1.0 * D + 1.0 * E },
    { name: '1.25D + 1.5L + 0.5S', value: 1.25 * D + 1.5 * L + 0.5 * S },
    { name: '1.25D + 1.5S + 0.5L', value: 1.25 * D + 1.5 * S + 0.5 * L },
    { name: '1.25D + 1.4W + 0.5L', value: 1.25 * D + 1.4 * W + 0.5 * L },
    { name: '1.0D + 1.0E + 0.5L + 0.25S', value: 1.0 * D + 1.0 * E + 0.5 * L + 0.25 * S },
  ];
  
  // SLS Load Combinations for serviceability (deflection)
  const slsCombinationsRaw: { name: string; value: number }[] = [
    { name: '1.0D + 1.0L', value: 1.0 * D + 1.0 * L },
    { name: '1.0D + 1.0S', value: 1.0 * D + 1.0 * S },
    { name: '1.0D + 1.0L + 0.5S', value: 1.0 * D + 1.0 * L + 0.5 * S },
    { name: '1.0D + 1.0S + 0.5L', value: 1.0 * D + 1.0 * S + 0.5 * L },
  ];
  
  // Filter out combinations with zero or negative values
  const validULSCombinations = ulsCombinationsRaw.filter(c => c.value > 0);
  const validSLSCombinations = slsCombinationsRaw.filter(c => c.value > 0);
  
  // Find governing (maximum) ULS combination
  const governingULS = validULSCombinations.reduce((max, c) => c.value > max.value ? c : max, validULSCombinations[0]);
  
  // Find governing (maximum) SLS combination
  const governingSLS = validSLSCombinations.reduce((max, c) => c.value > max.value ? c : max, validSLSCombinations[0]);
  
  // Add isGoverning flag to each combination
  const ulsCombinations = validULSCombinations.map(c => ({
    ...c,
    isGoverning: c.name === governingULS.name,
  }));
  
  const slsCombinations = validSLSCombinations.map(c => ({
    ...c,
    isGoverning: c.name === governingSLS.name,
  }));
  
  return {
    governingULSCombination: governingULS.name,
    governingSLSCombination: governingSLS.name,
    wULS: governingULS.value,
    wSLS: governingSLS.value,
    ulsCombinations,
    slsCombinations,
  };
}
