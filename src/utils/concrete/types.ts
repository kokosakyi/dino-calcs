/**
 * Types for CSA A23.3 concrete design calculations
 */

export type SupportCondition = 'Simply Supported' | 'One End Continuous' | 'Both Ends Continuous' | 'Cantilever';

export type ExposureClass = 'N' | 'C-1' | 'C-2' | 'C-3' | 'C-4' | 'F-1' | 'F-2' | 'A-1' | 'A-2' | 'A-3' | 'A-4' | 'S-1' | 'S-2' | 'S-3';

export const SUPPORT_CONDITIONS: SupportCondition[] = [
  'Simply Supported',
  'One End Continuous',
  'Both Ends Continuous',
  'Cantilever',
];

export const EXPOSURE_CLASSES: ExposureClass[] = [
  'N', 'F-1', 'F-2', 'C-1', 'C-2', 'C-3', 'C-4', 'A-1', 'A-2', 'A-3', 'A-4', 'S-1', 'S-2', 'S-3',
];

export const CONCRETE_STRENGTHS = [20, 25, 30, 35, 40, 45, 50] as const;
export type ConcreteStrength = typeof CONCRETE_STRENGTHS[number];

export const REBAR_GRADES = [400, 500] as const;
export type RebarGrade = typeof REBAR_GRADES[number];

export const STIRRUP_SIZES = ['10M', '15M'] as const;
export type StirrupSize = typeof STIRRUP_SIZES[number];

export const MAIN_BAR_SIZES = ['15M', '20M', '25M', '30M', '35M'] as const;
export type MainBarSize = typeof MAIN_BAR_SIZES[number];

export interface RebarProperties {
  diameter: number;
  area: number;
}

export const REBAR_DATA: Record<string, RebarProperties> = {
  '10M': { diameter: 11.3, area: 100 },
  '15M': { diameter: 16.0, area: 200 },
  '20M': { diameter: 19.5, area: 300 },
  '25M': { diameter: 25.2, area: 500 },
  '30M': { diameter: 29.9, area: 700 },
  '35M': { diameter: 35.7, area: 1000 },
};

export const PHI_C = 0.65;
export const PHI_S = 0.85;
