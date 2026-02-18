import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mortgageSchema, type MortgageFormData } from '../schemas/mortgageSchema';
import { calculateMortgage, generateAmortizationSchedule } from '../utils/mortgageCalculations';

/**
 * Custom hook pro hypoteční kalkulačku
 *
 * Teď používá React Hook Form + Zod místo ručního state managementu.
 * - useForm: spravuje hodnoty formuláře a validaci
 * - zodResolver: propojuje Zod schéma s React Hook Form
 * - useWatch: sleduje změny hodnot pro live přepočet
 */
export const useMortgage = () => {
  const form = useForm<MortgageFormData>({
    resolver: zodResolver(mortgageSchema),
    defaultValues: {
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 25,
    },
    mode: 'onChange', // validuje při každé změně
  });

  // Sleduj aktuální hodnoty formuláře pro live přepočet
  const inputs = useWatch({ control: form.control });

  // Výpočet výsledků — přepočítá se při každé změně vstupů
  const results = useMemo(() => {
    const { loanAmount, interestRate, loanPeriodYears } = inputs;
    if (!loanAmount || !loanPeriodYears || interestRate == null) return null;
    if (loanAmount <= 0 || loanPeriodYears <= 0 || interestRate < 0) return null;

    return calculateMortgage({
      loanAmount,
      interestRate,
      loanPeriodYears,
    });
  }, [inputs]);

  // Amortizační plán
  const amortizationSchedule = useMemo(() => {
    if (!results || !inputs.loanAmount || !inputs.interestRate == null || !inputs.loanPeriodYears) return [];
    return generateAmortizationSchedule(
      { loanAmount: inputs.loanAmount!, interestRate: inputs.interestRate!, loanPeriodYears: inputs.loanPeriodYears! },
      results.monthlyPayment
    );
  }, [inputs, results]);

  return {
    form,
    inputs: {
      loanAmount: inputs.loanAmount ?? 3000000,
      interestRate: inputs.interestRate ?? 4.5,
      loanPeriodYears: inputs.loanPeriodYears ?? 25,
    },
    results,
    amortizationSchedule,
  };
};
