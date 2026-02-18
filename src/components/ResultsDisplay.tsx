import React from 'react';
import type { MortgageResults, AmortizationEntry } from '../types/mortgage';

// Props pro ResultsDisplay komponentu
interface ResultsDisplayProps {
  results: MortgageResults | null;
  schedule: AmortizationEntry[];
}

/**
 * Komponenta pro zobrazení vypočítaných výsledků s extra statistikami
 */
export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, schedule }) => {
  // Pokud ještě nejsou výsledky, zobrazíme placeholder
  if (!results) {
    return (
      <div className="results-placeholder">
        <p>📊</p>
        <p>Vyplňte údaje pro výpočet hypotéky</p>
      </div>
    );
  }

  // Pomocná funkce pro formátování částek v českých korunách
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Extra statistiky z prvního měsíce amortizace
  const firstMonth = schedule.length > 0 ? schedule[0] : null;

  return (
    <div className="results-display">
      <h2>Výsledky</h2>

      {/* Měsíční splátka - nejdůležitější */}
      <div className="result-item primary">
        <span className="label">Měsíční splátka:</span>
        <span className="value">{formatCurrency(results.monthlyPayment)}</span>
      </div>

      {/* Celková zaplacená částka */}
      <div className="result-item">
        <span className="label">Celková zaplacená částka:</span>
        <span className="value">{formatCurrency(results.totalAmountPaid)}</span>
      </div>

      {/* Celkové zaplacené úroky */}
      <div className="result-item">
        <span className="label">Celkové zaplacené úroky:</span>
        <span className="value interest">{formatCurrency(results.totalInterestPaid)}</span>
      </div>

      {/* Extra statistiky - rozpad 1. splátky */}
      {firstMonth && (
        <>
          <div className="result-divider"></div>
          <p className="result-subtitle">1. splátka se skládá z:</p>
          <div className="result-item mini">
            <span className="label">Jistina:</span>
            <span className="value">{formatCurrency(firstMonth.principalPayment)}</span>
          </div>
          <div className="result-item mini">
            <span className="label">Úrok:</span>
            <span className="value interest">{formatCurrency(firstMonth.interestPayment)}</span>
          </div>
        </>
      )}
    </div>
  );
};
