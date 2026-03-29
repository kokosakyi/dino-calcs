/** CSA O86 wood design — shared types */

export const WOOD_SPECIES = [
  'Douglas Fir-Larch',
  'Hem-Fir',
  'Spruce-Pine-Fir',
  'Northern Specie',
] as const;
export type WoodSpecies = (typeof WOOD_SPECIES)[number];

export const WOOD_GRADES = [
  'Select Structural',
  'No. 1 Grade',
  'No. 2 Grade',
  'No. 3 Grade',
] as const;
export type WoodGrade = (typeof WOOD_GRADES)[number];

export const LOAD_DURATIONS = ['Short Term', 'Standard Term', 'Long Term'] as const;
export type LoadDuration = (typeof LOAD_DURATIONS)[number];

export const SERVICE_CONDITIONS = ['Dry', 'Wet'] as const;
export type ServiceCondition = (typeof SERVICE_CONDITIONS)[number];

export const TREATMENT_CONDITIONS = ['Untreated', 'Treated-Incised'] as const;
export type TreatmentCondition = (typeof TREATMENT_CONDITIONS)[number];

/** System factor case for dimension lumber (joist / built-up) — CSA O86 Cl. 6.4.4 */
export const SYSTEM_CASES = ['Case 1', 'Case 2'] as const;
export type SystemCase = (typeof SYSTEM_CASES)[number];
