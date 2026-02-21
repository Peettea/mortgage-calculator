import { describe, it, expect } from 'vitest';
import { calculateMortgage, validateInputs, generateAmortizationSchedule, calculateWithExtraPayments, calculateFixation } from './mortgageCalculations';

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

describe('calculateWithExtraPayments', () => {
  const inputs = { loanAmount: 3000000, interestRate: 4.5, loanPeriodYears: 25 };
  const monthlyPayment = calculateMortgage(inputs).monthlyPayment;

  it('pravidelná mimořádná splátka zkrátí dobu splácení', () => {
    const result = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 5000,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });

    expect(result.withExtra.totalMonths).toBeLessThan(25 * 12);
    expect(result.savings.monthsSaved).toBeGreaterThan(0);
  });

  it('mimořádná splátka sníží celkové úroky', () => {
    const result = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 5000,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });

    const normalInterest = monthlyPayment * 25 * 12 - 3000000;
    expect(result.withExtra.totalInterest).toBeLessThan(normalInterest);
    expect(result.savings.interestSaved).toBeGreaterThan(0);
  });

  it('jednorázová mimořádná splátka se projeví ve správném měsíci', () => {
    const result = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 0,
      oneTimeAmount: 500000,
      oneTimeMonth: 12,
    });

    // Měsíc 12 = index 11 (0-indexed), měsíc 11 = index 10
    const balanceBeforeOneTime = result.withExtra.schedule[10].remainingBalance; // konec měsíce 11
    const balanceAfterOneTime = result.withExtra.schedule[11].remainingBalance;  // konec měsíce 12
    // Normální měsíční snížení (měsíc 10 → 11)
    const normalDrop = result.withExtra.schedule[8].remainingBalance - result.withExtra.schedule[9].remainingBalance;
    // Pokles ve 12. měsíci musí být výrazně větší (zahrnuje 500k jednorázovou splátku)
    const dropAtOneTime = balanceBeforeOneTime - balanceAfterOneTime;
    expect(dropAtOneTime).toBeGreaterThan(normalDrop + 400000);
  });

  it('bez mimořádných splátek úspora = 0', () => {
    const result = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 0,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });

    expect(result.savings.monthsSaved).toBe(0);
    // Zaokrouhlení může způsobit odchylku ±few Kč
    expect(Math.abs(result.savings.interestSaved)).toBeLessThanOrEqual(5);
    expect(result.withExtra.totalMonths).toBe(25 * 12);
  });

  it('nepřeplatí — dluh neklesne pod nulu', () => {
    const smallLoan = { loanAmount: 100000, interestRate: 5, loanPeriodYears: 5 };
    const payment = calculateMortgage(smallLoan).monthlyPayment;

    const result = calculateWithExtraPayments(smallLoan, payment, {
      monthlyExtra: 50000,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });

    const lastEntry = result.withExtra.schedule[result.withExtra.schedule.length - 1];
    expect(lastEntry.remainingBalance).toBe(0);
  });

  it('vyšší mimořádná splátka = větší úspora', () => {
    const low = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 2000,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });
    const high = calculateWithExtraPayments(inputs, monthlyPayment, {
      monthlyExtra: 10000,
      oneTimeAmount: 0,
      oneTimeMonth: 1,
    });

    expect(high.savings.interestSaved).toBeGreaterThan(low.savings.interestSaved);
    expect(high.savings.monthsSaved).toBeGreaterThan(low.savings.monthsSaved);
  });
});

describe('calculateFixation', () => {
  const inputs = { loanAmount: 3000000, interestRate: 4.5, loanPeriodYears: 25 };

  it('vrátí 3 scénáře', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 4,
    });

    expect(results).toHaveLength(3);
  });

  it('scénář se současnou sazbou — splátka se nemění', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 4,
    });

    const current = results[0];
    expect(current.monthlyPaymentBefore).toBe(current.monthlyPaymentAfter);
  });

  it('vyšší sazba po fixaci = vyšší celkové úroky', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 7,
      refinanceRate: 3,
    });

    const current = results[0];     // 4.5% celou dobu
    const higher = results[1];      // 4.5% -> 7%

    expect(higher.totalInterest).toBeGreaterThan(current.totalInterest);
    expect(higher.monthlyPaymentAfter).toBeGreaterThan(current.monthlyPaymentAfter);
  });

  it('nižší sazba refinancování = nižší celkové úroky', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 3,
    });

    const current = results[0];       // 4.5% celou dobu
    const refinanced = results[2];    // 4.5% -> 3%

    expect(refinanced.totalInterest).toBeLessThan(current.totalInterest);
    expect(refinanced.monthlyPaymentAfter).toBeLessThan(current.monthlyPaymentAfter);
  });

  it('totalPaid = loanAmount + totalInterest', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 4,
    });

    for (const r of results) {
      expect(r.totalPaid).toBe(3000000 + r.totalInterest);
    }
  });

  it('splátka před fixací je stejná u všech scénářů', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 4,
    });

    const paymentBefore = results[0].monthlyPaymentBefore;
    expect(results[1].monthlyPaymentBefore).toBe(paymentBefore);
    expect(results[2].monthlyPaymentBefore).toBe(paymentBefore);
  });

  it('splátka před fixací odpovídá calculateMortgage', () => {
    const results = calculateFixation(inputs, {
      fixationYears: 5,
      newRateAfter: 6,
      refinanceRate: 4,
    });

    const expected = calculateMortgage(inputs).monthlyPayment;
    // Zaokrouhlení se může lišit o 1 Kč
    expect(Math.abs(results[0].monthlyPaymentBefore - expected)).toBeLessThanOrEqual(1);
  });
});
