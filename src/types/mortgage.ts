// Typy pro hypoteční kalkulačku

// Vstupní data od uživatele
export interface MortgageInputs {
  loanAmount: number;       // výše úvěru v Kč
  interestRate: number;     // úroková sazba v %
  loanPeriodYears: number;  // doba splácení v letech
}

// Vypočítané výsledky
export interface MortgageResults {
  monthlyPayment: number;      // měsíční splátka v Kč
  totalAmountPaid: number;     // celková zaplacená částka v Kč
  totalInterestPaid: number;   // celkové zaplacené úroky v Kč
}

// Jeden řádek amortizačního plánu (pro každý měsíc)
export interface AmortizationEntry {
  month: number;                // číslo měsíce (1, 2, 3, ...)
  year: number;                 // rok splácení (1, 2, 3, ...)
  principalPayment: number;     // splátka jistiny v daném měsíci
  interestPayment: number;      // úrok v daném měsíci
  remainingBalance: number;     // zbývající dluh po splátce
  cumulativePrincipal: number;  // kumulativně splacená jistina
  cumulativeInterest: number;   // kumulativně zaplacené úroky
}

// Chybové hlášky pro validaci
export interface ValidationErrors {
  loanAmount?: string;
  interestRate?: string;
  loanPeriodYears?: string;
}
