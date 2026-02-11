import { useState, useMemo } from 'react';
import { MathJax } from 'better-react-mathjax';
import type { GenericSection } from '../types/steel';
import { SECTION_CATEGORIES } from '../types/steel';
import { SECTION_DATA } from '../data/sectionData';
import { CustomDropdown } from '../components/CustomDropdown';

export function SectionBrowser() {
  const [selectedCategory, setSelectedCategory] = useState<string>('W');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<GenericSection | null>(null);
  const [depthFilter, setDepthFilter] = useState<string>('all');

  // Get current category config
  const currentCategory = useMemo(() => {
    return SECTION_CATEGORIES.find(c => c.id === selectedCategory) || SECTION_CATEGORIES[0];
  }, [selectedCategory]);

  // Get sections for current category
  const sections = useMemo(() => {
    return SECTION_DATA[selectedCategory] || [];
  }, [selectedCategory]);

  // Get unique nominal depths for filtering (only for sections that have Dnom)
  const nominalDepths = useMemo(() => {
    const depths = [...new Set(sections.map(s => s.Dnom).filter(Boolean))] as string[];
    return depths.sort((a, b) => parseInt(b) - parseInt(a));
  }, [sections]);

  // Check if current category uses depth grouping
  const hasDepthGrouping = nominalDepths.length > 0;

  // Filter sections based on search and depth filter
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      const matchesSearch = section.Dsg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        section.Ds_i.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepth = !hasDepthGrouping || depthFilter === 'all' || section.Dnom === depthFilter;
      return matchesSearch && matchesDepth;
    });
  }, [sections, searchTerm, depthFilter, hasDepthGrouping]);

  // Group sections by nominal depth for display (if applicable)
  const groupedSections = useMemo(() => {
    if (!hasDepthGrouping) {
      return { 'all': filteredSections };
    }
    const groups: Record<string, GenericSection[]> = {};
    filteredSections.forEach(section => {
      const depth = section.Dnom || 'other';
      if (!groups[depth]) groups[depth] = [];
      groups[depth].push(section);
    });
    return groups;
  }, [filteredSections, hasDepthGrouping]);

  const sortedDepths = hasDepthGrouping 
    ? Object.keys(groupedSections).sort((a, b) => parseInt(b) - parseInt(a))
    : ['all'];

  // Handle category change - reset filters and selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSection(null);
    setSearchTerm('');
    setDepthFilter('all');
  };

  // Get group header label
  const getGroupHeader = (depth: string): string => {
    if (!hasDepthGrouping || depth === 'all') {
      return `All ${currentCategory.name}`;
    }
    return `${currentCategory.prefix}${depth} Series`;
  };

  // Get search placeholder
  const getSearchPlaceholder = (): string => {
    const examples = {
      'W': 'W310x97, W12x65',
      'C': 'C380x74, C15x50',
      'MC': 'MC460x86, MC18x58',
      'L': 'L203x203x29, L8x8x1.125',
      '2L': '2L152x102x13, 2L6x4x0.5',
      'S': 'S610x180, S24x121',
      'M': 'M310x17.6, M12x11.8',
      'HP': 'HP360x174, HP14x117',
      'WT': 'WT460x223, WT18x150',
      'WWT': 'WWT550x273, WWT22x184',
      'WWF': 'WWF1400x531, WWF55x357',
      'WRF': 'WRF1400x434, WRF55x292',
      'SLB': 'SLB550x72, SLB22x48',
      'HSS-A500': 'HA305x305x16, HA12x12x0.625',
      'HSS-G40': 'HG305x305x13, HG12x12x0.5',
    };
    return `Search sections (e.g., ${examples[selectedCategory as keyof typeof examples] || currentCategory.prefix + '...'})`;
  };

  return (
    <div className="section-browser-page">
      <header className="page-header">
        <h1>Steel Section Browser</h1>
        <p>Browse and view detailed properties of steel sections from the CISC Handbook</p>
      </header>

      <div className="browser-layout">
        <section className="section-list-panel">
          <div className="search-controls">
            <CustomDropdown
              label="Section Category"
              options={SECTION_CATEGORIES.map(cat => ({
                id: cat.id,
                label: cat.name,
                sublabel: cat.description
              }))}
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="category-dropdown"
            />
            
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            {hasDepthGrouping && (
              <CustomDropdown
                label="Nominal Depth"
                options={[
                  { id: 'all', label: 'All Depths' },
                  ...nominalDepths.map(depth => ({
                    id: depth,
                    label: `${currentCategory.prefix}${depth}`
                  }))
                ]}
                value={depthFilter}
                onChange={setDepthFilter}
              />
            )}
          </div>

          <div className="sections-count">
            {filteredSections.length} sections
          </div>

          <div className="sections-list">
            {sortedDepths.map(depth => (
              <div key={depth} className="depth-group">
                {(hasDepthGrouping || sortedDepths.length > 1) && (
                  <h3 className="depth-header">{getGroupHeader(depth)}</h3>
                )}
                <div className="sections-grid">
                  {groupedSections[depth]?.map(section => (
                    <button
                      key={section.Dsg}
                      className={`section-btn ${selectedSection?.Dsg === section.Dsg ? 'selected' : ''}`}
                      onClick={() => setSelectedSection(section)}
                    >
                      <span className="section-name">{section.Dsg}</span>
                      <span className="section-mass">{section.Mass} kg/m</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-details-panel">
          {selectedSection ? (
            <SectionDetails section={selectedSection} />
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">⊢</div>
              <p>Select a section from the list to view its properties</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function SectionDetails({ section }: { section: GenericSection }) {
  // Helper to check if property exists and has a value
  const hasValue = (key: string): boolean => {
    const value = section[key];
    return value !== undefined && value !== null && value !== '';
  };

  // Helper to render a property row only if value exists
  const renderProperty = (
    label: React.ReactNode,
    key: string,
    unit?: string,
    description?: string
  ) => {
    if (!hasValue(key)) return null;
    const value = unit ? `${section[key]} ${unit}` : section[key]!;
    return <PropertyRow key={key} label={label} value={value} description={description} />;
  };

  return (
    <div className="section-details">
      <div className="section-title">
        <h2>{section.Dsg}</h2>
        <span className="imperial-name">{section.Ds_i}</span>
      </div>

      <div className="properties-grid">
        {/* Basic Information - Always shown */}
        <PropertySection title="Basic Information">
          {renderProperty('Designation', 'Dsg')}
          {renderProperty('Imperial Designation', 'Ds_i')}
          {renderProperty('Mass', 'Mass', 'kg/m')}
          {renderProperty('Imperial Weight', 'Wt_i', 'lb/ft')}
          {renderProperty('Cross-sectional Area (A)', 'A', 'mm²')}
          {renderProperty('Surface Area', 'SA', 'm²/m')}
        </PropertySection>

        {/* Dimensions - Varies by section type */}
        <PropertySection title="Dimensions">
          {renderProperty('Depth (d)', 'D', 'mm')}
          {renderProperty('Nominal Depth', 'Dnom', 'mm')}
          {renderProperty('Width (b)', 'B', 'mm')}
          {renderProperty('Thickness (t)', 'T', 'mm')}
          {renderProperty('Web Thickness (w)', 'W', 'mm')}
          {renderProperty('k dimension', 'K', 'mm')}
          {renderProperty('k₁ dimension', 'K1', 'mm')}
          {/* HSS-specific dimensions */}
          {renderProperty('Design Wall Thickness', 'Tdes', 'mm')}
          {renderProperty('Inside Corner Radius', 'RI', 'mm')}
          {renderProperty('Outside Corner Radius', 'RO', 'mm')}
          {/* Channel-specific */}
          {renderProperty('Flange Slope', 'Slp')}
          {renderProperty('Toe Thickness (T1)', 'T1', 'mm')}
          {renderProperty('Toe Thickness (T2)', 'T2', 'mm')}
        </PropertySection>

        {/* Slenderness Ratios */}
        {(hasValue('BT') || hasValue('HW') || hasValue('DT')) && (
          <PropertySection title="Slenderness Ratios">
            {hasValue('BT') && (
              <PropertyRow
                label={<MathJax inline>{"\\(b/t\\)"}</MathJax>}
                value={section.BT!}
                description="Flange slenderness"
              />
            )}
            {hasValue('HW') && (
              <PropertyRow
                label={<MathJax inline>{"\\(h/w\\)"}</MathJax>}
                value={section.HW!}
                description="Web slenderness"
              />
            )}
            {hasValue('DT') && (
              <PropertyRow
                label={<MathJax inline>{"\\(d/t\\)"}</MathJax>}
                value={section.DT!}
                description="Depth/thickness ratio"
              />
            )}
          </PropertySection>
        )}

        {/* Strong Axis Properties */}
        {(hasValue('Ix') || hasValue('Sx') || hasValue('Zx') || hasValue('Rx')) && (
          <PropertySection title="Strong Axis (x-x) Properties">
            {hasValue('Ix') && (
              <PropertyRow
                label={<MathJax inline>{"\\(I_x\\)"}</MathJax>}
                value={`${section.Ix} ×10⁶ mm⁴`}
                description="Moment of inertia"
              />
            )}
            {hasValue('Sx') && (
              <PropertyRow
                label={<MathJax inline>{"\\(S_x\\)"}</MathJax>}
                value={`${section.Sx} ×10³ mm³`}
                description="Elastic section modulus"
              />
            )}
            {hasValue('Zx') && (
              <PropertyRow
                label={<MathJax inline>{"\\(Z_x\\)"}</MathJax>}
                value={`${section.Zx} ×10³ mm³`}
                description="Plastic section modulus"
              />
            )}
            {hasValue('Rx') && (
              <PropertyRow
                label={<MathJax inline>{"\\(r_x\\)"}</MathJax>}
                value={`${section.Rx} mm`}
                description="Radius of gyration"
              />
            )}
          </PropertySection>
        )}

        {/* Weak Axis Properties */}
        {(hasValue('Iy') || hasValue('Sy') || hasValue('Zy') || hasValue('Ry')) && (
          <PropertySection title="Weak Axis (y-y) Properties">
            {hasValue('Iy') && (
              <PropertyRow
                label={<MathJax inline>{"\\(I_y\\)"}</MathJax>}
                value={`${section.Iy} ×10⁶ mm⁴`}
                description="Moment of inertia"
              />
            )}
            {hasValue('Sy') && (
              <PropertyRow
                label={<MathJax inline>{"\\(S_y\\)"}</MathJax>}
                value={`${section.Sy} ×10³ mm³`}
                description="Elastic section modulus"
              />
            )}
            {hasValue('Zy') && (
              <PropertyRow
                label={<MathJax inline>{"\\(Z_y\\)"}</MathJax>}
                value={`${section.Zy} ×10³ mm³`}
                description="Plastic section modulus"
              />
            )}
            {hasValue('Ry') && (
              <PropertyRow
                label={<MathJax inline>{"\\(r_y\\)"}</MathJax>}
                value={`${section.Ry} mm`}
                description="Radius of gyration"
              />
            )}
          </PropertySection>
        )}

        {/* Torsional Properties */}
        {(hasValue('J') || hasValue('Cw') || hasValue('Wn') || hasValue('Sw') || hasValue('C') || hasValue('Crt')) && (
          <PropertySection title="Torsional Properties">
            {hasValue('J') && (
              <PropertyRow
                label={<MathJax inline>{"\\(J\\)"}</MathJax>}
                value={`${section.J} ×10³ mm⁴`}
                description="Torsional constant"
              />
            )}
            {hasValue('Cw') && (
              <PropertyRow
                label={<MathJax inline>{"\\(C_w\\)"}</MathJax>}
                value={`${section.Cw} ×10⁹ mm⁶`}
                description="Warping constant"
              />
            )}
            {hasValue('Wn') && (
              <PropertyRow
                label={<MathJax inline>{"\\(W_n\\)"}</MathJax>}
                value={section.Wn!}
                description="Normalized warping function"
              />
            )}
            {hasValue('Sw') && (
              <PropertyRow
                label={<MathJax inline>{"\\(S_w\\)"}</MathJax>}
                value={section.Sw!}
                description="Warping statical moment"
              />
            )}
            {/* HSS-specific torsional */}
            {hasValue('C') && (
              <PropertyRow
                label={<MathJax inline>{"\\(C\\)"}</MathJax>}
                value={`${section.C} ×10³ mm³`}
                description="Torsional constant (HSS)"
              />
            )}
            {hasValue('Crt') && (
              <PropertyRow
                label="Critical Stress"
                value={`${section.Crt} MPa`}
              />
            )}
          </PropertySection>
        )}

        {/* Shear Properties */}
        {(hasValue('Qf') || hasValue('Qw')) && (
          <PropertySection title="Shear Properties">
            {hasValue('Qf') && (
              <PropertyRow
                label={<MathJax inline>{"\\(Q_f\\)"}</MathJax>}
                value={`${section.Qf} ×10³ mm³`}
                description="First moment of flange"
              />
            )}
            {hasValue('Qw') && (
              <PropertyRow
                label={<MathJax inline>{"\\(Q_w\\)"}</MathJax>}
                value={`${section.Qw} ×10³ mm³`}
                description="First moment of half-section"
              />
            )}
          </PropertySection>
        )}

        {/* Centroid/Shear Center Properties (Angles, Channels, Tees) */}
        {(hasValue('X') || hasValue('Y') || hasValue('Xo') || hasValue('Yo')) && (
          <PropertySection title="Centroid & Shear Center">
            {hasValue('X') && (
              <PropertyRow
                label={<MathJax inline>{"\\(\\bar{x}\\)"}</MathJax>}
                value={`${section.X} mm`}
                description="Centroid X location"
              />
            )}
            {hasValue('Y') && (
              <PropertyRow
                label={<MathJax inline>{"\\(\\bar{y}\\)"}</MathJax>}
                value={`${section.Y} mm`}
                description="Centroid Y location"
              />
            )}
            {hasValue('Xo') && (
              <PropertyRow
                label={<MathJax inline>{"\\(x_o\\)"}</MathJax>}
                value={`${section.Xo} mm`}
                description="Shear center X"
              />
            )}
            {hasValue('Yo') && (
              <PropertyRow
                label={<MathJax inline>{"\\(y_o\\)"}</MathJax>}
                value={`${section.Yo} mm`}
                description="Shear center Y"
              />
            )}
            {hasValue('Xop') && (
              <PropertyRow
                label={<MathJax inline>{"\\(x_{op}\\)"}</MathJax>}
                value={`${section.Xop} mm`}
                description="Principal shear center X"
              />
            )}
            {hasValue('Yop') && (
              <PropertyRow
                label={<MathJax inline>{"\\(y_{op}\\)"}</MathJax>}
                value={`${section.Yop} mm`}
                description="Principal shear center Y"
              />
            )}
          </PropertySection>
        )}

        {/* Angle-Specific Properties */}
        {(hasValue('Ixy') || hasValue('TanA') || hasValue('Rop') || hasValue('Rxp') || hasValue('Ryp') || hasValue('Omeg')) && (
          <PropertySection title="Principal Axis Properties">
            {hasValue('Ixy') && (
              <PropertyRow
                label={<MathJax inline>{"\\(I_{xy}\\)"}</MathJax>}
                value={`${section.Ixy} ×10⁶ mm⁴`}
                description="Product of inertia"
              />
            )}
            {hasValue('TanA') && (
              <PropertyRow
                label={<MathJax inline>{"\\(\\tan\\alpha\\)"}</MathJax>}
                value={section.TanA!}
                description="Tangent of principal axis angle"
              />
            )}
            {hasValue('Rxp') && (
              <PropertyRow
                label={<MathJax inline>{"\\(r_{xp}\\)"}</MathJax>}
                value={`${section.Rxp} mm`}
                description="Principal radius of gyration (x)"
              />
            )}
            {hasValue('Ryp') && (
              <PropertyRow
                label={<MathJax inline>{"\\(r_{yp}\\)"}</MathJax>}
                value={`${section.Ryp} mm`}
                description="Principal radius of gyration (y)"
              />
            )}
            {hasValue('Rop') && (
              <PropertyRow
                label={<MathJax inline>{"\\(r_o\\)"}</MathJax>}
                value={`${section.Rop} mm`}
                description="Polar radius of gyration"
              />
            )}
            {hasValue('Omeg') && (
              <PropertyRow
                label={<MathJax inline>{"\\(\\Omega\\)"}</MathJax>}
                value={section.Omeg!}
                description="Omega factor"
              />
            )}
          </PropertySection>
        )}

        {/* Tee-Specific Properties */}
        {hasValue('BetX') && (
          <PropertySection title="Tee Properties">
            {hasValue('BetX') && (
              <PropertyRow
                label={<MathJax inline>{"\\(\\beta_x\\)"}</MathJax>}
                value={section.BetX!}
                description="Beta factor"
              />
            )}
          </PropertySection>
        )}
      </div>
    </div>
  );
}

function PropertySection({ title, children }: { title: string; children: React.ReactNode }) {
  // Filter out null/undefined children
  const validChildren = Array.isArray(children) 
    ? children.filter(child => child !== null && child !== undefined)
    : children;
  
  // Don't render section if no valid children
  if (Array.isArray(validChildren) && validChildren.length === 0) {
    return null;
  }
  
  return (
    <div className="property-section">
      <h3>{title}</h3>
      <div className="property-list">
        {validChildren}
      </div>
    </div>
  );
}

function PropertyRow({
  label,
  value,
  description
}: {
  label: React.ReactNode;
  value: string;
  description?: string;
}) {
  return (
    <div className="property-row">
      <div className="property-label">
        {label}
        {description && <span className="property-description">{description}</span>}
      </div>
      <div className="property-value">{value}</div>
    </div>
  );
}
