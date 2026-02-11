// Centralized section data imports
import type { GenericSection } from '../types/steel';

// Import all section JSON files
import wSections from '../assets/W_Section.json';
import cSections from '../assets/C_section.json';
import mcSections from '../assets/MC_section.json';
import lSections from '../assets/L_section.json';
import l2Sections from '../assets/2L_section.json';
import sSections from '../assets/S_section.json';
import mSections from '../assets/M_section.json';
import hpSections from '../assets/HP_section.json';
import wtSections from '../assets/WT_section.json';
import wwtSections from '../assets/WWT_section.json';
import wwfSections from '../assets/WWF_section.json';
import wrfSections from '../assets/WRF_section.json';
import slbSections from '../assets/SLB_section.json';
import hssA500Sections from '../assets/HSS-A500_section.json';
import hssG40Sections from '../assets/HSS-G40_section.json';

// Export section data mapped by category ID
export const SECTION_DATA: Record<string, GenericSection[]> = {
  'W': wSections as GenericSection[],
  'C': cSections as GenericSection[],
  'MC': mcSections as GenericSection[],
  'L': lSections as GenericSection[],
  '2L': l2Sections as GenericSection[],
  'S': sSections as GenericSection[],
  'M': mSections as GenericSection[],
  'HP': hpSections as GenericSection[],
  'WT': wtSections as GenericSection[],
  'WWT': wwtSections as GenericSection[],
  'WWF': wwfSections as GenericSection[],
  'WRF': wrfSections as GenericSection[],
  'SLB': slbSections as GenericSection[],
  'HSS-A500': hssA500Sections as GenericSection[],
  'HSS-G40': hssG40Sections as GenericSection[],
};

// Helper function to get sections by category
export function getSectionsByCategory(categoryId: string): GenericSection[] {
  return SECTION_DATA[categoryId] || [];
}

// Helper function to get all available category IDs
export function getAvailableCategoryIds(): string[] {
  return Object.keys(SECTION_DATA);
}
