import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import { InputField } from '../components/InputField';
import { ResultCard } from '../components/ResultCard';
import { DesignSummary } from '../components/DesignSummary';
import { findOptimalSection, calculateSimplySupported, calculateRequiredIx, calculateNBCCombinations } from '../utils/steelDesign';
import type { WSection, SteelGrade, DesignResult, LateralSupportType, SectionFilters, BeamDesignMode, DeflectionResult, NBCCombinationResult } from '../types/steel';
import wSections from '../data/W_Section.json';

export function BeamDesign() {
  // Design mode selection
  const [designMode, setDesignMode] = useState<BeamDesignMode>('direct');

  // Direct mode inputs (Mode 1)
  const [factoredMoment, setFactoredMoment] = useState<number>(500);
  const [factoredShear, setFactoredShear] = useState<number>(200);

  // UDL mode inputs (Mode 2)
  const [span, setSpan] = useState<number>(6000);
  const [udlULS, setUdlULS] = useState<number>(25);
  const [udlSLS, setUdlSLS] = useState<number>(18);
  const [deflectionLimit, setDeflectionLimit] = useState<240 | 300 | 360>(360);

  // NBC mode inputs (Mode 3)
  const [deadLoad, setDeadLoad] = useState<number>(5);
  const [liveLoad, setLiveLoad] = useState<number>(10);
  const [snowLoad, setSnowLoad] = useState<number>(2);
  const [windLoad, setWindLoad] = useState<number>(0);
  const [earthquakeLoad, setEarthquakeLoad] = useState<number>(0);

  // Common inputs
  const [steelGrade, setSteelGrade] = useState<SteelGrade>('350W');
  const [lateralSupport, setLateralSupport] = useState<LateralSupportType>('continuous');
  const [unbracedLength, setUnbracedLength] = useState<number>(3000);
  const [omega2, setOmega2] = useState<number>(1.0);
  const [selectedResult, setSelectedResult] = useState<DesignResult | null>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  // Section dimension filters (optional)
  const [showFilters, setShowFilters] = useState(false);
  const [minDepth, setMinDepth] = useState<number | undefined>(undefined);
  const [minFlangeWidth, setMinFlangeWidth] = useState<number | undefined>(undefined);
  const [minFlangeThickness, setMinFlangeThickness] = useState<number | undefined>(undefined);
  const [minWebThickness, setMinWebThickness] = useState<number | undefined>(undefined);

  // Build section filters object only with defined values
  const sectionFilters: SectionFilters | undefined = useMemo(() => {
    if (!showFilters) return undefined;

    const filters: SectionFilters = {};
    if (minDepth !== undefined && minDepth > 0) filters.minDepth = minDepth;
    if (minFlangeWidth !== undefined && minFlangeWidth > 0) filters.minFlangeWidth = minFlangeWidth;
    if (minFlangeThickness !== undefined && minFlangeThickness > 0) filters.minFlangeThickness = minFlangeThickness;
    if (minWebThickness !== undefined && minWebThickness > 0) filters.minWebThickness = minWebThickness;

    return Object.keys(filters).length > 0 ? filters : undefined;
  }, [showFilters, minDepth, minFlangeWidth, minFlangeThickness, minWebThickness]);

  const activeFilterCount = sectionFilters ? Object.keys(sectionFilters).length : 0;

  // Calculate Mf, Vf, and deflection requirements based on design mode
  const calculatedLoads = useMemo(() => {
    if (designMode === 'direct') {
      return {
        Mf: factoredMoment,
        Vf: factoredShear,
        deflectionResult: undefined as DeflectionResult | undefined,
        nbcResult: undefined as NBCCombinationResult | undefined,
      };
    } else if (designMode === 'udl') {
      const { Mf, Vf } = calculateSimplySupported(udlULS, span);
      const deflectionResult = calculateRequiredIx(udlSLS, span, deflectionLimit);
      return { Mf, Vf, deflectionResult, nbcResult: undefined as NBCCombinationResult | undefined };
    } else {
      // NBC mode
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
    const { Mf, Vf, deflectionResult } = calculatedLoads;
    if (Mf <= 0 && Vf <= 0) return [];

    return findOptimalSection(
      wSections as WSection[],
      {
        factoredMoment: Mf || 0,
        factoredShear: Vf || 0,
        steelGrade,
        lateralSupport,
        unbracedLength: lateralSupport === 'unsupported' ? unbracedLength : undefined,
        omega2: lateralSupport === 'unsupported' ? omega2 : undefined,
        sectionFilters,
      },
      deflectionResult
    );
  }, [calculatedLoads, steelGrade, lateralSupport, unbracedLength, omega2, sectionFilters]);

  const displayedResults = showAllResults ? results : results.slice(0, 6);
  const optimalResult = results[0] || null;

  return (
    <div className="beam-design-page">
      <header className="page-header">
        <h1>W-Section Beam Design</h1>
        <p>Select the most economical W-section based on factored loads per CSA S16-19</p>
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
                step={10}
              />
              <InputField
                label="Factored Shear (Vf)"
                value={factoredShear}
                onChange={setFactoredShear}
                unit="kN"
                min={0}
                step={10}
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
              <div className="input-field">
                <label>Deflection Limit (L/x)</label>
                <select
                  value={deflectionLimit}
                  onChange={(e) => setDeflectionLimit(Number(e.target.value) as 240 | 300 | 360)}
                >
                  <option value={360}>L/360 (floors with brittle finishes)</option>
                  <option value={300}>L/300 (general floors)</option>
                  <option value={240}>L/240 (roofs)</option>
                </select>
              </div>
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
              <div className="input-field">
                <label>Deflection Limit (L/x)</label>
                <select
                  value={deflectionLimit}
                  onChange={(e) => setDeflectionLimit(Number(e.target.value) as 240 | 300 | 360)}
                >
                  <option value={360}>L/360 (floors with brittle finishes)</option>
                  <option value={300}>L/300 (general floors)</option>
                  <option value={240}>L/240 (roofs)</option>
                </select>
              </div>
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
            <div className="input-field">
              <label>Steel Grade</label>
              <select
                value={steelGrade}
                onChange={(e) => setSteelGrade(e.target.value as SteelGrade)}
              >
                <option value="300W">CSA G40.21 300W (Fy = 300 MPa)</option>
                <option value="350W">CSA G40.21 350W (Fy = 350 MPa)</option>
                <option value="345W">ASTM A992 (Fy = 345 MPa)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <h3>Lateral Support</h3>
            <div className="input-field">
              <label>Compression Flange Support</label>
              <select
                value={lateralSupport}
                onChange={(e) => setLateralSupport(e.target.value as LateralSupportType)}
              >
                <option value="continuous">Continuous Lateral Support</option>
                <option value="unsupported">Laterally Unsupported</option>
              </select>
            </div>

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

        {/* Calculated Loads Summary - for UDL and NBC modes */}
        {(designMode === 'udl' || designMode === 'nbc') && (
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
          <h3>Design Criteria</h3>
          <div className="criteria-grid">
            {lateralSupport === 'continuous' ? (
              <>
                <div className="criteria-item">
                  <span className="criteria-label">Class 1 or 2:</span>
                  <MathJax inline>{"\\(M_r = \\phi Z_x F_y\\)"}</MathJax>
                </div>
                <div className="criteria-item">
                  <span className="criteria-label">Class 3:</span>
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
              <MathJax inline>{"\\(V_f \\leq V_r = \\phi A_w (0.66 F_y)\\)"}</MathJax>
            </div>
            {(designMode === 'udl' || designMode === 'nbc') && (
              <div className="criteria-item">
                <span className="criteria-label">Deflection:</span>
                <MathJax inline>{"\\(I_x \\geq I_{x,req}\\)"}</MathJax>
              </div>
            )}
          </div>
          <p className="criteria-note">φ = 0.9 (resistance factor)</p>
        </div>

        {/* Section Dimension Filters */}
        <div className="filters-section">
          <button
            className={`filters-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>Section Filters</span>
            {activeFilterCount > 0 && (
              <span className="filter-badge">{activeFilterCount} active</span>
            )}
            <span className={`toggle-icon ${showFilters ? 'open' : ''}`}>▼</span>
          </button>

          {showFilters && (
            <div className="filters-content">
              <p className="filters-note">Set minimum values to restrict section selection. Leave empty to ignore.</p>
              <div className="filters-grid">
                <div className="filter-field">
                  <label>Min. Depth (d)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minDepth ?? ''}
                      onChange={(e) => setMinDepth(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={10}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Flange Width (b)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minFlangeWidth ?? ''}
                      onChange={(e) => setMinFlangeWidth(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={5}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Flange Thickness (t)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minFlangeThickness ?? ''}
                      onChange={(e) => setMinFlangeThickness(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={1}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
                <div className="filter-field">
                  <label>Min. Web Thickness (w)</label>
                  <div className="filter-input-wrapper">
                    <input
                      type="number"
                      value={minWebThickness ?? ''}
                      onChange={(e) => setMinWebThickness(e.target.value ? Number(e.target.value) : undefined)}
                      placeholder="Any"
                      min={0}
                      step={1}
                    />
                    <span className="filter-unit">mm</span>
                  </div>
                </div>
              </div>
              {activeFilterCount > 0 && (
                <button
                  className="clear-filters-btn"
                  onClick={() => {
                    setMinDepth(undefined);
                    setMinFlangeWidth(undefined);
                    setMinFlangeThickness(undefined);
                    setMinWebThickness(undefined);
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Section 2: Design Calculations */}
      {(selectedResult || optimalResult) && (
        <section className="calculations-panel">
          <DesignSummary
            result={selectedResult || optimalResult!}
            factoredMoment={calculatedLoads.Mf}
            factoredShear={calculatedLoads.Vf}
            steelGrade={steelGrade}
            lateralSupport={lateralSupport}
            deflectionResult={calculatedLoads.deflectionResult}
            span={designMode !== 'direct' ? span : undefined}
            udlSLS={designMode === 'udl' ? udlSLS : calculatedLoads.nbcResult?.wSLS}
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
                <ResultCard
                  key={result.section.Dsg}
                  result={result}
                  rank={index + 1}
                  isSelected={selectedResult?.section.Dsg === result.section.Dsg}
                  onSelect={() => setSelectedResult(result)}
                  steelGrade={steelGrade}
                  lateralSupport={lateralSupport}
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
