import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';
import type { MortgageResults, MortgageInputs } from '../types/mortgage';

interface CostPieChartProps {
    results: MortgageResults;
    inputs: MortgageInputs;
}

const COLORS = ['#6366f1', '#fbbf24'];

/**
 * Formátování měny pro tooltip
 */
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('cs-CZ', {
        style: 'currency',
        currency: 'CZK',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

/**
 * Custom tooltip
 */
const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || payload.length === 0) return null;
    const { name, value } = payload[0];
    return (
        <div className="chart-tooltip">
            <p style={{ color: payload[0].payload.fill, fontWeight: 600 }}>
                {name}: {formatCurrency(value)}
            </p>
        </div>
    );
};

/**
 * Custom label na segmentech koláčového grafu
 */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontWeight={700} fontSize={14}>
            {`${(percent * 100).toFixed(1)}%`}
        </text>
    );
};

/**
 * Koláčový graf - podíl jistiny a úroků na celkové ceně
 */
export const CostPieChart: React.FC<CostPieChartProps> = ({ results, inputs }) => {
    const data = [
        { name: 'Jistina', value: inputs.loanAmount },
        { name: 'Úroky', value: results.totalInterestPaid },
    ];

    const overpaymentPercent = ((results.totalInterestPaid / inputs.loanAmount) * 100).toFixed(1);

    return (
        <div className="chart-container pie-chart-container">
            <h3>Celkové náklady úvěru</h3>
            <div className="pie-chart-layout">
                <div className="pie-chart-wrapper">
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                innerRadius={45}
                                dataKey="value"
                                strokeWidth={2}
                                stroke="rgba(255,255,255,0.3)"
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomPieTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '0.85rem' }}
                                formatter={(value: string) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="pie-stats">
                    <div className="stat-card">
                        <span className="stat-label">Přeplatek</span>
                        <span className="stat-value accent">{overpaymentPercent} %</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Celkem zaplatíte</span>
                        <span className="stat-value">{formatCurrency(results.totalAmountPaid)}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Z toho úroky</span>
                        <span className="stat-value warning">{formatCurrency(results.totalInterestPaid)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
