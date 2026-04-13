import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { InputField } from '../components/InputField';
import { AngleResultCard } from '../components/AngleResultCard';
import { AngleDesignSummary } from '../components/AngleDesignSummary';
import { CustomDropdown } from '../components/CustomDropdown';
import { findOptimalAngleSection, calculateSimplySupported, calculateRequiredIx, calculateNBCCombinations } from '../utils/steelDesign';
import type { LSection, SteelGrade, AngleDesignResult, BeamDesignMode, DeflectionResult, NBCCombinationResult } from '../types/steel';
import lSections from '../assets/L_section.json';

export function AngleBeamDesign() {
  // Design mode selection
  const [designMode, setDesignMode] = useState<BeamDesignMode>('direct');

  // Direct mode inputs (Mode 1)
  const [factoredMoment, setFactoredMoment] = useState<number | null>(50);
  const [factoredShear, setFactoredShear] = useState<number | null>(30);

  // UDL mode inputs (Mode 2)
  const [span, setSpan] = useState<number | null>(3000);
  const [udlULS, setUdlULS] = useState<number | null>(10);
  const [udlSLS, setUdlSLS] = useState<number | null>(7);
  const [deflectionLimit, setDeflectionLimit] = useState<240 | 300 | 360>(360);

  // NBC mode inputs (Mode 3)
  const [deadLoad, setDeadLoad] = useState<number | null>(3);
  const [liveLoad, setLiveLoad] = useState<number | null>(5);
  const [snowLoad, setSnowLoad] = useState<number | null>(1);
  const [windLoad, setWindLoad] = useState<number | null>(0);
  const [earthquakeLoad, setEarthquakeLoad] = useState<number | null>(0);

  // Common inputs
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('350W');
  const [designAxis, setDesignAxis] = useState<'x' | 'y'>('x');
  const [selectedResult, setSelectedResult] = useState<AngleDesignResult | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  // Calculate Mf, Vf, and deflection requirements based on design mode
  const calculatedLoads = useMemo(() => {
    if (designMode === 'direct') {
      if (factoredMoment == null || factoredShear == null) return null;
      return {
        Mf: factoredMoment,
        Vf: factoredShear,
        deflectionResult: undefined as DeflectionResult | undefined,
        nbcResult: undefined as NBCCombinationResult | undefined,
      };
    } else if (designMode === 'udl') {
      if (span == null || udlULS == null || udlSLS == null) return null;
      const { Mf, Vf } = calculateSimplySupported(udlULS, span);
      const deflectionResult = calculateRequiredIx(udlSLS, span, deflectionLimit);
      return { Mf, Vf, deflectionResult, nbcResult: undefined as NBCCombinationResult | undefined };
    } else {
      if (
        span == null || deadLoad == null || liveLoad == null || snowLoad == null
        || windLoad == null || earthquakeLoad == null
      ) return null;
      const nbcResult = calculateNBCCombinations({
        span,
        deadLoad,
        liveLoad,
        snowLoad,
        windLoad,
        earthquakeLoad,
        deflectionLimit,
      });
      const { Mf, Vf } = calculateSimplySupported(nbcResult.wULS, span);
      const deflectionResult = calculateRequiredIx(nbcResult.wSLS, span, deflectionLimit);
      return { Mf, Vf, deflectionResult, nbcResult };
    }
  }, [designMode, factoredMoment, factoredShear, span, udlULS, udlSLS, deflectionLimit, deadLoad, liveLoad, snowLoad, windLoad, earthquakeLoad]);

  const results = useMemo(() => {
    if (!calculatedLoads) return [];
    const { Mf, Vf, deflectionResult } = calculatedLoads;
    if (Mf <= 0 && Vf <= 0) return [];

    return findOptimalAngleSection(
      lSections as LSection[],
      Mf || 0,
      Vf || 0,
      steelGrade,
      designAxis,
      deflectionResult
    );
  }, [calculatedLoads, steelGrade, designAxis]);

  const displayedResults = showAllResults ? results : results.slice(0, 6);
  const optimalResult = results[0] || null;

  return (
    <div className="beam-design-page">
      <header className="page-header">
        <h1>Angle Beam Design</h1>
        <p>Select the most economical angle section based on factored loads</p>
        <div className="placeholder-notice">
          ⚠️ Using simplified placeholder formulas for preliminary design only
        </div>
      </header>

      {/* Design Mode Selector */}
      <section className="mode-selector-panel">
        <div className="mode-selector">
          <button
            className={`mode-btn ${designMode === 'direct' ? 'active' : ''}`}
            onClick={() => setDesignMode('direct')}
          >
            <span className="mode-title">Direct Input</span>
            <span className="mode-desc">Enter Mf and Vf directly</span>
          </button>
          <button
            className={`mode-btn ${designMode === 'udl' ? 'active' : ''}`}
            onClick={() => setDesignMode('udl')}
          >
            <span className="mode-title">UDL Analysis</span>
            <span className="mode-desc">Calculate from UDL with deflection check</span>
          </button>
          <button
            className={`mode-btn ${designMode === 'nbc' ? 'active' : ''}`}
            onClick={() => setDesignMode('nbc')}
          >
            <span className="mode-title">NBC Combinations</span>
            <span className="mode-desc">Apply NBC 2020 load factors</span>
          </button>
        </div>
      </section>

      {/* Section 1: Design Inputs */}
      <section className="input-panel">
        <h2>Design Inputs</h2>

        <div className="input-groups-container">
          {/* Mode 1: Direct Input */}
          {designMode === 'direct' && (
            <div className="input-group">
              <h3>Factored Loads</h3>
              <InputField
                label="Factored Moment (Mf)"
                value={factoredMoment}
                onChange={setFactoredMoment}
                unit="kN·m"
                min={0}
                step={5}
              />
              <InputField
                label="Factored Shear (Vf)"
                value={factoredShear}
                onChange={setFactoredShear}
                unit="kN"
                min={0}
                step={5}
              />
            </div>
          )}

          {/* Mode 2: UDL Analysis */}
          {designMode === 'udl' && (
            <div className="input-group">
              <h3>Beam Geometry & Loading</h3>
              <InputField
                label="Span Length (L)"
                value={span}
                onChange={setSpan}
                unit="mm"
                min={0}
                step={100}
              />
              <InputField
                label="Factored UDL (wf) - ULS"
                value={udlULS}
                onChange={setUdlULS}
                unit="kN/m"
                min={0}
                step={1}
              />
              <InputField
                label="Service UDL (ws) - SLS"
                value={udlSLS}
                onChange={setUdlSLS}
                unit="kN/m"
                min={0}
                step={1}
              />
              <CustomDropdown
                label="Deflection Limit (L/x)"
                options={[
                  { id: '360', label: 'L/360', sublabel: 'floors with brittle finishes' },
                  { id: '300', label: 'L/300', sublabel: 'general floors' },
                  { id: '240', label: 'L/240', sublabel: 'roofs' },
                ]}
                value={String(deflectionLimit)}
                onChange={(v) => setDeflectionLimit(Number(v) as 240 | 300 | 360)}
              />
            </div>
          )}

          {/* Mode 3: NBC Load Combinations */}
          {designMode === 'nbc' && (
            <div className="input-group">
              <h3>Beam Geometry</h3>
              <InputField
                label="Span Length (L)"
                value={span}
                onChange={setSpan}
                unit="mm"
                min={0}
                step={100}
              />
              <CustomDropdown
                label="Deflection Limit (L/x)"
                options={[
                  { id: '360', label: 'L/360', sublabel: 'floors with brittle finishes' },
                  { id: '300', label: 'L/300', sublabel: 'general floors' },
                  { id: '240', label: 'L/240', sublabel: 'roofs' },
                ]}
                value={String(deflectionLimit)}
                onChange={(v) => setDeflectionLimit(Number(v) as 240 | 300 | 360)}
              />
              <h3>Unfactored Loads (kN/m)</h3>
              <InputField
                label="Dead Load (D)"
                value={deadLoad}
                onChange={setDeadLoad}
                unit="kN/m"
                min={0}
                step={0.5}
              />
              <InputField
                label="Live Load (L)"
                value={liveLoad}
                onChange={setLiveLoad}
                unit="kN/m"
                min={0}
                step={0.5}
              />
              <InputField
                label="Snow Load (S)"
                value={snowLoad}
                onChange={setSnowLoad}
                unit="kN/m"
                min={0}
                step={0.5}
              />
              <InputField
                label="Wind Load (W)"
                value={windLoad}
                onChange={setWindLoad}
                unit="kN/m"
                min={0}
                step={0.5}
              />
              <InputField
                label="Earthquake Load (E)"
                value={earthquakeLoad}
                onChange={setEarthquakeLoad}
                unit="kN/m"
                min={0}
                step={0.5}
              />
            </div>
          )}

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
            <h3>Design Axis</h3>
            <CustomDropdown
              label="Primary Bending Axis"
              options={[
                { id: 'x', label: 'X-Axis', sublabel: 'Bending about x-x axis' },
                { id: 'y', label: 'Y-Axis', sublabel: 'Bending about y-y axis' },
              ]}
              value={designAxis}
              onChange={(v) => setDesignAxis(v as 'x' | 'y')}
            />
            <p className="input-note">
              Angles have different properties for x-x and y-y axes. Select the axis perpendicular to the loading direction.
            </p>
          </div>
        </div>

        {/* Calculated Loads Summary - for UDL and NBC modes */}
        {(designMode === 'udl' || designMode === 'nbc') && calculatedLoads && (
          <div className="calculated-loads-summary full-width">
            <h3>Calculated Design Values</h3>

            {/* NBC Load Combinations Display */}
            {designMode === 'nbc' && calculatedLoads.nbcResult && (
              <div className="load-combinations-section">
                <div className="combinations-row">
                  <div className="combinations-group">
                    <h4>ULS Load Combinations (NBC 2020)</h4>
                    <div className="combinations-list">
                      {calculatedLoads.nbcResult.ulsCombinations.map((combo) => (
                        <div
                          key={combo.name}
                          className={`combination-item ${combo.isGoverning ? 'governing' : ''}`}
                        >
                          <span className="combo-name">{combo.name}</span>
                          <span className="combo-value">{combo.value.toFixed(2)} kN/m</span>
                          {combo.isGoverning && <span className="governing-badge">Governing</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="combinations-group">
                    <h4>SLS Load Combinations (Deflection)</h4>
                    <div className="combinations-list">
                      {calculatedLoads.nbcResult.slsCombinations.map((combo) => (
                        <div
                          key={combo.name}
                          className={`combination-item ${combo.isGoverning ? 'governing' : ''}`}
                        >
                          <span className="combo-name">{combo.name}</span>
                          <span className="combo-value">{combo.value.toFixed(2)} kN/m</span>
                          {combo.isGoverning && <span className="governing-badge">Governing</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="calculated-values-grid">
              <div className="calculated-value">
                <span className="label">Factored Moment (Mf):</span>
                <span className="value">{calculatedLoads.Mf.toFixed(1)} kN·m</span>
                <MathJax inline>{"\\(M_f = \\frac{w_f L^2}{8}\\)"}</MathJax>
              </div>

              <div className="calculated-value">
                <span className="label">Factored Shear (Vf):</span>
                <span className="value">{calculatedLoads.Vf.toFixed(1)} kN</span>
                <MathJax inline>{"\\(V_f = \\frac{w_f L}{2}\\)"}</MathJax>
              </div>

              {calculatedLoads.deflectionResult && (
                <>
                  <div className="calculated-value">
                    <span className="label">Allowable Deflection:</span>
                    <span className="value">{calculatedLoads.deflectionResult.allowableDeflection.toFixed(1)} mm</span>
                    <span className="formula">L/{deflectionLimit}</span>
                  </div>
                  <div className="calculated-value">
                    <span className="label">Required Ix:</span>
                    <span className="value">{calculatedLoads.deflectionResult.requiredIx.toFixed(1)} ×10⁶ mm⁴</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="design-criteria full-width">
          <h3>Design Criteria (Placeholder Formulas)</h3>
          <div className="criteria-grid">
            <div className="criteria-item">
              <span className="criteria-label">Moment Resistance:</span>
              <MathJax inline>{"\\(M_r = \\phi S_x F_y\\)"}</MathJax>
            </div>
            <div className="criteria-item">
              <span className="criteria-label">Shear Resistance:</span>
              <MathJax inline>{"\\(V_r = \\phi (A/2) (0.66 F_y)\\)"}</MathJax>
            </div>
            {(designMode === 'udl' || designMode === 'nbc') && (
              <div className="criteria-item">
                <span className="criteria-label">Deflection:</span>
                <MathJax inline>{"\\(I_x \\geq I_{x,req}\\)"}</MathJax>
              </div>
            )}
          </div>
          <p className="criteria-note">φ = 0.9 (resistance factor) | ⚠️ Simplified placeholder formulas</p>
        </div>
      </section>

      {/* Section 2: Design Calculations */}
      {(selectedResult || optimalResult) && calculatedLoads && (
        <section className="calculations-panel">
          <AngleDesignSummary
            result={selectedResult || optimalResult!}
            factoredMoment={calculatedLoads.Mf}
            factoredShear={calculatedLoads.Vf}
            steelGrade={steelGrade}
            designAxis={designAxis}
            deflectionResult={calculatedLoads.deflectionResult}
            span={designMode !== 'direct' ? (span ?? undefined) : undefined}
            udlSLS={designMode === 'udl' ? (udlSLS ?? undefined) : calculatedLoads.nbcResult?.wSLS}
          />
        </section>
      )}

      {/* Section 3: Suitable Sections */}
      <section className="results-panel">
        <div className="results-header">
          <h2>Suitable Sections</h2>
          <span className="results-count">{results.length} sections found</span>
        </div>

        {results.length === 0 ? (
          <div className="no-results">
            <p>Enter factored moment and shear values to find suitable sections.</p>
          </div>
        ) : (
          <>
            <div className="results-grid">
              {displayedResults.map((result, index) => (
                <AngleResultCard
                  key={result.section.Dsg}
                  result={result}
                  rank={index + 1}
                  isSelected={selectedResult?.section.Dsg === result.section.Dsg}
                  onSelect={() => setSelectedResult(result)}
                  steelGrade={steelGrade}
                  designAxis={designAxis}
                />
              ))}
            </div>

            {results.length > 6 && (
              <button
                className="show-more-btn"
                onClick={() => setShowAllResults(!showAllResults)}
              >
                {showAllResults ? 'Show Less' : `Show All ${results.length} Sections`}
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
