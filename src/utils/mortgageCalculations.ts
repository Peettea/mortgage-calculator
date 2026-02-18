import type { MortgageInputs, MortgageResults, ValidationErrors, AmortizationEntry } from '../types/mortgage';

/**
 * Vypočítá hypoteční splátky pomocí vzorce pro anuitní splátky
 *
 * Vzorec: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 * M = měsíční splátka
 * P = výše úvěru (principal)
 * r = měsíční úroková sazba (roční sazba / 12 / 100)
 * n = počet měsíčních splátek (roky * 12)
 */
export const calculateMortgage = (inputs: MortgageInputs): MortgageResults => {
  const { loanAmount, interestRate, loanPeriodYears } = inputs;

  // Převod roční úrokové sazby na měsíční (v desetinném tvaru)
  const monthlyRate = interestRate / 100 / 12;

  // Celkový počet měsíčních splátek
  const numberOfPayments = loanPeriodYears * 12;

  let monthlyPayment: number;

  // Speciální případ: nulový úrok (úvěr bez úroků)
  if (interestRate === 0) {
    monthlyPayment = loanAmount / numberOfPayments;
  } else {
    // Standardní výpočet s úrokem
    const powerTerm = Math.pow(1 + monthlyRate, numberOfPayments);
    monthlyPayment = loanAmount * (monthlyRate * powerTerm) / (powerTerm - 1);
  }

  // Celková zaplacená částka = měsíční splátka * počet měsíců
  const totalAmountPaid = monthlyPayment * numberOfPayments;

  // Zaplacené úroky = celková částka - půjčená částka
  const totalInterestPaid = totalAmountPaid - loanAmount;

  // Zaokrouhlení na 2 desetinná místa
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmountPaid: Math.round(totalAmountPaid * 100) / 100,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
  };
};

/**
 * Validuje vstupní data od uživatele
 * Vrací objekt s chybovými hláškami pro neplatná pole
 */
export const validateInputs = (inputs: MortgageInputs): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Validace výše úvěru
  if (inputs.loanAmount <= 0) {
    errors.loanAmount = 'Výše úvěru musí být větší než 0 Kč';
  }
  if (inputs.loanAmount > 100000000) {
    errors.loanAmount = 'Výše úvěru je příliš vysoká';
  }

  // Validace úrokové sazby
  if (inputs.interestRate < 0) {
    errors.interestRate = 'Úroková sazba nemůže být záporná';
  }
  if (inputs.interestRate > 100) {
    errors.interestRate = 'Úroková sazba nemůže být větší než 100%';
  }

  // Validace doby splácení
  if (inputs.loanPeriodYears <= 0) {
    errors.loanPeriodYears = 'Doba splácení musí být alespoň 1 rok';
  }
  if (inputs.loanPeriodYears > 50) {
    errors.loanPeriodYears = 'Doba splácení nemůže být delší než 50 let';
  }

  return errors;
};

/**
 * Generuje amortizační plán - rozpad každé splátky na jistinu a úrok
 *
 * Pro každý měsíc vypočítá:
 * - Kolik z měsíční splátky jde na úrok (= zbývající dluh * měsíční sazba)
 * - Kolik jde na jistinu (= splátka - úrok)
 * - Kolik zbývá splatit
 */
export const generateAmortizationSchedule = (
  inputs: MortgageInputs,
  monthlyPayment: number
): AmortizationEntry[] => {
  const { loanAmount, interestRate, loanPeriodYears } = inputs;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanPeriodYears * 12;
  const schedule: AmortizationEntry[] = [];

  let remainingBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;

  for (let month = 1; month <= totalMonths; month++) {
    // Úroková část splátky
    const interestPayment = remainingBalance * monthlyRate;
    // Jistinová část splátky
    let principalPayment = monthlyPayment - interestPayment;

    // Poslední splátka - dorovnání zaokrouhlovacích chyb
    if (month === totalMonths) {
      principalPayment = remainingBalance;
    }

    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    cumulativePrincipal += principalPayment;
    cumulativeInterest += interestPayment;

    schedule.push({
      month,
      year: Math.ceil(month / 12),
      principalPayment: Math.round(principalPayment),
      interestPayment: Math.round(interestPayment),
      remainingBalance: Math.round(remainingBalance),
      cumulativePrincipal: Math.round(cumulativePrincipal),
      cumulativeInterest: Math.round(cumulativeInterest),
    });
  }

  return schedule;
};
