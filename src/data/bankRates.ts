export interface BankRate {
  bank: string;
  fixation: number; // roky
  rate: number;     // % p.a.
  note?: string;
}

// Orientační sazby českých bank (únor 2026)
// Aktualizuj ručně nebo připoj na API
export const BANK_RATES: BankRate[] = [
  { bank: 'Hypoteční banka', fixation: 3, rate: 4.89 },
  { bank: 'Hypoteční banka', fixation: 5, rate: 4.79 },
  { bank: 'Hypoteční banka', fixation: 7, rate: 4.99 },
  { bank: 'Česká spořitelna', fixation: 3, rate: 4.99 },
  { bank: 'Česká spořitelna', fixation: 5, rate: 4.89 },
  { bank: 'Česká spořitelna', fixation: 7, rate: 5.09 },
  { bank: 'Komerční banka', fixation: 3, rate: 4.94 },
  { bank: 'Komerční banka', fixation: 5, rate: 4.84 },
  { bank: 'Komerční banka', fixation: 7, rate: 5.04 },
  { bank: 'ČSOB', fixation: 3, rate: 4.89 },
  { bank: 'ČSOB', fixation: 5, rate: 4.79 },
  { bank: 'ČSOB', fixation: 7, rate: 4.99 },
  { bank: 'Raiffeisenbank', fixation: 3, rate: 4.79 },
  { bank: 'Raiffeisenbank', fixation: 5, rate: 4.69 },
  { bank: 'Raiffeisenbank', fixation: 7, rate: 4.89 },
  { bank: 'mBank', fixation: 3, rate: 4.69 },
  { bank: 'mBank', fixation: 5, rate: 4.59 },
  { bank: 'mBank', fixation: 7, rate: 4.79 },
  { bank: 'Moneta', fixation: 3, rate: 4.99 },
  { bank: 'Moneta', fixation: 5, rate: 4.89 },
  { bank: 'Moneta', fixation: 7, rate: 5.09 },
  { bank: 'UniCredit', fixation: 3, rate: 4.84 },
  { bank: 'UniCredit', fixation: 5, rate: 4.74 },
  { bank: 'UniCredit', fixation: 7, rate: 4.94 },
];

export const LAST_UPDATED = '2026-02-21';

export const getUniqueFixations = (): number[] =>
  [...new Set(BANK_RATES.map((r) => r.fixation))].sort((a, b) => a - b);

export const getBestRate = (fixation: number): BankRate | undefined =>
  BANK_RATES
    .filter((r) => r.fixation === fixation)
    .sort((a, b) => a.rate - b.rate)[0];
