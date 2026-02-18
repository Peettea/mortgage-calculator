import { useState, useEffect, useMemo } from 'react';
import { calculateMortgage, validateInputs, generateAmortizationSchedule } from '../utils/mortgageCalculations';
import type { MortgageInputs, MortgageResults, ValidationErrors, AmortizationEntry } from '../types/mortgage';

/**
 * Custom hook pro hypoteční kalkulačku
 *
 * Obsahuje veškerou logiku:
 * - state pro vstupy
 * - validaci
 * - výpočty
 * - amortizační plán
 *
 * Komponenta pak jen zobrazuje data, která hook vrátí.
 */
export const useMortgage = () => {
  const [inputs, setInputs] = useState<MortgageInputs>({
    loanAmount: 3000000,
    interestRate: 4.5,
    loanPeriodYears: 25,
  });

  const [results, setResults] = useState<MortgageResults | null>(null);
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

  // Amortizační plán
  const amortizationSchedule = useMemo<AmortizationEntry[]>(() => {
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

  // Hook vrací vše, co komponenta potřebuje
  return {
    inputs,
    results,
    errors,
    amortizationSchedule,
    updateLoanAmount,
    updateInterestRate,
    updateLoanPeriod,
  };
};
