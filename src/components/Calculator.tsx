import { useState, useEffect } from 'react';
import { InputField } from './InputField';
import { ResultsDisplay } from './ResultsDisplay';
import { AmortizationCharts } from './AmortizationCharts';
import { CostPieChart } from './CostPieChart';
import { useMortgage } from '../hooks/useMortgage';

/**
 * Hlavní komponenta kalkulačky
 *
 * Díky custom hooku useMortgage obsahuje jen UI logiku.
 * Veškeré výpočty a state management jsou v hooku.
 */
export const Calculator = () => {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mortgage-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('mortgage-dark-mode', String(darkMode));
  }, [darkMode]);

  // Veškerá logika kalkulačky je teď v hooku
  const {
    inputs,
    results,
    errors,
    amortizationSchedule,
    updateLoanAmount,
    updateInterestRate,
    updateLoanPeriod,
  } = useMortgage();

  return (
    <div className="calculator fade-in">
      <div className="calculator-header">
        <h1>💰 Hypoteční kalkulačka</h1>
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Přepnout na světlý režim' : 'Přepnout na tmavý režim'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="calculator-content">
        <div className="inputs-section">
          <InputField
            label="Výše úvěru"
            value={inputs.loanAmount}
            onChange={updateLoanAmount}
            error={errors.loanAmount}
            suffix="Kč"
            step={100000}
            sliderMin={100000}
            sliderMax={15000000}
            sliderStep={100000}
          />

          <InputField
            label="Úroková sazba"
            value={inputs.interestRate}
            onChange={updateInterestRate}
            error={errors.interestRate}
            suffix="%"
            step={0.1}
            min={0}
            max={100}
            sliderMin={0}
            sliderMax={15}
            sliderStep={0.1}
          />

          <InputField
            label="Doba splácení"
            value={inputs.loanPeriodYears}
            onChange={updateLoanPeriod}
            error={errors.loanPeriodYears}
            suffix="let"
            step={1}
            min={1}
            max={50}
            sliderMin={1}
            sliderMax={40}
            sliderStep={1}
          />
        </div>

        <ResultsDisplay results={results} schedule={amortizationSchedule} />
      </div>

      {results && (
        <CostPieChart results={results} inputs={inputs} />
      )}

      {results && amortizationSchedule.length > 0 && (
        <AmortizationCharts schedule={amortizationSchedule} />
      )}
    </div>
  );
};
