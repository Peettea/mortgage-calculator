import type { MortgageInputs } from '../types/mortgage';

interface ScenarioCardProps {
  name: string;
  color: string;
  inputs: MortgageInputs;
  onChange: (inputs: MortgageInputs) => void;
  onRemove?: () => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  name,
  color,
  inputs,
  onChange,
  onRemove,
}) => {
  const update = (field: keyof MortgageInputs, value: number) => {
    onChange({ ...inputs, [field]: value });
  };

  return (
    <div className="scenario-card" style={{ borderTopColor: color }}>
      <div className="scenario-header">
        <span className="scenario-name" style={{ color }}>{name}</span>
        {onRemove && (
          <button className="scenario-remove" onClick={onRemove} title="Odebrat">
            ✕
          </button>
        )}
      </div>

      <div className="scenario-field">
        <label>Výše úvěru</label>
        <div className="scenario-input-wrapper">
          <input
            type="number"
            value={inputs.loanAmount}
            onChange={(e) => update('loanAmount', parseFloat(e.target.value) || 0)}
            step={100000}
          />
          <span className="suffix">Kč</span>
        </div>
      </div>

      <div className="scenario-field">
        <label>Úroková sazba</label>
        <div className="scenario-input-wrapper">
          <input
            type="number"
            value={inputs.interestRate}
            onChange={(e) => update('interestRate', parseFloat(e.target.value) || 0)}
            step={0.1}
            min={0}
            max={100}
          />
          <span className="suffix">%</span>
        </div>
      </div>

      <div className="scenario-field">
        <label>Doba splácení</label>
        <div className="scenario-input-wrapper">
          <input
            type="number"
            value={inputs.loanPeriodYears}
            onChange={(e) => update('loanPeriodYears', parseFloat(e.target.value) || 0)}
            step={1}
            min={1}
            max={50}
          />
          <span className="suffix">let</span>
        </div>
      </div>
    </div>
  );
};
