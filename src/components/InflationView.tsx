import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { MortgageResults } from '../types/mortgage';

interface InflationViewProps {
  results: MortgageResults;
  loanPeriodYears: number;
}

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const InflationView: React.FC<InflationViewProps> = ({ results, loanPeriodYears }) => {
  const [expanded, setExpanded] = useState(false);
  const [inflationRate, setInflationRate] = useState(3);

  const data = useMemo(() => {
    const points = [];
    for (let year = 0; year <= loanPeriodYears; year++) {
      const realValue = results.monthlyPayment / Math.pow(1 + inflationRate / 100, year);
      points.push({
        year,
        'Nominální splátka': Math.round(results.monthlyPayment),
        'Reálná hodnota': Math.round(realValue),
      });
    }
    return points;
  }, [results.monthlyPayment, loanPeriodYears, inflationRate]);

  const lastReal = data[data.length - 1]['Reálná hodnota'];
  const purchasingPowerLoss = Math.round(100 - (lastReal / results.monthlyPayment) * 100);

  if (!expanded) {
    return (
      <button className="extra-payments-toggle" onClick={() => setExpanded(true)}>
        + Inflační pohled
      </button>
    );
  }

  return (
    <div className="inflation-section">
      <div className="extra-payments-header">
        <h2>Inflační pohled</h2>
        <button className="scenario-remove" onClick={() => setExpanded(false)}>✕</button>
      </div>

      <div className="inflation-controls">
        <div className="scenario-field">
          <label>Průměrná roční inflace</label>
          <div className="scenario-input-wrapper">
            <input
              type="number"
              value={inflationRate}
              onChange={(e) => setInflationRate(parseFloat(e.target.value) || 0)}
              step={0.5}
              min={0}
              max={20}
            />
            <span className="suffix">%</span>
          </div>
        </div>
      </div>

      <div className="savings-cards">
        <div className="savings-card">
          <span className="savings-label">Splátka dnes</span>
          <span className="savings-value">{fmt(results.monthlyPayment)}</span>
        </div>
        <div className="savings-card">
          <span className="savings-label">Reálná hodnota za {loanPeriodYears} let</span>
          <span className="savings-value">{fmt(lastReal)}</span>
        </div>
        <div className="savings-card positive">
          <span className="savings-label">Pokles kupní síly</span>
          <span className="savings-value">{purchasingPowerLoss} %</span>
        </div>
      </div>

      <p className="tax-info">
        Splátka zůstává stejná, ale díky inflaci se v čase stává relativně levnější.
        Za {loanPeriodYears} let bude mít splátka {fmt(results.monthlyPayment)} kupní sílu
        jako dnešních {fmt(lastReal)}.
      </p>

      <div className="inflation-chart">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="year" label={{ value: 'Rok', position: 'bottom', offset: -5 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value) => fmt(Number(value))} />
            <Line
              type="monotone"
              dataKey="Nominální splátka"
              stroke="#4a90d9"
              strokeWidth={2}
              dot={false}
              strokeDasharray="8 4"
            />
            <Line
              type="monotone"
              dataKey="Reálná hodnota"
              stroke="#e67e22"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
