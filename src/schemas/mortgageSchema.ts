import { z } from 'zod';

/**
 * Zod schéma — definuje pravidla pro validaci formuláře.
 * Místo ručního psaní if/else validací (jako ve starém validateInputs),
 * píšeš pravidla deklarativně a Zod se postará o zbytek.
 */
export const mortgageSchema = z.object({
  loanAmount: z
    .number({ error: 'Zadejte číslo' })
    .min(100000, 'Minimální výše úvěru je 100 000 Kč')
    .max(100000000, 'Výše úvěru je příliš vysoká'),

  interestRate: z
    .number({ error: 'Zadejte číslo' })
    .min(0, 'Úroková sazba nemůže být záporná')
    .max(100, 'Úroková sazba nemůže být větší než 100%'),

  loanPeriodYears: z
    .number({ error: 'Zadejte číslo' })
    .min(1, 'Doba splácení musí být alespoň 1 rok')
    .max(50, 'Doba splácení nemůže být delší než 50 let'),
});

export type MortgageFormData = z.infer<typeof mortgageSchema>;
