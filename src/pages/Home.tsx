import { Link } from 'react-router';

export function Home() {
  return (
    <div className="home-page">
      <div className="hero">
        <h1>Structural Design Calculator</h1>
        <p>Professional structural analysis tools following Canadian design standards</p>
      </div>

      <div className="discipline-cards">
        <Link to="/analysis" className="discipline-card analysis">
          <div className="discipline-card-header">
            <div className="discipline-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3L3 9l9 6 9-6-9-6z" />
                <path d="M3 15l9 6 9-6" />
                <path d="M12 12L3 9v6l9 6 9-6V9l-9 3z" />
              </svg>
            </div>
            <span className="discipline-card-tag">SAS</span>
          </div>
          <h2>Structural Analysis</h2>
          <p>
            Build 3D structural models with nodes, frames, trusses, springs, loads, and supports. Run linear analysis and view deformations, forces, and reactions in the integrated SAS workspace.
          </p>
          <div className="discipline-card-tools">
            <span>3D viewport</span>
            <span>Linear solve</span>
            <span>Results</span>
          </div>
          <div className="discipline-card-status available">Open SAS</div>
        </Link>

        <Link to="/steel" className="discipline-card steel">
          <div className="discipline-card-header">
            <div className="discipline-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 6h20M2 6v12h20V6M7 6V2M17 6V2M7 18v4M17 18v4" />
              </svg>
            </div>
            <span className="discipline-card-tag">CSA S16-19</span>
          </div>
          <h2>Steel Design</h2>
          <p>Design and verify steel members per CSA S16-19 with CISC section databases. Beams, columns, baseplates, and capacity checks for W, C, S, and L sections.</p>
          <div className="discipline-card-tools">
            <span>Beam Design</span>
            <span>Capacity Checks</span>
            <span>Column Design</span>
            <span>Baseplates</span>
            <span>Section Browser</span>
          </div>
          <div className="discipline-card-status available">11 tools available</div>
        </Link>

        <Link to="/concrete" className="discipline-card concrete">
          <div className="discipline-card-header">
            <div className="discipline-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </div>
            <span className="discipline-card-tag">CSA A23.3</span>
          </div>
          <h2>Concrete Design</h2>
          <p>Reinforced concrete design per CSA A23.3: rectangular beams, one-way slabs, and isolated spread footings with flexure, shear, and service checks.</p>
          <div className="discipline-card-tools">
            <span>Beam Design</span>
            <span>One-Way Slab</span>
            <span>Isolated Footing</span>
          </div>
          <div className="discipline-card-status available">3 tools available</div>
        </Link>

        <Link to="/wood" className="discipline-card wood">
          <div className="discipline-card-header">
            <div className="discipline-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L7 7h3v6H7l5 5 5-5h-3V7h3L12 2z" />
                <line x1="7" y1="21" x2="17" y2="21" />
                <line x1="12" y1="18" x2="12" y2="21" />
              </svg>
            </div>
            <span className="discipline-card-tag">CSA O86</span>
          </div>
          <h2>Wood Design</h2>
          <p>Engineered wood design per CSA O86: joists, built-up beams, sawn timber beams, and biaxial bending with specified strengths and modification factors.</p>
          <div className="discipline-card-tools">
            <span>Joist Design</span>
            <span>Built-Up Beam</span>
            <span>Sawn Timber</span>
            <span>Biaxial Bending</span>
          </div>
          <div className="discipline-card-status available">4 tools available</div>
        </Link>
      </div>

      <div className="standards-info">
        <h3>Design Standards</h3>
        <ul>
          <li>CSA S16-19 &mdash; Design of Steel Structures</li>
          <li>CSA A23.3 &mdash; Design of Concrete Structures</li>
          <li>CSA O86 &mdash; Engineering Design in Wood</li>
          <li>CISC Handbook of Steel Construction</li>
          <li>NBC 2020 &mdash; Load Combinations</li>
        </ul>
      </div>
    </div>
  );
}
