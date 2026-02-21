import { useState, useMemo } from 'react';
import type { MortgageInputs, MortgageResults, FixationSettings } from '../types/mortgage';
import { calculateFixation } from '../utils/mortgageCalculations';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FixationSimulationProps {
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

export const FixationSimulation: React.FC<FixationSimulationProps> = ({ inputs }) => {
  const [expanded, setExpanded] = useState(false);
  const [fixation, setFixation] = useState<FixationSettings>({
    fixationYears: 5,
    newRateAfter: inputs.interestRate + 1.5,
    refinanceRate: inputs.interestRate + 0.5,
  });

  const scenarios = useMemo(
    () => calculateFixation(inputs, fixation),
    [inputs, fixation]
  );

  if (!expanded) {
    return (
      <button className="extra-payments-toggle" onClick={() => setExpanded(true)}>
        + Simulace fixace sazby a refinancování
      </button>
    );
  }

  const chartData = scenarios.map((s) => ({
    name: s.label.length > 30 ? s.label.substring(0, 28) + '...' : s.label,
    'Celkem úroky': s.totalInterest,
    color: s.color,
  }));

  return (
    <div className="fixation-section">
      <div className="extra-payments-header">
        <h2>Fixace sazby a refinancování</h2>
        <button className="scenario-remove" onClick={() => setExpanded(false)}>✕</button>
      </div>

      <div className="fixation-inputs">
        <div className="scenario-field">
          <label>Délka fixace</label>
          <div className="scenario-input-wrapper">
            <select
              value={fixation.fixationYears}
              onChange={(e) => setFixation({ ...fixation, fixationYears: parseInt(e.target.value) })}
              className="fixation-select"
            >
              <option value={1}>1 rok</option>
              <option value={3}>3 roky</option>
              <option value={5}>5 let</option>
              <option value={7}>7 let</option>
              <option value={10}>10 let</option>
            </select>
          </div>
        </div>

        <div className="scenario-field">
          <label>Sazba po fixaci (odhad)</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={fixation.newRateAfter}
              onChange={(e) => setFixation({ ...fixation, newRateAfter: parseFloat(e.target.value) || 0 })}
              step={0.1}
              min={0}
              max={30}
            />
            <span className="suffix">%</span>
          </div>
        </div>

        <div className="scenario-field">
          <label>Sazba u jiné banky (refinancování)</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={fixation.refinanceRate}
              onChange={(e) => setFixation({ ...fixation, refinanceRate: parseFloat(e.target.value) || 0 })}
              step={0.1}
              min={0}
              max={30}
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      <div className="fixation-results">
        {scenarios.map((s, i) => (
          <div key={i} className="fixation-card" style={{ borderLeftColor: s.color }}>
            <div className="fixation-card-label" style={{ color: s.color }}>{s.label}</div>
            <div className="fixation-card-stats">
              <div>
                <span className="savings-label">Splátka před fixací</span>
                <span className="savings-value">{fmt(s.monthlyPaymentBefore)}</span>
              </div>
              <div>
                <span className="savings-label">Splátka po fixaci</span>
                <span className="savings-value">{fmt(s.monthlyPaymentAfter)}</span>
              </div>
              <div>
                <span className="savings-label">Celkem úroky</span>
                <span className="savings-value">{fmt(s.totalInterest)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="extra-payments-chart">
        <h3>Porovnání celkových úroků</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(value) => fmt(Number(value))} />
            <Bar dataKey="Celkem úroky" radius={[0, 6, 6, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
