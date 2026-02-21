import { NavLink } from 'react-router-dom';

/**
 * Navigační lišta — zobrazuje se na každé stránce.
 * NavLink automaticky přidává třídu "active" na aktuální stránku.
 */
export const Navigation = () => {
  return (
    <nav className="navigation">
      <NavLink to="/" end>
        Kalkulačka
      </NavLink>
      <NavLink to="/compare">
        Srovnání
      </NavLink>
      <NavLink to="/history">
        Historie
      </NavLink>
      <NavLink to="/about">
        O aplikaci
      </NavLink>
    </nav>
  );
};
