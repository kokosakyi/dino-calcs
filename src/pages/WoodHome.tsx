import { Link } from 'react-router';

export function WoodHome() {
  return (
    <div className="discipline-home wood-home">
      <div className="discipline-home-header">
        <div className="discipline-home-title">
          <h1>Wood Design</h1>
          <span className="discipline-home-code">CSA O86</span>
        </div>
        <p>Engineered wood design tools per CSA O86 — Engineering Design in Wood</p>
      </div>

      <div className="tool-category">
        <h2>Flexure and shear</h2>
        <p className="category-desc">
          Beam-style checks using specified strengths and modification factors (K<sub>D</sub>, K<sub>H</sub>, K<sub>S</sub>, K<sub>T</sub>, K<sub>Z</sub>, K<sub>L</sub>)
        </p>
        <div className="tool-grid">
          <Link to="/wood/joist-design" className="tool-card">
            <span className="tool-icon">⊢</span>
            <div className="tool-info">
              <h3>Joist design</h3>
              <p>Dimension lumber joists with system case K<sub>H</sub> and lateral stability</p>
            </div>
          </Link>
          <Link to="/wood/built-up-beam" className="tool-card">
            <span className="tool-icon">≡</span>
            <div className="tool-info">
              <h3>Built-up beam</h3>
              <p>Stacked plies, notch and shear fracture, bearing on combined width</p>
            </div>
          </Link>
          <Link to="/wood/sawn-timber-beam" className="tool-card">
            <span className="tool-icon">▭</span>
            <div className="tool-info">
              <h3>Sawn timber beam</h3>
              <p>Heavy timber sections (Table 6.3.1C sizes)</p>
            </div>
          </Link>
          <Link to="/wood/biaxial-bending" className="tool-card">
            <span className="tool-icon">⊞</span>
            <div className="tool-info">
              <h3>Biaxial bending</h3>
              <p>Sloped roof load resolved to M<sub>fx</sub> and M<sub>fy</sub> vs M<sub>r</sub></p>
            </div>
          </Link>
        </div>
      </div>

      <div className="tool-category">
        <h2>Coming later</h2>
        <p className="category-desc">Additional tools planned for this discipline</p>
        <div className="tool-grid">
          <div className="tool-card tool-card-disabled">
            <span className="tool-icon">⊡</span>
            <div className="tool-info">
              <h3>Column design</h3>
              <p>Studs and posts with slenderness</p>
            </div>
            <span className="coming-soon-badge">Soon</span>
          </div>
          <div className="tool-card tool-card-disabled">
            <span className="tool-icon">⧉</span>
            <div className="tool-info">
              <h3>Connections</h3>
              <p>Bolts, nails, and screws with group effects</p>
            </div>
            <span className="coming-soon-badge">Soon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
