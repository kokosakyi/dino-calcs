import type { WoodGrade, WoodSpecies } from './types';

/** Table 6.3.1C — timber (no No. 3 in sandbox); use No. 2 as fallback for unknown */

const FB: Record<WoodSpecies, Record<'Select Structural' | 'No. 1 Grade' | 'No. 2 Grade', number>> = {
  'Douglas Fir-Larch': {
    'Select Structural': 19.5,
    'No. 1 Grade': 15.8,
    'No. 2 Grade': 9.0,
  },
  'Hem-Fir': {
    'Select Structural': 14.5,
    'No. 1 Grade': 11.7,
    'No. 2 Grade': 6.7,
  },
  'Spruce-Pine-Fir': {
    'Select Structural': 13.6,
    'No. 1 Grade': 11.0,
    'No. 2 Grade': 6.3,
  },
  'Northern Specie': {
    'Select Structural': 12.8,
    'No. 1 Grade': 10.8,
    'No. 2 Grade': 5.9,
  },
};

const FV: Record<WoodSpecies, number> = {
  'Douglas Fir-Larch': 1.5,
  'Hem-Fir': 1.2,
  'Spruce-Pine-Fir': 1.2,
  'Northern Specie': 1.0,
};

const FCP: Record<WoodSpecies, number> = {
  'Douglas Fir-Larch': 7.0,
  'Hem-Fir': 4.6,
  'Spruce-Pine-Fir': 5.3,
  'Northern Specie': 3.5,
};

const FC: Record<WoodSpecies, Record<'Select Structural' | 'No. 1 Grade' | 'No. 2 Grade', number>> = {
  'Douglas Fir-Larch': { 'Select Structural': 13.2, 'No. 1 Grade': 11.0, 'No. 2 Grade': 7.2 },
  'Hem-Fir': { 'Select Structural': 10.8, 'No. 1 Grade': 9.0, 'No. 2 Grade': 5.9 },
  'Spruce-Pine-Fir': { 'Select Structural': 9.5, 'No. 1 Grade': 7.9, 'No. 2 Grade': 5.2 },
  'Northern Specie': { 'Select Structural': 7.2, 'No. 1 Grade': 6.0, 'No. 2 Grade': 3.9 },
};

const E_MOD: Record<WoodSpecies, Record<'Select Structural' | 'No. 1 Grade' | 'No. 2 Grade', number>> = {
  'Douglas Fir-Larch': { 'Select Structural': 12000, 'No. 1 Grade': 12000, 'No. 2 Grade': 9500 },
  'Hem-Fir': { 'Select Structural': 10000, 'No. 1 Grade': 10000, 'No. 2 Grade': 8000 },
  'Spruce-Pine-Fir': { 'Select Structural': 8500, 'No. 1 Grade': 8500, 'No. 2 Grade': 6500 },
  'Northern Specie': { 'Select Structural': 8000, 'No. 1 Grade': 8000, 'No. 2 Grade': 6000 },
};

type TimberGradeKey = 'Select Structural' | 'No. 1 Grade' | 'No. 2 Grade';

function timberGradeKey(grade: WoodGrade): TimberGradeKey {
  if (grade === 'No. 3 Grade') return 'No. 2 Grade';
  return grade;
}

export interface SawnTimberProps {
  fb: number;
  fv: number;
  fcp: number;
  fc: number;
  E: number;
  reference: string;
}

export function getSawnTimberProps(species: WoodSpecies, grade: WoodGrade): SawnTimberProps {
  const g = timberGradeKey(grade);
  return {
    fb: FB[species][g],
    fv: FV[species],
    fcp: FCP[species],
    fc: FC[species][g],
    E: E_MOD[species][g],
    reference: 'CSA O86 Table 6.3.1C',
  };
}
