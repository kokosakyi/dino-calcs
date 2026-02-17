import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { CustomDropdown } from '../components/CustomDropdown';
import { InputField } from '../components/InputField';
import { CapacitySummary } from '../components/CapacitySummary';
import { 
  calculateMomentResistance, 
  calculateShearResistance, 
  calculateTensileResistance,
  calculateLateralTorsionalBuckling,
  checkSectionClass 
} from '../utils/steelDesign';
import type { WSection, SteelGrade, LateralSupportType, LateralTorsionalBucklingResult } from '../types/steel';
import { STEEL_PROPERTIES } from '../types/steel';
import wSections from '../data/W_Section.json';

interface CapacityResult {
  section: WSection;
  Mr: number;
  Vr: number;
  Tr: number;
  ltbResult?: LateralTorsionalBucklingResult;
}

export function SectionCapacity() {
  // Section selection
  const [selectedDesignation, setSelectedDesignation] = useState<string>('W310x97');
  
  // Material and support inputs
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('350W');
  const [lateralSupport, setLateralSupport] = useState<LateralSupportType>('continuous');
  const [unbracedLength, setUnbracedLength] = useState<number>(3000);
  const [omega2, setOmega2] = useState<number>(1.0);

  // Get unique section designations for dropdown
  const sectionOptions = useMemo(() => {
    return (wSections as WSection[]).map(section => ({
      id: section.Dsg,
      label: section.Dsg,
      sublabel: `${section.Mass} kg/m, d=${section.D}mm`,
    }));
  }, []);

  // Find selected section
  const selectedSection = useMemo(() => {
    return (wSections as WSection[]).find(s => s.Dsg === selectedDesignation) || null;
  }, [selectedDesignation]);

  // Calculate capacities
  const capacityResult = useMemo((): CapacityResult | null => {
    if (!selectedSection) return null;

    const { Fy } = STEEL_PROPERTIES[steelGrade];
    const sectionClass = checkSectionClass(selectedSection, Fy);

    let Mr: number;
    let ltbResult: LateralTorsionalBucklingResult | undefined;

    if (lateralSupport === 'unsupported' && unbracedLength > 0) {
      // Laterally unsupported - calculate LTB resistance
      if (sectionClass.overallClass <= 2) {
        ltbResult = calculateLateralTorsionalBuckling(
          selectedSection,
          Fy,
          unbracedLength,
          omega2
        );
        Mr = ltbResult.Mr;
      } else {
        // Class 3 or 4 - use elastic section modulus (simplified)
        Mr = calculateMomentResistance(selectedSection, Fy);
      }
    } else {
      // Continuous lateral support
      Mr = calculateMomentResistance(selectedSection, Fy);
    }

    const Vr = calculateShearResistance(selectedSection, Fy);
    const Tr = calculateTensileResistance(selectedSection, Fy);

    return {
      section: selectedSection,
      Mr,
      Vr,
      Tr,
      ltbResult,
    };
  }, [selectedSection, steelGrade, lateralSupport, unbracedLength, omega2]);

  return (
    <div className="section-capacity-page">
      <header className="page-header">
        <h1>Section Capacity Check</h1>
        <p>Calculate member resistance values for W-sections per CSA S16-19</p>
      </header>

      {/* Section 1: Inputs */}
      <section className="input-panel">
        <h2>Section Selection & Parameters</h2>

        <div className="input-groups-container">
          <div className="input-group">
            <h3>Section</h3>
            <CustomDropdown
              label="W-Section"
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
                  <span className="label">Depth:</span>
                  <span className="value">{selectedSection.D} mm</span>
                </div>
                <div className="quick-info-item">
                  <span className="label">Width:</span>
                  <span className="value">{selectedSection.B} mm</span>
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

          <div className="input-group">
            <h3>Lateral Support</h3>
            <CustomDropdown
              label="Compression Flange Support"
              options={[
                { id: 'continuous', label: 'Continuous Lateral Support' },
                { id: 'unsupported', label: 'Laterally Unsupported' },
              ]}
              value={lateralSupport}
              onChange={(v) => setLateralSupport(v as LateralSupportType)}
            />

            {lateralSupport === 'unsupported' && (
              <>
                <InputField
                  label="Unbraced Length (L)"
                  value={unbracedLength}
                  onChange={setUnbracedLength}
                  unit="mm"
                  min={0}
                  step={100}
                />
                <InputField
                  label="Moment Gradient Coefficient (ω₂)"
                  value={omega2}
                  onChange={setOmega2}
                  unit=""
                  min={1.0}
                  max={2.5}
                  step={0.1}
                />
                <p className="input-note">
                  ω₂ = 1.0 for uniform moment. For moment gradient, ω₂ can be calculated based on moment distribution.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Design Criteria Summary */}
        <div className="design-criteria full-width">
          <h3>Resistance Equations (CSA S16-19)</h3>
          <div className="criteria-grid">
            {lateralSupport === 'continuous' ? (
              <>
                <div className="criteria-item">
                  <span className="criteria-label">Moment (Class 1/2):</span>
                  <MathJax inline>{"\\(M_r = \\phi Z_x F_y\\)"}</MathJax>
                </div>
                <div className="criteria-item">
                  <span className="criteria-label">Moment (Class 3):</span>
                  <MathJax inline>{"\\(M_r = \\phi S_x F_y\\)"}</MathJax>
                </div>
              </>
            ) : (
              <>
                <div className="criteria-item">
                  <MathJax inline>{"\\(M_u > 0.67M_p: M_r = 1.15\\phi M_p(1 - 0.28M_p/M_u) \\leq \\phi M_p\\)"}</MathJax>
                </div>
                <div className="criteria-item">
                  <MathJax inline>{"\\(M_u \\leq 0.67M_p: M_r = \\phi M_u\\)"}</MathJax>
                </div>
              </>
            )}
            <div className="criteria-item">
              <span className="criteria-label">Shear:</span>
              <MathJax inline>{"\\(V_r = \\phi A_w (0.66 F_y)\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">Tension:</span>
              <MathJax inline>{"\\(T_r = \\phi A_g F_y\\)"}</MathJax>
            </div>
          </div>
          <p className="criteria-note">φ = 0.9 (resistance factor)</p>
        </div>
      </section>

      {/* Section 2: Capacity Results Summary */}
      {capacityResult && (
        <section className="capacity-results-panel">
          <h2>Calculated Resistances</h2>
          <div className="capacity-cards-grid">
            <div className="capacity-card moment">
              <div className="capacity-icon">
                <MathJax inline>{"\\(M_r\\)"}</MathJax>
              </div>
              <div className="capacity-details">
                <span className="capacity-label">Moment Resistance</span>
                <span className="capacity-value">{capacityResult.Mr.toFixed(1)} kN·m</span>
                {capacityResult.ltbResult && (
                  <span className="capacity-note">
                    {capacityResult.ltbResult.governingCase === 'yielding' ? 'Yielding governs' :
                     capacityResult.ltbResult.governingCase === 'inelastic_ltb' ? 'Inelastic LTB governs' :
                     'Elastic LTB governs'}
                  </span>
                )}
              </div>
            </div>

            <div className="capacity-card shear">
              <div className="capacity-icon">
                <MathJax inline>{"\\(V_r\\)"}</MathJax>
              </div>
              <div className="capacity-details">
                <span className="capacity-label">Shear Resistance</span>
                <span className="capacity-value">{capacityResult.Vr.toFixed(1)} kN</span>
              </div>
            </div>

            <div className="capacity-card tension">
              <div className="capacity-icon">
                <MathJax inline>{"\\(T_r\\)"}</MathJax>
              </div>
              <div className="capacity-details">
                <span className="capacity-label">Tensile Resistance</span>
                <span className="capacity-value">{capacityResult.Tr.toFixed(1)} kN</span>
                <span className="capacity-note">Gross section yielding</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Detailed Calculations */}
      {capacityResult && (
        <section className="calculations-panel">
          <CapacitySummary
            result={capacityResult}
            steelGrade={steelGrade}
            lateralSupport={lateralSupport}
          />
        </section>
      )}
    </div>
  );
}
