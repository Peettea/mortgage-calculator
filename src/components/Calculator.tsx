import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { InputField } from './InputField';
import { ResultsDisplay } from './ResultsDisplay';
import { AmortizationCharts } from './AmortizationCharts';
import { CostPieChart } from './CostPieChart';
import { useMortgage } from '../hooks/useMortgage';

/**
 * Hlavní komponenta kalkulačky
 *
 * Používá React Hook Form přes Controller komponentu,
 * která propojuje formulářovou logiku s našimi InputField komponentami.
 */
export const Calculator = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('mortgage-dark-mode');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('mortgage-dark-mode', String(darkMode));
  }, [darkMode]);

  const { form, inputs, results, amortizationSchedule } = useMortgage();

  return (
    <div className="calculator fade-in">
      <div className="calculator-header">
        <h1>Hypoteční kalkulačka</h1>
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
          <Controller
            name="loanAmount"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                label="Výše úvěru"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                suffix="Kč"
                step={100000}
                sliderMin={100000}
                sliderMax={15000000}
                sliderStep={100000}
              />
            )}
          />

          <Controller
            name="interestRate"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                label="Úroková sazba"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                suffix="%"
                step={0.1}
                min={0}
                max={100}
                sliderMin={0}
                sliderMax={15}
                sliderStep={0.1}
              />
            )}
          />

          <Controller
            name="loanPeriodYears"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                label="Doba splácení"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                suffix="let"
                step={1}
                min={1}
                max={50}
                sliderMin={1}
                sliderMax={40}
                sliderStep={1}
              />
            )}
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
