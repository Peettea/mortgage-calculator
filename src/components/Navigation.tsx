import { NavLink } from 'react-router-dom';

/**
 * Navigační lišta — glassmorphic design with icons.
 * NavLink automaticky přidává třídu "active" na aktuální stránku.
 */
export const Navigation = () => {
  return (
    <nav className="navigation">
      <NavLink to="/" end>
        <span className="nav-icon">📊</span>
        Kalkulačka
      </NavLink>
      <NavLink to="/compare">
        <span className="nav-icon">⚖️</span>
        Srovnání
      </NavLink>
      <NavLink to="/history">
        <span className="nav-icon">📋</span>
        Historie
      </NavLink>
    </nav>
  );
};
