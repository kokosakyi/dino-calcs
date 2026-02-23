import { Link } from 'react-router';

export function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Structural Design Calculator</h1>
        <p>Professional structural analysis tools following Canadian standards</p>
      </div>

      <div className="features-grid">
        <Link to="/steel/beam-design" className="feature-card">
          <div className="feature-icon">⊢</div>
          <h2>Steel Beam Design</h2>
          <p>Select economical W-sections based on factored moment and shear using CISC standards</p>
          <span className="feature-tag">CSA S16-19</span>
        </Link>

        <Link to="/steel/section-browser" className="feature-card">
          <div className="feature-icon">▤</div>
          <h2>Section Browser</h2>
          <p>Browse and view detailed properties of all W-sections from the CISC Handbook</p>
          <span className="feature-tag">CISC Database</span>
        </Link>

        <Link to="/steel/column-design" className="feature-card">
          <div className="feature-icon">⊡</div>
          <h2>Column Design</h2>
          <p>Select economical W-sections for axial compression using CSA S16-19 buckling resistance</p>
          <span className="feature-tag">CSA S16-19</span>
        </Link>

        <div className="feature-card disabled">
          <div className="feature-icon">⊞</div>
          <h2>Connection Design</h2>
          <p>Bolted and welded connection design calculations</p>
          <span className="feature-tag coming-soon">Coming Soon</span>
        </div>

        <div className="feature-card disabled">
          <div className="feature-icon">▭</div>
          <h2>Concrete Design</h2>
          <p>Reinforced concrete beam and slab design</p>
          <span className="feature-tag coming-soon">Coming Soon</span>
        </div>
      </div>

      <div className="standards-info">
        <h3>Design Standards</h3>
        <ul>
          <li>CSA S16-19 - Design of Steel Structures</li>
          <li>CISC Handbook of Steel Construction</li>
          <li>CSA G40.21 - Structural Quality Steel</li>
        </ul>
      </div>
    </div>
  );
}
