import { useState, useEffect } from 'react';
import { fetchCalculations, deleteCalculation, type SavedCalculation } from '../api/calculations';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Stránka s historií uložených výpočtů (route "/history")
 */
export const HistoryPage = () => {
  const [calculations, setCalculations] = useState<SavedCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCalculations();
      setCalculations(data);
    } catch {
      setError('Nepodařilo se načíst historii. Je server spuštěný?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCalculation(id);
      setCalculations(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Nepodařilo se smazat výpočet.');
    }
  };

  return (
    <div className="calculator fade-in">
      <div className="calculator-header">
        <h1>Historie výpočtů</h1>
      </div>

      {error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {loading ? (
        <p className="history-empty">Načítání...</p>
      ) : calculations.length === 0 ? (
        <p className="history-empty">
          Zatím žádné uložené výpočty. Použij kalkulačku a klikni "Uložit výpočet".
        </p>
      ) : (
        <div className="history-list">
          {calculations.map((calc) => (
            <div key={calc.id} className="history-card">
              <div className="history-card-header">
                <span className="history-date">{formatDate(calc.createdAt)}</span>
                <button
                  className="history-delete"
                  onClick={() => handleDelete(calc.id)}
                  title="Smazat"
                >
                  ✕
                </button>
              </div>
              <div className="history-card-body">
                <div className="history-stat">
                  <span className="history-label">Úvěr</span>
                  <span className="history-value">{formatCurrency(calc.loanAmount)}</span>
                </div>
                <div className="history-stat">
                  <span className="history-label">Sazba</span>
                  <span className="history-value">{calc.interestRate} %</span>
                </div>
                <div className="history-stat">
                  <span className="history-label">Doba</span>
                  <span className="history-value">{calc.loanPeriodYears} let</span>
                </div>
                <div className="history-stat primary">
                  <span className="history-label">Splátka</span>
                  <span className="history-value">{formatCurrency(calc.monthlyPayment)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
