import { useState, useMemo } from 'react';
import type { MortgageInputs, MortgageResults, ExtraPaymentSettings } from '../types/mortgage';
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
  const [expanded, setExpanded] = useState(false);
  const [extra, setExtra] = useState<ExtraPaymentSettings>({
    monthlyExtra: 0,
    oneTimeAmount: 0,
    oneTimeMonth: 12,
  });

  const comparison = useMemo(() => {
    if (extra.monthlyExtra === 0 && extra.oneTimeAmount === 0) return null;
    return calculateWithExtraPayments(inputs, results.monthlyPayment, extra);
  }, [inputs, results, extra]);

  if (!expanded) {
    return (
      <button className="extra-payments-toggle" onClick={() => setExpanded(true)}>
        + Simulace mimořádných splátek
      </button>
    );
  }

  const totalMonths = inputs.loanPeriodYears * 12;

  const chartData = comparison
    ? [
        {
          name: 'Bez mimořádné',
          'Úroky': results.totalInterestPaid,
          color: '#94a3b8',
        },
        {
          name: 'S mimořádnou',
          'Úroky': comparison.withExtra.totalInterest,
          color: '#27ae60',
        },
      ]
    : [];

  return (
    <div className="extra-payments-section">
      <div className="extra-payments-header">
        <h2>Mimořádné splátky</h2>
        <button className="scenario-remove" onClick={() => setExpanded(false)}>✕</button>
      </div>

      <div className="extra-payments-inputs">
        <div className="scenario-field">
          <label>Pravidelná měsíční mimořádná splátka</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={extra.monthlyExtra}
              onChange={(e) => setExtra({ ...extra, monthlyExtra: parseFloat(e.target.value) || 0 })}
              step={1000}
              min={0}
            />
            <span className="suffix">Kč</span>
          </div>
        </div>

        <div className="scenario-field">
          <label>Jednorázová mimořádná splátka</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={extra.oneTimeAmount}
              onChange={(e) => setExtra({ ...extra, oneTimeAmount: parseFloat(e.target.value) || 0 })}
              step={10000}
              min={0}
            />
            <span className="suffix">Kč</span>
          </div>
        </div>

        {extra.oneTimeAmount > 0 && (
          <div className="scenario-field">
            <label>Ve kterém měsíci (od začátku hypotéky)</label>
            <div className="scenario-input-wrapper">
              <input
                type="number"
                value={extra.oneTimeMonth}
                onChange={(e) => setExtra({ ...extra, oneTimeMonth: parseInt(e.target.value) || 1 })}
                step={1}
                min={1}
                max={totalMonths}
              />
              <span className="suffix">měsíc</span>
            </div>
          </div>
        )}
      </div>

      {comparison && (
        <div className="extra-payments-results">
          <div className="savings-cards">
            <div className="savings-card positive">
              <span className="savings-label">Ušetříte na úrocích</span>
              <span className="savings-value">{fmt(comparison.savings.interestSaved)}</span>
            </div>
            <div className="savings-card positive">
              <span className="savings-label">Splatíte dříve o</span>
              <span className="savings-value">
                {Math.floor(comparison.savings.monthsSaved / 12)} let{' '}
                {comparison.savings.monthsSaved % 12} měsíců
              </span>
            </div>
            <div className="savings-card">
              <span className="savings-label">Nová doba splácení</span>
              <span className="savings-value">
                {Math.floor(comparison.withExtra.totalMonths / 12)} let{' '}
                {comparison.withExtra.totalMonths % 12} měsíců
              </span>
            </div>
          </div>

          <div className="extra-payments-chart">
            <h3>Porovnání celkových úroků</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip formatter={(value) => fmt(Number(value))} />
                <Bar dataKey="Úroky" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
