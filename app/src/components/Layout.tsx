import { NavLink, Outlet } from 'react-router';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <h1>StructCalc</h1>
            <span className="tagline">Structural Analysis</span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>

        <div className="nav-section">
          <h3>Steel Design</h3>
          <ul>
            <NavLink to="/steel/beam-design" className={({ isActive }) => isActive ? 'active' : ''}>
              <li>
                <span className="nav-icon">⊢</span>
                Beam Design
              </li>
            </NavLink>
            <NavLink to="/steel/section-browser" className={({ isActive }) => isActive ? 'active' : ''}>
              <li>
                <span className="nav-icon">▤</span>
                Section Browser
              </li>
            </NavLink>
          </ul>
        </div>

        <div className="nav-section">
          <h3>Coming Soon</h3>
          <ul className="disabled">
            <li>
              <span className="nav-icon">⊡</span>
              Column Design
            </li>
            <li>
              <span className="nav-icon">⊞</span>
              Connections
            </li>
          </ul>
        </div>

        <div className="sidebar-footer">
          <p>CISC Standards</p>
          <p className="version">CSA S16-19</p>
        </div>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
