import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { InputField } from './InputField';
import { ResultsDisplay } from './ResultsDisplay';
import { AmortizationCharts } from './AmortizationCharts';
import { CostPieChart } from './CostPieChart';
import { useMortgage } from '../hooks/useMortgage';
import { ExtraPayments } from './ExtraPayments';
import { FixationSimulation } from './FixationSimulation';
import { TaxDeduction } from './TaxDeduction';
import { InflationView } from './InflationView';
import { BankRates } from './BankRates';
import { saveCalculation } from '../api/calculations';
import { exportToPDF } from '../utils/pdfExport';

type AnalysisTab = 'banks' | 'extra' | 'fixation' | 'tax' | 'inflation';

const TABS: { id: AnalysisTab; label: string; icon: string }[] = [
  { id: 'banks', label: 'Sazby bank', icon: '🏦' },
  { id: 'extra', label: 'Mimořádné', icon: '💰' },
  { id: 'fixation', label: 'Fixace', icon: '📌' },
  { id: 'tax', label: 'Daně', icon: '📋' },
  { id: 'inflation', label: 'Inflace', icon: '📈' },
];

/**
 * Hlavní komponenta kalkulačky — dashboard layout
 *
 * 2-column layout: inputy + tabbed analysis vlevo, sticky výsledky vpravo.
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');
  const [activeTab, setActiveTab] = useState<AnalysisTab>('banks');

  const handleShare = () => {
    const params = new URLSearchParams({
      a: String(inputs.loanAmount),
      r: String(inputs.interestRate),
      y: String(inputs.loanPeriodYears),
    });
    const url = `${window.location.origin}/?${params}`;
    navigator.clipboard.writeText(url);
    setShareStatus('copied');
    setTimeout(() => setShareStatus('idle'), 2000);
  };

  const handleSave = async () => {
    if (!results) return;
    setSaveStatus('saving');
    try {
      await saveCalculation({
        loan_amount: inputs.loanAmount,
        interest_rate: inputs.interestRate,
        loan_period_years: inputs.loanPeriodYears,
        monthly_payment: results.monthlyPayment,
        total_paid: results.totalAmountPaid,
        total_interest: results.totalInterestPaid,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const renderAnalysisContent = () => {
    if (!results) return null;
    switch (activeTab) {
      case 'banks':
        return (
          <BankRates
            loanAmount={inputs.loanAmount}
            loanPeriodYears={inputs.loanPeriodYears}
            onSelectRate={(rate) => form.setValue('interestRate', rate)}
          />
        );
      case 'extra':
        return <ExtraPayments inputs={inputs} results={results} />;
      case 'fixation':
        return <FixationSimulation inputs={inputs} results={results} />;
      case 'tax':
        return <TaxDeduction inputs={inputs} results={results} />;
      case 'inflation':
        return <InflationView results={results} loanPeriodYears={inputs.loanPeriodYears} />;
    }
  };

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

      {/* === DASHBOARD: 2-column layout === */}
      <div className="dashboard-layout">
        {/* LEFT COLUMN: Inputs + Actions */}
        <div className="dashboard-left">
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

          {results && (
            <div className="action-buttons">
              <button
                className="save-button"
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'idle' && '💾 Uložit'}
                {saveStatus === 'saving' && 'Ukládání...'}
                {saveStatus === 'saved' && '✓ Uloženo!'}
                {saveStatus === 'error' && '✗ Chyba'}
              </button>
              <button
                className="save-button pdf-button"
                onClick={() => exportToPDF(inputs, results)}
              >
                📄 PDF
              </button>
              <button
                className="save-button share-button"
                onClick={handleShare}
              >
                {shareStatus === 'idle' ? '🔗 Sdílet' : '✓ Zkopírováno!'}
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Sticky Results + Pie Chart */}
        <div className="dashboard-right">
          <div className="sticky-results">
            <ResultsDisplay results={results} schedule={amortizationSchedule} />

            {results && (
              <CostPieChart results={results} inputs={inputs} />
            )}
          </div>
        </div>
      </div>

      {/* === TABBED ANALYSIS PANEL === */}
      {results && (
        <div className="analysis-panel">
          <div className="analysis-tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`analysis-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>
          <div className="analysis-content">
            {renderAnalysisContent()}
          </div>
        </div>
      )}

      {/* === AMORTIZATION CHARTS (full-width) === */}
      {results && amortizationSchedule.length > 0 && (
        <AmortizationCharts schedule={amortizationSchedule} />
      )}
    </div>
  );
};
