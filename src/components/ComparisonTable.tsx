import type { MortgageInputs, MortgageResults } from '../types/mortgage';

interface ComparisonTableProps {
  scenarios: MortgageInputs[];
  results: MortgageResults[];
  names: string[];
  colors: string[];
  cheapestIndex: number;
}

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const ComparisonTable: React.FC<ComparisonTableProps> = ({
  scenarios,
  results,
  names,
  colors,
  cheapestIndex,
}) => {
  return (
    <div className="comparison-table-wrapper">
      <h2>Srovnání výsledků</h2>
      <table className="comparison-table">
        <thead>
          <tr>
            <th></th>
            {names.slice(0, scenarios.length).map((name, i) => (
              <th key={i} style={{ color: colors[i] }}>
                {name}
                {i === cheapestIndex && <span className="cheapest-badge">Nejlevnější</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="row-label">Výše úvěru</td>
            {scenarios.map((s, i) => (
              <td key={i}>{fmt(s.loanAmount)}</td>
            ))}
          </tr>
          <tr>
            <td className="row-label">Úroková sazba</td>
            {scenarios.map((s, i) => (
              <td key={i}>{s.interestRate} %</td>
            ))}
          </tr>
          <tr>
            <td className="row-label">Doba splácení</td>
            {scenarios.map((s, i) => (
              <td key={i}>{s.loanPeriodYears} let</td>
            ))}
          </tr>
          <tr className="highlight-row">
            <td className="row-label">Měsíční splátka</td>
            {results.map((r, i) => (
              <td key={i} style={{ color: colors[i], fontWeight: 700 }}>
                {fmt(r.monthlyPayment)}
              </td>
            ))}
          </tr>
          <tr>
            <td className="row-label">Celkem zaplaceno</td>
            {results.map((r, i) => (
              <td key={i}>{fmt(r.totalAmountPaid)}</td>
            ))}
          </tr>
          <tr>
            <td className="row-label">Z toho úroky</td>
            {results.map((r, i) => (
              <td key={i}>{fmt(r.totalInterestPaid)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
