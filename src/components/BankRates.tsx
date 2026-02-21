import { useState, useMemo } from 'react';
import { BANK_RATES, LAST_UPDATED, getUniqueFixations } from '../data/bankRates';
import { calculateMortgage } from '../utils/mortgageCalculations';

interface BankRatesProps {
  loanAmount: number;
  loanPeriodYears: number;
  onSelectRate: (rate: number) => void;
}

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const BankRates: React.FC<BankRatesProps> = ({ loanAmount, loanPeriodYears, onSelectRate }) => {
  const fixations = getUniqueFixations();
  const [selectedFixation, setSelectedFixation] = useState(5);

  const rates = useMemo(() => {
    return BANK_RATES
      .filter((r) => r.fixation === selectedFixation)
      .map((r) => {
        const result = calculateMortgage({ loanAmount, interestRate: r.rate, loanPeriodYears });
        return { ...r, monthlyPayment: result.monthlyPayment, totalInterest: result.totalInterestPaid };
      })
      .sort((a, b) => a.rate - b.rate);
  }, [selectedFixation, loanAmount, loanPeriodYears]);

  return (
    <div className="bank-rates-section">
      <p className="tax-info">
        Orientační sazby českých bank. Poslední aktualizace: {LAST_UPDATED}.
        Klikni na řádek pro použití sazby v kalkulačce.
      </p>

      <div className="fixation-tabs">
        {fixations.map((f) => (
          <button
            key={f}
            className={`fixation-tab ${selectedFixation === f ? 'active' : ''}`}
            onClick={() => setSelectedFixation(f)}
          >
            {f} {f === 1 ? 'rok' : f < 5 ? 'roky' : 'let'}
          </button>
        ))}
      </div>

      <table className="comparison-table bank-rates-table">
        <thead>
          <tr>
            <th>Banka</th>
            <th>Sazba</th>
            <th>Splátka</th>
            <th>Celkem úroky</th>
          </tr>
        </thead>
        <tbody>
          {rates.map((r, i) => (
            <tr
              key={`${r.bank}-${r.fixation}`}
              className={`bank-rate-row ${i === 0 ? 'best-rate' : ''}`}
              onClick={() => onSelectRate(r.rate)}
            >
              <td>
                {r.bank}
                {i === 0 && <span className="cheapest-badge">Nejlevnější</span>}
              </td>
              <td style={{ fontWeight: 700 }}>{r.rate} %</td>
              <td>{fmt(r.monthlyPayment)}</td>
              <td>{fmt(r.totalInterest)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
