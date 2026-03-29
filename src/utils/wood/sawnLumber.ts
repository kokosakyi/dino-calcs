import type { WoodGrade, WoodSpecies } from './types';

/** Table 6.3.1A — specified strengths (MPa) and E (MPa) for dimension lumber */

const FB: Record<WoodSpecies, Record<WoodGrade, number>> = {
  'Douglas Fir-Larch': {
    'Select Structural': 16.5,
    'No. 1 Grade': 10.0,
    'No. 2 Grade': 10.0,
    'No. 3 Grade': 4.6,
  },
  'Hem-Fir': {
    'Select Structural': 16.0,
    'No. 1 Grade': 11.0,
    'No. 2 Grade': 11.0,
    'No. 3 Grade': 7.0,
  },
  'Spruce-Pine-Fir': {
    'Select Structural': 16.5,
    'No. 1 Grade': 11.8,
    'No. 2 Grade': 11.8,
    'No. 3 Grade': 7.0,
  },
  'Northern Specie': {
    'Select Structural': 10.6,
    'No. 1 Grade': 7.6,
    'No. 2 Grade': 7.6,
    'No. 3 Grade': 4.5,
  },
};

const FV: Record<WoodSpecies, number> = {
  'Douglas Fir-Larch': 1.9,
  'Hem-Fir': 1.6,
  'Spruce-Pine-Fir': 1.5,
  'Northern Specie': 1.3,
};

const FCP: Record<WoodSpecies, number> = {
  'Douglas Fir-Larch': 7.0,
  'Hem-Fir': 4.6,
  'Spruce-Pine-Fir': 5.3,
  'Northern Specie': 3.5,
};

const FC: Record<WoodSpecies, Record<WoodGrade, number>> = {
  'Douglas Fir-Larch': {
    'Select Structural': 19.0,
    'No. 1 Grade': 14.0,
    'No. 2 Grade': 14.0,
    'No. 3 Grade': 7.3,
  },
  'Hem-Fir': {
    'Select Structural': 17.6,
    'No. 1 Grade': 14.8,
    'No. 2 Grade': 14.8,
    'No. 3 Grade': 9.2,
  },
  'Spruce-Pine-Fir': {
    'Select Structural': 14.5,
    'No. 1 Grade': 11.5,
    'No. 2 Grade': 11.5,
    'No. 3 Grade': 9.0,
  },
  'Northern Specie': {
    'Select Structural': 13.0,
    'No. 1 Grade': 10.4,
    'No. 2 Grade': 10.4,
    'No. 3 Grade': 5.2,
  },
};

const E_MOD: Record<WoodSpecies, Record<WoodGrade, number>> = {
  'Douglas Fir-Larch': {
    'Select Structural': 12500,
    'No. 1 Grade': 11000,
    'No. 2 Grade': 11000,
    'No. 3 Grade': 10000,
  },
  'Hem-Fir': {
    'Select Structural': 12000,
    'No. 1 Grade': 11000,
    'No. 2 Grade': 11000,
    'No. 3 Grade': 10000,
  },
  'Spruce-Pine-Fir': {
    'Select Structural': 10500,
    'No. 1 Grade': 9500,
    'No. 2 Grade': 9500,
    'No. 3 Grade': 9000,
  },
  'Northern Specie': {
    'Select Structural': 7500,
    'No. 1 Grade': 7000,
    'No. 2 Grade': 7000,
    'No. 3 Grade': 6500,
  },
};

export interface SawnLumberProps {
  fb: number;
  fv: number;
  fcp: number;
  fc: number;
  E: number;
  reference: string;
}

export function getSawnLumberProps(species: WoodSpecies, grade: WoodGrade): SawnLumberProps {
  return {
    fb: FB[species][grade],
    fv: FV[species],
    fcp: FCP[species],
    fc: FC[species][grade],
    E: E_MOD[species][grade],
    reference: 'CSA O86 Table 6.3.1A',
  };
}
