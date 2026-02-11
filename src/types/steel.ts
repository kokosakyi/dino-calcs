// W Section properties from CISC Handbook
export interface WSection {
  Prp: string;      // Preferred section indicator
  Dsg: string;      // Designation (e.g., "W310x97")
  Avl: string;      // Availability
  Shp: string;      // Shape type
  Grp: string;      // Group
  Use: string;      // Usage code
  D: string;        // Depth (mm)
  B: string;        // Flange width (mm)
  T: string;        // Flange thickness (mm)
  W: string;        // Web thickness (mm)
  BT: string;       // b/t ratio (flange)
  HW: string;       // h/w ratio (web)
  K: string;        // k dimension (mm)
  K1: string;       // k1 dimension (mm)
  Dnom: string;     // Nominal depth (mm)
  Mass: string;     // Mass (kg/m)
  A: string;        // Area (mm²)
  Ix: string;       // Moment of inertia about x-axis (×10⁶ mm⁴)
  Sx: string;       // Elastic section modulus about x-axis (×10³ mm³)
  Rx: string;       // Radius of gyration about x-axis (mm)
  Zx: string;       // Plastic section modulus about x-axis (×10³ mm³)
  Iy: string;       // Moment of inertia about y-axis (×10⁶ mm⁴)
  Sy: string;       // Elastic section modulus about y-axis (×10³ mm³)
  Ry: string;       // Radius of gyration about y-axis (mm)
  Zy: string;       // Plastic section modulus about y-axis (×10³ mm³)
  J: string;        // Torsional constant (×10³ mm⁴)
  Cw: string;       // Warping constant (×10⁹ mm⁶)
  Wn: string;       // Normalized warping function
  Sw: string;       // Statical moment
  Qf: string;       // First moment of flange
  Qw: string;       // First moment of web
  SA: string;       // Surface area per meter (m²/m)
  Ds_i: string;     // Imperial designation
  Dn_i: string;     // Imperial nominal depth
  Wt_i: string;     // Imperial weight (lb/ft)
}

// Generic section interface for all section types
export interface GenericSection {
  // Common properties (all sections)
  Prp?: string;     // Preferred section indicator
  Dsg: string;      // Designation
  Avl?: string;     // Availability
  Shp?: string;     // Shape type
  Grp?: string;     // Group
  Use?: string;     // Usage code
  Mass: string;     // Mass (kg/m)
  A: string;        // Area (mm²)
  SA?: string;      // Surface area per meter (m²/m)
  Ds_i: string;     // Imperial designation
  Dn_i?: string;    // Imperial nominal depth
  Wt_i?: string;    // Imperial weight (lb/ft)
  
  // Dimensions
  D?: string;       // Depth (mm)
  B?: string;       // Width (mm)
  T?: string;       // Thickness (mm)
  W?: string;       // Web thickness (mm)
  K?: string;       // k dimension (mm)
  K1?: string;      // k1 dimension (mm)
  Dnom?: string;    // Nominal depth (mm)
  
  // Slenderness ratios
  BT?: string;      // b/t ratio
  HW?: string;      // h/w ratio
  DT?: string;      // d/t ratio
  
  // Strong axis properties
  Ix?: string;      // Moment of inertia about x-axis
  Sx?: string;      // Elastic section modulus about x-axis
  Rx?: string;      // Radius of gyration about x-axis
  Zx?: string;      // Plastic section modulus about x-axis
  
  // Weak axis properties
  Iy?: string;      // Moment of inertia about y-axis
  Sy?: string;      // Elastic section modulus about y-axis
  Ry?: string;      // Radius of gyration about y-axis
  Zy?: string;      // Plastic section modulus about y-axis
  
  // Torsional properties
  J?: string;       // Torsional constant
  Cw?: string;      // Warping constant
  Wn?: string;      // Normalized warping function
  Sw?: string;      // Statical moment
  
  // Shear properties
  Qf?: string;      // First moment of flange
  Qw?: string;      // First moment of web
  
  // Angle-specific properties
  X?: string;       // Centroid X location
  Y?: string;       // Centroid Y location
  Ixy?: string;     // Product of inertia
  TanA?: string;    // Tangent of principal axis angle
  Rop?: string;     // Polar radius of gyration
  Rxp?: string;     // Radius of gyration about principal x-axis
  Ryp?: string;     // Radius of gyration about principal y-axis
  Omeg?: string;    // Omega factor
  Xop?: string;     // Shear center X
  Yop?: string;     // Shear center Y
  
  // HSS-specific properties
  Tdes?: string;    // Design wall thickness
  RI?: string;      // Inside corner radius
  RO?: string;      // Outside corner radius
  Crt?: string;     // Critical stress
  C?: string;       // Torsional constant for HSS
  
  // Channel-specific properties
  Xo?: string;      // Shear center location
  T1?: string;      // Toe thickness 1
  T2?: string;      // Toe thickness 2
  Slp?: string;     // Flange slope
  
  // Tee-specific properties
  Yo?: string;      // Centroid Y location
  BetX?: string;    // Beta factor
  
  // Allow any additional properties
  [key: string]: string | undefined;
}

// Section category configuration
export interface SectionCategory {
  id: string;
  name: string;
  prefix: string;
  description: string;
}

export const SECTION_CATEGORIES: SectionCategory[] = [
  { id: 'W', name: 'W-Sections', prefix: 'W', description: 'Wide Flange Sections' },
  { id: 'C', name: 'C-Sections', prefix: 'C', description: 'Channel Sections' },
  { id: 'MC', name: 'MC-Sections', prefix: 'MC', description: 'Miscellaneous Channels' },
  { id: 'L', name: 'L-Sections', prefix: 'L', description: 'Angle Sections (Single)' },
  { id: '2L', name: '2L-Sections', prefix: '2L', description: 'Double Angle Sections' },
  { id: 'S', name: 'S-Sections', prefix: 'S', description: 'American Standard Beams' },
  { id: 'M', name: 'M-Sections', prefix: 'M', description: 'Miscellaneous Beams' },
  { id: 'HP', name: 'HP-Sections', prefix: 'HP', description: 'H-Pile Sections' },
  { id: 'WT', name: 'WT-Sections', prefix: 'WT', description: 'Structural Tees (cut from W)' },
  { id: 'WWT', name: 'WWT-Sections', prefix: 'WWT', description: 'Welded Wide Flange Tees' },
  { id: 'WWF', name: 'WWF-Sections', prefix: 'WWF', description: 'Welded Wide Flange' },
  { id: 'WRF', name: 'WRF-Sections', prefix: 'WRF', description: 'Welded Reduced Flange' },
  { id: 'SLB', name: 'SLB-Sections', prefix: 'SLB', description: 'Slender Beams' },
  { id: 'HSS-A500', name: 'HSS (A500)', prefix: 'H', description: 'Hollow Structural Sections (ASTM A500)' },
  { id: 'HSS-G40', name: 'HSS (G40)', prefix: 'H', description: 'Hollow Structural Sections (CSA G40)' },
];

export interface SectionFilters {
  minFlangeWidth?: number;      // Minimum flange width (mm)
  minFlangeThickness?: number;  // Minimum flange thickness (mm)
  minWebThickness?: number;     // Minimum web thickness (mm)
  minDepth?: number;            // Minimum overall depth (mm)
}

export interface DesignInputs {
  factoredMoment: number;    // Mf in kN·m
  factoredShear: number;     // Vf in kN
  steelGrade: SteelGrade;
  lateralSupport: LateralSupportType;
  unbracedLength?: number;   // L in mm (for laterally unsupported beams)
  omega2?: number;           // ω2 coefficient for moment gradient (default 1.0)
  sectionFilters?: SectionFilters;  // Optional section dimension filters
}

export type LateralSupportType = 'continuous' | 'unsupported';

export interface LateralTorsionalBucklingResult {
  Mu: number;               // Critical elastic moment (kN·m)
  Mp: number;               // Plastic moment = Zx × Fy (kN·m)
  Mr: number;               // Factored moment resistance (kN·m)
  governingCase: 'yielding' | 'inelastic_ltb' | 'elastic_ltb';
  omega2: number;
  unbracedLength: number;   // L in mm
}

export interface DesignResult {
  section: WSection;
  Mr: number;       // Factored moment resistance (kN·m)
  Vr: number;       // Factored shear resistance (kN)
  momentUtilization: number;  // Mf/Mr ratio
  shearUtilization: number;   // Vf/Vr ratio
  isAdequate: boolean;
  ltbResult?: LateralTorsionalBucklingResult;  // LTB calculation details (when laterally unsupported)
  deflectionUtilization?: number;  // Ix_required/Ix ratio (for UDL/NBC modes)
}

export interface SectionClassification {
  flangeClass: number;
  webClass: number;
  overallClass: number;
  flangeBT: number;
  webHW: number;
  flangeLimit1: number;
  flangeLimit2: number;
  flangeLimit3: number;
  webLimit1: number;
  webLimit2: number;
  webLimit3: number;
}

export type SteelGrade = '300W' | '350W' | '345W';

export const STEEL_PROPERTIES: Record<SteelGrade, { Fy: number; Fu: number }> = {
  '300W': { Fy: 300, Fu: 450 },
  '350W': { Fy: 350, Fu: 450 },
  '345W': { Fy: 345, Fu: 450 },
};

// Beam design modes
export type BeamDesignMode = 'direct' | 'udl' | 'nbc';

// UDL-based design inputs (Mode 2)
export interface UDLInputs {
  span: number;           // mm
  udlULS: number;         // kN/m - factored UDL for ULS
  udlSLS: number;         // kN/m - service UDL for SLS deflection check
  deflectionLimit: 240 | 300 | 360;  // L/x denominator
}

// NBC load combination inputs (Mode 3)
export interface NBCLoadInputs {
  span: number;           // mm
  deadLoad: number;       // kN/m
  liveLoad: number;       // kN/m
  snowLoad: number;       // kN/m
  windLoad: number;       // kN/m
  earthquakeLoad: number; // kN/m
  deflectionLimit: 240 | 300 | 360;
}

// Deflection calculation result
export interface DeflectionResult {
  requiredIx: number;           // ×10⁶ mm⁴
  allowableDeflection: number;  // mm
  actualDeflection?: number;    // mm (after section selected)
  deflectionUtilization?: number;
}

// NBC load combination result
export interface NBCCombinationResult {
  governingULSCombination: string;
  governingSLSCombination: string;
  wULS: number;           // kN/m - governing factored load
  wSLS: number;           // kN/m - service load for deflection
  ulsCombinations: { name: string; value: number; isGoverning: boolean }[];
  slsCombinations: { name: string; value: number; isGoverning: boolean }[];
}
