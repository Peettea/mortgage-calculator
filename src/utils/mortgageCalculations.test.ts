import { describe, it, expect } from 'vitest';
import { calculateMortgage, validateInputs, generateAmortizationSchedule } from './mortgageCalculations';

describe('calculateMortgage', () => {
  it('vypočítá správnou měsíční splátku pro standardní hypotéku', () => {
    const result = calculateMortgage({
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    // Měsíční splátka 3M Kč na 25 let s 4.5% je 16 674.97 Kč
    expect(result.monthlyPayment).toBeCloseTo(16674.97, 0);
    expect(result.totalAmountPaid).toBeGreaterThan(3000000);
    expect(result.totalInterestPaid).toBeGreaterThan(0);
  });

  it('celkové úroky = celková částka - půjčka', () => {
    const result = calculateMortgage({
      loanAmount: 2000000,
      interestRate: 5,
      loanPeriodYears: 20,
    });

    expect(result.totalInterestPaid).toBeCloseTo(
      result.totalAmountPaid - 2000000,
      0
    );
  });

  it('při nulovém úroku je splátka = půjčka / počet měsíců', () => {
    const result = calculateMortgage({
      loanAmount: 1200000,
      interestRate: 0,
      loanPeriodYears: 10,
    });

    expect(result.monthlyPayment).toBe(10000); // 1.2M / 120 měsíců
    expect(result.totalInterestPaid).toBe(0);
  });
});

describe('validateInputs', () => {
  it('vrátí prázdný objekt pro platné vstupy', () => {
    const errors = validateInputs({
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('vrátí chybu pro zápornou výši úvěru', () => {
    const errors = validateInputs({
      loanAmount: -100,
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    expect(errors.loanAmount).toBeDefined();
  });

  it('vrátí chybu pro příliš vysokou úrokovou sazbu', () => {
    const errors = validateInputs({
      loanAmount: 3000000,
      interestRate: 150,
      loanPeriodYears: 25,
    });

    expect(errors.interestRate).toBeDefined();
  });

  it('vrátí chybu pro nulovou dobu splácení', () => {
    const errors = validateInputs({
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 0,
    });

    expect(errors.loanPeriodYears).toBeDefined();
  });
});

describe('generateAmortizationSchedule', () => {
  it('vygeneruje správný počet záznamů', () => {
    const result = calculateMortgage({
      loanAmount: 1000000,
      interestRate: 5,
      loanPeriodYears: 10,
    });

    const schedule = generateAmortizationSchedule(
      { loanAmount: 1000000, interestRate: 5, loanPeriodYears: 10 },
      result.monthlyPayment
    );

    expect(schedule).toHaveLength(120); // 10 let * 12 měsíců
  });

  it('poslední splátka má nulový zůstatek', () => {
    const result = calculateMortgage({
      loanAmount: 1000000,
      interestRate: 5,
      loanPeriodYears: 10,
    });

    const schedule = generateAmortizationSchedule(
      { loanAmount: 1000000, interestRate: 5, loanPeriodYears: 10 },
      result.monthlyPayment
    );

    const lastEntry = schedule[schedule.length - 1];
    expect(lastEntry.remainingBalance).toBe(0);
  });

  it('jistina v každém měsíci roste, úrok klesá', () => {
    const result = calculateMortgage({
      loanAmount: 2000000,
      interestRate: 5,
      loanPeriodYears: 20,
    });

    const schedule = generateAmortizationSchedule(
      { loanAmount: 2000000, interestRate: 5, loanPeriodYears: 20 },
      result.monthlyPayment
    );

    // První splátka má vyšší úrok než poslední
    expect(schedule[0].interestPayment).toBeGreaterThan(
      schedule[schedule.length - 2].interestPayment
    );
    // První splátka má nižší jistinu než poslední
    expect(schedule[0].principalPayment).toBeLessThan(
      schedule[schedule.length - 2].principalPayment
    );
  });
});
