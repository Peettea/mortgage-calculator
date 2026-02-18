import { useState, useEffect, useMemo } from 'react';
import { InputField } from './InputField';
import { ResultsDisplay } from './ResultsDisplay';
import { AmortizationCharts } from './AmortizationCharts';
import { CostPieChart } from './CostPieChart';
import { calculateMortgage, validateInputs, generateAmortizationSchedule } from '../utils/mortgageCalculations';
import type { MortgageInputs, MortgageResults, ValidationErrors } from '../types/mortgage';

/**
 * Hlavní komponenta kalkulačky
 *
 * Vylepšení v2:
 * - Dark mode přepínač
 * - Koláčový graf celkových nákladů
 * - Slidery u inputů
 * - Extra statistiky
 */
export const Calculator = () => {
  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    // Inicializace z localStorage nebo z systémového nastavení
    const saved = localStorage.getItem('mortgage-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Aplikace dark mode na document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('mortgage-dark-mode', String(darkMode));
  }, [darkMode]);

  // State pro vstupní hodnoty
  const [inputs, setInputs] = useState<MortgageInputs>({
    loanAmount: 3000000,
    interestRate: 4.5,
    loanPeriodYears: 25,
  });

  // State pro vypočítané výsledky
  const [results, setResults] = useState<MortgageResults | null>(null);

  // State pro validační chyby
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Automatický přepočet při změně vstupů
  useEffect(() => {
    const validationErrors = validateInputs(inputs);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const calculatedResults = calculateMortgage(inputs);
      setResults(calculatedResults);
    } else {
      setResults(null);
    }
  }, [inputs]);

  // Výpočet amortizačního plánu
  const amortizationSchedule = useMemo(() => {
    if (!results) return [];
    return generateAmortizationSchedule(inputs, results.monthlyPayment);
  }, [inputs, results]);

  // Update funkce
  const updateLoanAmount = (value: number) => {
    setInputs(prev => ({ ...prev, loanAmount: value }));
  };

  const updateInterestRate = (value: number) => {
    setInputs(prev => ({ ...prev, interestRate: value }));
  };

  const updateLoanPeriod = (value: number) => {
    setInputs(prev => ({ ...prev, loanPeriodYears: value }));
  };

  return (
    <div className="calculator fade-in">
      {/* Header s dark mode přepínačem */}
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
        {/* Levá strana - inputy */}
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

        {/* Pravá strana - výsledky */}
        <ResultsDisplay results={results} schedule={amortizationSchedule} />
      </div>

      {/* Koláčový graf celkových nákladů */}
      {results && (
        <CostPieChart results={results} inputs={inputs} />
      )}

      {/* Grafy splácení */}
      {results && amortizationSchedule.length > 0 && (
        <AmortizationCharts schedule={amortizationSchedule} />
      )}
    </div>
  );
};
