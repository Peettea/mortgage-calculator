import { useState, useMemo } from 'react';
import type { MortgageInputs, MortgageResults } from '../types/mortgage';
import { generateAmortizationSchedule } from '../utils/mortgageCalculations';

interface TaxDeductionProps {
  inputs: MortgageInputs;
  results: MortgageResults;
}

const MAX_DEDUCTION = 150000; // max odpočet úroků ročně v ČR
const TAX_RATE = 0.15; // sazba daně z příjmu 15%

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const TaxDeduction: React.FC<TaxDeductionProps> = ({ inputs, results }) => {
  const [expanded, setExpanded] = useState(false);

  const deduction = useMemo(() => {
    const schedule = generateAmortizationSchedule(inputs, results.monthlyPayment);

    // Seskupit úroky po rocích
    const yearlyInterest: Record<number, number> = {};
    for (const entry of schedule) {
      yearlyInterest[entry.year] = (yearlyInterest[entry.year] || 0) + entry.interestPayment;
    }

    const years = Object.entries(yearlyInterest).map(([year, interest]) => {
      const deductible = Math.min(interest, MAX_DEDUCTION);
      const taxSaved = Math.round(deductible * TAX_RATE);
      return {
        year: Number(year),
        interest: Math.round(interest),
        deductible: Math.round(deductible),
        taxSaved,
      };
    });

    const totalTaxSaved = years.reduce((sum, y) => sum + y.taxSaved, 0);
    const effectiveRate = ((results.totalInterestPaid - totalTaxSaved) / results.totalAmountPaid) * 100;

    return { years, totalTaxSaved, effectiveRate };
  }, [inputs, results]);

  if (!expanded) {
    return (
      <button className="extra-payments-toggle" onClick={() => setExpanded(true)}>
        + Daňový odpočet úroků
      </button>
    );
  }

  const first5Years = deduction.years.slice(0, 5);

  return (
    <div className="tax-section">
      <div className="extra-payments-header">
        <h2>Daňový odpočet úroků</h2>
        <button className="scenario-remove" onClick={() => setExpanded(false)}>✕</button>
      </div>

      <p className="tax-info">
        V ČR si můžeš odečíst zaplacené úroky z hypotéky od základu daně
        (max {fmt(MAX_DEDUCTION)}/rok). Při sazbě {TAX_RATE * 100}% ti stát vrátí:
      </p>

      <div className="savings-cards">
        <div className="savings-card positive">
          <span className="savings-label">Celková úspora na dani</span>
          <span className="savings-value">{fmt(deduction.totalTaxSaved)}</span>
        </div>
        <div className="savings-card">
          <span className="savings-label">Efektivní úroková sazba</span>
          <span className="savings-value">{deduction.effectiveRate.toFixed(2)} %</span>
        </div>
      </div>

      <div className="tax-table-wrapper">
        <h3>Prvních 5 let</h3>
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Rok</th>
              <th>Zaplacené úroky</th>
              <th>Odpočet (max {fmt(MAX_DEDUCTION)})</th>
              <th>Úspora na dani</th>
            </tr>
          </thead>
          <tbody>
            {first5Years.map((y) => (
              <tr key={y.year}>
                <td>{y.year}.</td>
                <td>{fmt(y.interest)}</td>
                <td>{fmt(y.deductible)}</td>
                <td style={{ color: 'var(--success-color)', fontWeight: 600 }}>{fmt(y.taxSaved)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
