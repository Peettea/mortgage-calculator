import React from 'react';

// Props pro InputField komponentu
interface InputFieldProps {
  label: string;              // Popisek pole (např. "Výše úvěru")
  value: number;              // Aktuální hodnota
  onChange: (value: number) => void;  // Callback volaný při změně
  error?: string;             // Chybová hláška (volitelná)
  suffix?: string;            // Jednotka za inputem (např. "Kč", "%")
  min?: number;               // Minimální hodnota
  max?: number;               // Maximální hodnota
  step?: number;              // Krok pro šipky nahoru/dolů
  sliderMin?: number;         // Minimální hodnota pro slider
  sliderMax?: number;         // Maximální hodnota pro slider
  sliderStep?: number;        // Krok pro slider
}

/**
 * Znovupoužitelný input komponent pro číselné hodnoty + slider
 *
 * Vylepšení:
 * - Range slider pod každým inputem
 * - Formátovaná zobrazená hodnota nad sliderem
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  error,
  suffix,
  min = 0,
  max,
  step = 1,
  sliderMin,
  sliderMax,
  sliderStep,
}) => {
  // Event handler pro změnu hodnoty v number inputu
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onChange(newValue);
  };

  // Event handler pro slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  // Výpočet pozice slideru v procentech (pro gradient fill)
  const sMin = sliderMin ?? min;
  const sMax = sliderMax ?? max ?? 100;
  const sStep = sliderStep ?? step;
  const sliderPercent = ((value - sMin) / (sMax - sMin)) * 100;

  return (
    <div className="input-field">
      {/* Popisek pole */}
      <label>{label}</label>

      {/* Wrapper pro input + suffix */}
      <div className="input-wrapper">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={error ? 'error' : ''}
        />
        {/* Suffix (jednotka) se zobrazí pouze pokud existuje */}
        {suffix && <span className="suffix">{suffix}</span>}
      </div>

      {/* Range slider */}
      <div className="slider-wrapper">
        <input
          type="range"
          min={sMin}
          max={sMax}
          step={sStep}
          value={value}
          onChange={handleSliderChange}
          className="slider"
          style={{
            background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${sliderPercent}%, var(--border-color) ${sliderPercent}%, var(--border-color) 100%)`,
          }}
        />
        <div className="slider-labels">
          <span>{suffix === 'Kč' ? `${(sMin / 1000000).toFixed(0)} M` : `${sMin}${suffix ? ' ' + suffix : ''}`}</span>
          <span>{suffix === 'Kč' ? `${(sMax / 1000000).toFixed(0)} M` : `${sMax}${suffix ? ' ' + suffix : ''}`}</span>
        </div>
      </div>

      {/* Chybová hláška - zobrazí se pouze když error existuje */}
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};
