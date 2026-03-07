import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../components/CustomDropdown';
import { AngleCapacitySummary } from '../components/AngleCapacitySummary';
import { 
  calculateAngleMomentResistance, 
  calculateAngleShearResistance, 
  calculateAngleTensileResistance
} from '../utils/steelDesign';
import type { LSection, SteelGrade } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import lSections from '../assets/L_section.json';

interface AngleCapacityResult {
  section: LSection;
  Mrx: number;
  Mry: number;
  Vrx: number;
  Vry: number;
  Tr: number;
}

export function AngleCapacity() {
  // Section selection
  const [selectedDesignation, setSelectedDesignation] = useState<string>('L152x102x13');
  
  // Material inputs
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('350W');

  // Get unique section designations for dropdown
  const sectionOptions = useMemo(() => {
    return (lSections as LSection[]).map(section => ({
      id: section.Dsg,
      label: section.Dsg,
      sublabel: `${section.Mass} kg/m, ${section.D}x${section.B}x${section.T}mm`,
    }));
  }, []);

  // Find selected section
  const selectedSection = useMemo(() => {
    return (lSections as LSection[]).find(s => s.Dsg === selectedDesignation) || null;
  }, [selectedDesignation]);

  // Calculate capacities
  const capacityResult = useMemo((): AngleCapacityResult | null => {
    if (!selectedSection) return null;

    const { Fy } = STEEL_PROPERTIES[steelGrade];

    const Mrx = calculateAngleMomentResistance(selectedSection, Fy, 'x');
    const Mry = calculateAngleMomentResistance(selectedSection, Fy, 'y');
    const Vrx = calculateAngleShearResistance(selectedSection, Fy, 'x');
    const Vry = calculateAngleShearResistance(selectedSection, Fy, 'y');
    const Tr = calculateAngleTensileResistance(selectedSection, Fy);

    return {
      section: selectedSection,
      Mrx,
      Mry,
      Vrx,
      Vry,
      Tr,
    };
  }, [selectedSection, steelGrade]);

  return (
    <div className="section-capacity-page">
      <header className="page-header">
        <h1>Angle Capacity Check</h1>
        <p>Calculate member resistance values for angle sections</p>
        <div className="placeholder-notice">
          ⚠️ Using simplified placeholder formulas for preliminary design only
        </div>
      </header>

      {/* Section 1: Inputs */}
      <section className="input-panel">
        <h2>Section Selection & Parameters</h2>

        <div className="input-groups-container">
          <div className="input-group">
            <h3>Section</h3>
            <CustomDropdown
              label="Angle Section"
              options={sectionOptions}
              value={selectedDesignation}
              onChange={setSelectedDesignation}
              searchable={true}
            />
            {selectedSection && (
              <div className="section-quick-info">
                <div className="quick-info-item">
                  <span className="label">Mass:</span>
                  <span className="value">{selectedSection.Mass} kg/m</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Leg 1 (D):</span>
                  <span className="value">{selectedSection.D} mm</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Leg 2 (B):</span>
                  <span className="value">{selectedSection.B} mm</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Thickness:</span>
                  <span className="value">{selectedSection.T} mm</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Area:</span>
                  <span className="value">{selectedSection.A} mm²</span>
                </div>
              </div>
            )}
          </div>

          <div className="input-group">
            <h3>Material</h3>
            <CustomDropdown
              label="Steel Grade"
              options={[
                { id: '300W', label: 'CSA G40.21 300W', sublabel: 'Fy = 300 MPa' },
                { id: '350W', label: 'CSA G40.21 350W', sublabel: 'Fy = 350 MPa' },
                { id: '345W', label: 'ASTM A992', sublabel: 'Fy = 345 MPa' },
              ]}
              value={steelGrade}
              onChange={(v) => setSteelGrade(v as SteelGrade)}
            />
          </div>
        </div>

        <div className="design-criteria full-width">
          <h3>Resistance Formulas (Placeholder)</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <span className="criteria-label">Moment Resistance:</span>
              <MathJax inline>{"\\(M_r = \\phi S F_y\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">Shear Resistance:</span>
              <MathJax inline>{"\\(V_r = \\phi (A/2) (0.66 F_y)\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">Tensile Resistance:</span>
              <MathJax inline>{"\\(T_r = \\phi A F_y\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">
            φ = 0.9 (resistance factor) | ⚠️ Simplified placeholder formulas - accurate formulas required for final design
          </p>
        </div>
      </section>

      {/* Section 2: Capacity Summary */}
      {capacityResult && (
        <section className="calculations-panel">
          <AngleCapacitySummary
            result={capacityResult}
            steelGrade={steelGrade}
          />
        </section>
      )}

      {/* Section 3: Notes */}
      <section className="notes-panel">
        <h3>Design Notes</h3>
        <div className="notes-content">
          <div className="note-item">
            <strong>Placeholder Formulas:</strong> These calculations use simplified formulas for preliminary design. Replace with accurate CSA S16-19 formulas for final design.
          </div>
          <div className="note-item">
            <strong>Axes:</strong> Angles have different properties for x-x and y-y axes. Both resistances are provided.
          </div>
          <div className="note-item">
            <strong>Centroid Location:</strong> The centroid of an angle is not at the geometric center. Check section properties for centroid locations (X, Y).
          </div>
          <div className="note-item">
            <strong>Compression Resistance:</strong> Not calculated (requires buckling analysis based on effective length and support conditions).
          </div>
          <div className="note-item">
            <strong>Combined Loading:</strong> Not checked (requires interaction formulas for combined moment, shear, and axial forces).
          </div>
          <div className="note-item">
            <strong>Connections:</strong> Tensile resistance shown is for gross section. Reduce for net section at connections with holes.
          </div>
        </div>
      </section>
    </div>
  );
}
