import type { WoodSpecies } from './types';

/** Dimension lumber section labels (Table 6.3.1A joist sizes), mm */
export const LUMBER_SECTION_LABELS = [
  '38 x 89',
  '38 x 114',
  '38 x 140',
  '38 x 184',
  '38 x 235',
  '38 x 286',
  '64 x 89',
  '64 x 114',
  '64 x 140',
  '64 x 184',
  '64 x 235',
  '64 x 286',
  '89 x 89',
  '89 x 114',
  '89 x 140',
  '89 x 184',
  '89 x 235',
  '89 x 286',
] as const;
export type LumberSectionLabel = (typeof LUMBER_SECTION_LABELS)[number];

const TIMBER_BY_SPECIES: Record<WoodSpecies, readonly string[]> = {
  'Douglas Fir-Larch': [
    '140 x 140', '140 x 191', '140 x 241', '140 x 292', '140 x 343', '140 x 394',
    '191 x 191', '191 x 241', '191 x 292', '191 x 343', '191 x 394',
    '241 x 241', '241 x 292', '241 x 343', '241 x 394',
    '292 x 292', '292 x 343', '292 x 394',
    '343 x 343', '343 x 394',
    '394 x 394',
  ],
  'Hem-Fir': [
    '140 x 140', '140 x 191', '140 x 241', '140 x 292', '140 x 343', '140 x 394',
    '191 x 191', '191 x 241', '191 x 292', '191 x 343', '191 x 394',
    '241 x 241', '241 x 292', '241 x 343', '241 x 394',
    '292 x 292', '292 x 343', '292 x 394',
    '343 x 343',
  ],
  'Spruce-Pine-Fir': [
    '140 x 140', '140 x 191', '140 x 241',
    '191 x 191', '191 x 241',
    '241 x 241',
  ],
  'Northern Specie': [
    '140 x 140', '140 x 191', '140 x 241',
    '191 x 191', '191 x 241',
    '241 x 241',
  ],
};

export function getTimberSectionLabels(species: WoodSpecies): string[] {
  return [...TIMBER_BY_SPECIES[species]];
}

/** Parse "bw x d" label to numeric mm */
export function parseSectionMm(label: string): { b: number; d: number } {
  const i = label.indexOf(' x ');
  if (i < 0) throw new Error(`Invalid section label: ${label}`);
  return {
    b: parseFloat(label.slice(0, i)),
    d: parseFloat(label.slice(i + 3)),
  };
}
