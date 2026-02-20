import { describe, it, expect } from 'vitest';
import { mortgageSchema } from './mortgageSchema';

describe('mortgageSchema (Zod validace)', () => {
  it('přijme platná data', () => {
    const result = mortgageSchema.safeParse({
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    expect(result.success).toBe(true);
  });

  it('odmítne příliš nízký úvěr', () => {
    const result = mortgageSchema.safeParse({
      loanAmount: 50000,
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    expect(result.success).toBe(false);
  });

  it('odmítne zápornou úrokovou sazbu', () => {
    const result = mortgageSchema.safeParse({
      loanAmount: 3000000,
      interestRate: -1,
      loanPeriodYears: 25,
    });

    expect(result.success).toBe(false);
  });

  it('odmítne dobu splácení přes 50 let', () => {
    const result = mortgageSchema.safeParse({
      loanAmount: 3000000,
      interestRate: 4.5,
      loanPeriodYears: 60,
    });

    expect(result.success).toBe(false);
  });

  it('odmítne textový vstup místo čísla', () => {
    const result = mortgageSchema.safeParse({
      loanAmount: 'abc',
      interestRate: 4.5,
      loanPeriodYears: 25,
    });

    expect(result.success).toBe(false);
  });
});
