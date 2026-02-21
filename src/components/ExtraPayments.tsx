import { useState, useMemo } from 'react';
import type { MortgageInputs, MortgageResults } from '../types/mortgage';
import { calculateWithExtraPayments } from '../utils/mortgageCalculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ExtraPaymentsProps {
  inputs: MortgageInputs;
  results: MortgageResults;
}

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const ExtraPayments: React.FC<ExtraPaymentsProps> = ({ inputs, results }) => {
  const [monthlyExtra, setMonthlyExtra] = useState(2000);
  const [oneTimeAmount, setOneTimeAmount] = useState(200000);
  const [oneTimeMonth, setOneTimeMonth] = useState(12);

  const comparison = useMemo(() => {
    if (monthlyExtra <= 0 && oneTimeAmount <= 0) return null;
    return calculateWithExtraPayments(inputs, results.monthlyPayment, {
      monthlyExtra,
      oneTimeAmount,
      oneTimeMonth,
    });
  }, [inputs, results.monthlyPayment, monthlyExtra, oneTimeAmount, oneTimeMonth]);

  const chartData = comparison
    ? [
      {
        name: 'Bez mimořádné',
        'Úroky': results.totalInterestPaid,
        color: '#64748b',
      },
      {
        name: 'S mimořádnou',
        'Úroky': comparison.withExtra.totalInterest,
        color: '#34d399',
      },
    ]
    : [];

  return (
    <div className="extra-payments-section">
      <div className="extra-payments-inputs">
        <div className="scenario-field">
          <label>Pravidelná měsíční extra</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={monthlyExtra}
              onChange={(e) => setMonthlyExtra(parseFloat(e.target.value) || 0)}
              step={500}
              min={0}
            />
            <span className="suffix">Kč</span>
          </div>
        </div>

        <div className="scenario-field">
          <label>Jednorázová splátka</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={oneTimeAmount}
              onChange={(e) => setOneTimeAmount(parseFloat(e.target.value) || 0)}
              step={10000}
              min={0}
            />
            <span className="suffix">Kč</span>
          </div>
        </div>

        <div className="scenario-field">
          <label>Ve kterém měsíci</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={oneTimeMonth}
              onChange={(e) => setOneTimeMonth(parseInt(e.target.value) || 1)}
              step={1}
              min={1}
              max={inputs.loanPeriodYears * 12}
            />
            <span className="suffix">měsíc</span>
          </div>
        </div>
      </div>

      {comparison && (
        <>
          <div className="savings-cards">
            <div className="savings-card positive">
              <span className="savings-label">Ušetřené úroky</span>
              <span className="savings-value">{fmt(comparison.savings.interestSaved)}</span>
            </div>
            <div className="savings-card positive">
              <span className="savings-label">Ušetřený čas</span>
              <span className="savings-value">
                {Math.floor(comparison.savings.monthsSaved / 12)} let{' '}
                {comparison.savings.monthsSaved % 12} měs.
              </span>
            </div>
            <div className="savings-card">
              <span className="savings-label">Celkem zaplaceno</span>
              <span className="savings-value">{fmt(comparison.withExtra.totalPaid)}</span>
            </div>
          </div>

          <div className="extra-payments-chart">
            <h3>Porovnání úroků</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => fmt(Number(value))} />
                <Bar dataKey="Úroky" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};
