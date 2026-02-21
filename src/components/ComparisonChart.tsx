import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { MortgageResults } from '../types/mortgage';

interface ComparisonChartProps {
  results: MortgageResults[];
  names: string[];
  colors: string[];
}

const formatCZK = (value: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: 'CZK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  results,
  names,
  colors,
}) => {
  const chartData = results.map((r, i) => ({
    name: names[i],
    'Měsíční splátka': r.monthlyPayment,
    'Celkem úroky': r.totalInterestPaid,
    'Celkem zaplaceno': r.totalAmountPaid,
    color: colors[i],
  }));

  return (
    <div className="comparison-charts">
      <h2>Vizuální srovnání</h2>

      <div className="chart-row">
        <div className="chart-container">
          <h3>Měsíční splátka</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCZK(Number(value))} />
              <Bar dataKey="Měsíční splátka" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Celkem zaplacené úroky</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(value) => formatCZK(Number(value))} />
              <Bar dataKey="Celkem úroky" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
