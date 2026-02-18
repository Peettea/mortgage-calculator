import React, { useMemo } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import type { AmortizationEntry } from '../types/mortgage';

interface AmortizationChartsProps {
    schedule: AmortizationEntry[];
}

/**
 * Formátování částky pro tooltip a osy
 */
const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)} M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)} tis.`;
    }
    return `${value} Kč`;
};

/**
 * Custom tooltip pro grafy
 */
const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="chart-tooltip">
            <p className="chart-tooltip-title">Měsíc {label}</p>
            {payload.map((entry: any, index: number) => (
                <p key={index} style={{ color: entry.color }}>
                    {entry.name}: {new Intl.NumberFormat('cs-CZ', {
                        style: 'currency',
                        currency: 'CZK',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                    }).format(entry.value)}
                </p>
            ))}
        </div>
    );
};

/**
 * Komponenta pro zobrazení grafů splácení
 *
 * Obsahuje dva grafy:
 * 1. Vývoj zůstatku úvěru v čase
 * 2. Podíl jistiny a úroku na každé splátce
 */
export const AmortizationCharts: React.FC<AmortizationChartsProps> = ({ schedule }) => {
    // Agregace dat po rocích pro přehlednější grafy u dlouhých úvěrů
    const yearlyData = useMemo(() => {
        const years = new Map<number, {
            year: number;
            principalPayment: number;
            interestPayment: number;
            remainingBalance: number;
        }>();

        schedule.forEach(entry => {
            const existing = years.get(entry.year);
            if (existing) {
                existing.principalPayment += entry.principalPayment;
                existing.interestPayment += entry.interestPayment;
                existing.remainingBalance = entry.remainingBalance; // poslední měsíc v roce
            } else {
                years.set(entry.year, {
                    year: entry.year,
                    principalPayment: entry.principalPayment,
                    interestPayment: entry.interestPayment,
                    remainingBalance: entry.remainingBalance,
                });
            }
        });

        return Array.from(years.values());
    }, [schedule]);

    // Data pro graf podílu jistiny a úroku (po rocích)
    const paymentBreakdownData = useMemo(() => {
        return yearlyData.map(entry => ({
            name: `${entry.year}. rok`,
            year: entry.year,
            jistina: Math.round(entry.principalPayment),
            úrok: Math.round(entry.interestPayment),
        }));
    }, [yearlyData]);

    // Data pro graf vývoje zůstatku
    const balanceData = useMemo(() => {
        return yearlyData.map(entry => ({
            name: `${entry.year}. rok`,
            year: entry.year,
            zůstatek: entry.remainingBalance,
            splaceno: schedule[0]?.remainingBalance
                ? (schedule[0].remainingBalance + schedule[0].principalPayment) - entry.remainingBalance
                : 0,
        }));
    }, [yearlyData, schedule]);

    return (
        <div className="charts-section">
            <h2>📈 Průběh splácení</h2>

            {/* Graf 1: Vývoj zůstatku */}
            <div className="chart-container">
                <h3>Vývoj zůstatku úvěru</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={balanceData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#667eea" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis
                            dataKey="year"
                            tickFormatter={(v) => `${v}. rok`}
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                            width={65}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '0.85rem', paddingTop: '0.5rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="zůstatek"
                            name="Zbývající dluh"
                            stroke="#667eea"
                            fill="url(#colorBalance)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="splaceno"
                            name="Splacená jistina"
                            stroke="#16a34a"
                            fill="url(#colorPaid)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Graf 2: Podíl jistiny a úroku */}
            <div className="chart-container">
                <h3>Podíl jistiny a úroku na ročních splátách</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={paymentBreakdownData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2} />
                            </linearGradient>
                            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                        <XAxis
                            dataKey="year"
                            tickFormatter={(v) => `${v}. rok`}
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tick={{ fontSize: 12 }}
                            stroke="#94a3b8"
                            width={65}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '0.85rem', paddingTop: '0.5rem' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="jistina"
                            name="Jistina"
                            stroke="#2563eb"
                            fill="url(#colorPrincipal)"
                            strokeWidth={2}
                            stackId="1"
                        />
                        <Area
                            type="monotone"
                            dataKey="úrok"
                            name="Úrok"
                            stroke="#f59e0b"
                            fill="url(#colorInterest)"
                            strokeWidth={2}
                            stackId="1"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
