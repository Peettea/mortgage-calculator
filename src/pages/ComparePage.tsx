import { useState, useMemo } from 'react';
import { ScenarioCard } from '../components/ScenarioCard';
import { ComparisonTable } from '../components/ComparisonTable';
import { ComparisonChart } from '../components/ComparisonChart';
import { calculateMortgage } from '../utils/mortgageCalculations';
import type { MortgageInputs } from '../types/mortgage';

const SCENARIO_COLORS = ['#4a90d9', '#27ae60', '#e67e22'];
const SCENARIO_NAMES = ['Scénář A', 'Scénář B', 'Scénář C'];

const defaultScenario = (): MortgageInputs => ({
  loanAmount: 3000000,
  interestRate: 4.5,
  loanPeriodYears: 25,
});

export const ComparePage = () => {
  const [scenarios, setScenarios] = useState<MortgageInputs[]>([
    defaultScenario(),
    { loanAmount: 3000000, interestRate: 5.0, loanPeriodYears: 20 },
  ]);

  const results = useMemo(
    () => scenarios.map((s) => calculateMortgage(s)),
    [scenarios]
  );

  const updateScenario = (index: number, updated: MortgageInputs) => {
    setScenarios((prev) => prev.map((s, i) => (i === index ? updated : s)));
  };

  const addScenario = () => {
    if (scenarios.length < 3) {
      setScenarios((prev) => [...prev, defaultScenario()]);
    }
  };

  const removeScenario = (index: number) => {
    if (scenarios.length > 2) {
      setScenarios((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const cheapestIndex = results.reduce(
    (minIdx, r, i, arr) =>
      r.totalAmountPaid < arr[minIdx].totalAmountPaid ? i : minIdx,
    0
  );

  return (
    <div className="calculator fade-in">
      <div className="calculator-header">
        <h1>Srovnání hypoték</h1>
      </div>

      <div className="scenarios-grid">
        {scenarios.map((scenario, i) => (
          <ScenarioCard
            key={i}
            name={SCENARIO_NAMES[i]}
            color={SCENARIO_COLORS[i]}
            inputs={scenario}
            onChange={(updated) => updateScenario(i, updated)}
            onRemove={scenarios.length > 2 ? () => removeScenario(i) : undefined}
          />
        ))}
        {scenarios.length < 3 && (
          <button className="add-scenario-btn" onClick={addScenario}>
            + Přidat scénář
          </button>
        )}
      </div>

      <ComparisonTable
        scenarios={scenarios}
        results={results}
        names={SCENARIO_NAMES}
        colors={SCENARIO_COLORS}
        cheapestIndex={cheapestIndex}
      />

      <ComparisonChart
        results={results}
        names={SCENARIO_NAMES.slice(0, scenarios.length)}
        colors={SCENARIO_COLORS.slice(0, scenarios.length)}
      />
    </div>
  );
};
