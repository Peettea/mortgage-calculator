/**
 * Stránka "O aplikaci" — informace o projektu (route "/about")
 */
export const AboutPage = () => {
  return (
    <div className="calculator fade-in">
      <div className="calculator-header">
        <h1>O aplikaci</h1>
      </div>

      <div className="about-content">
        <section className="about-section">
          <h2>Hypoteční kalkulačka</h2>
          <p>
            Jednoduchá kalkulačka pro výpočet měsíčních splátek hypotéky.
            Zadejte výši úvěru, úrokovou sazbu a dobu splácení — kalkulačka
            okamžitě vypočítá měsíční splátku, celkové náklady a zobrazí
            podrobný amortizační plán.
          </p>
        </section>

        <section className="about-section">
          <h2>Technologie</h2>
          <div className="tech-grid">
            <div className="tech-card">
              <strong>React 19</strong>
              <span>UI framework</span>
            </div>
            <div className="tech-card">
              <strong>TypeScript</strong>
              <span>Typová bezpečnost</span>
            </div>
            <div className="tech-card">
              <strong>Vite</strong>
              <span>Build tool</span>
            </div>
            <div className="tech-card">
              <strong>React Hook Form</strong>
              <span>Správa formulářů</span>
            </div>
            <div className="tech-card">
              <strong>Zod</strong>
              <span>Validace dat</span>
            </div>
            <div className="tech-card">
              <strong>Recharts</strong>
              <span>Grafy a vizualizace</span>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Autor</h2>
          <p>
            Vytvořeno jako učební projekt pro pochopení moderního React vývoje.
          </p>
        </section>
      </div>
    </div>
  );
};
