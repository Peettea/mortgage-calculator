import type { MortgageInputs, MortgageResults, ValidationErrors, AmortizationEntry, ExtraPaymentSettings, ExtraPaymentComparison, FixationSettings, FixationResult } from '../types/mortgage';

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

/**
 * Vypočítá amortizační plán s mimořádnými splátkami
 * a porovná výsledky s běžným splácením
 */
export const calculateWithExtraPayments = (
  inputs: MortgageInputs,
  monthlyPayment: number,
  extra: ExtraPaymentSettings
): ExtraPaymentComparison => {
  const { loanAmount, interestRate, loanPeriodYears } = inputs;
  const monthlyRate = interestRate / 100 / 12;
  const maxMonths = loanPeriodYears * 12;
  const schedule: AmortizationEntry[] = [];

  let remainingBalance = loanAmount;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  let month = 0;

  while (remainingBalance > 0 && month < maxMonths) {
    month++;
    const interestPayment = remainingBalance * monthlyRate;
    let principalPayment = monthlyPayment - interestPayment;

    // Přičti pravidelnou mimořádnou splátku
    principalPayment += extra.monthlyExtra;

    // Přičti jednorázovou mimořádnou splátku
    if (extra.oneTimeAmount > 0 && month === extra.oneTimeMonth) {
      principalPayment += extra.oneTimeAmount;
    }

    // Nepřeplať — pokud bys zaplatil víc než zbývá
    if (principalPayment > remainingBalance) {
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

  const totalPaid = cumulativePrincipal + cumulativeInterest;
  const normalTotal = monthlyPayment * maxMonths;
  const normalInterest = normalTotal - loanAmount;

  return {
    withExtra: {
      totalMonths: month,
      totalPaid: Math.round(totalPaid),
      totalInterest: Math.round(cumulativeInterest),
      schedule,
    },
    savings: {
      monthsSaved: maxMonths - month,
      interestSaved: Math.round(normalInterest - cumulativeInterest),
    },
  };
};

/**
 * Simuluje fixaci sazby — co se stane po konci fixace
 * Vrací 3 scénáře: zůstat u banky (nová sazba), refinancovat, původní sazba celou dobu
 */
export const calculateFixation = (
  inputs: MortgageInputs,
  fixation: FixationSettings
): FixationResult[] => {
  const { loanAmount, interestRate, loanPeriodYears } = inputs;
  const totalMonths = loanPeriodYears * 12;
  const fixationMonths = fixation.fixationYears * 12;

  const simulate = (rateBefore: number, rateAfter: number) => {
    const monthlyRateBefore = rateBefore / 100 / 12;
    const monthlyRateAfter = rateAfter / 100 / 12;
    let remaining = loanAmount;
    let totalInterest = 0;
    let paymentBefore = 0;
    let paymentAfter = 0;

    // Fáze 1: fixace
    if (rateBefore === 0) {
      paymentBefore = loanAmount / totalMonths;
    } else {
      const p = Math.pow(1 + monthlyRateBefore, totalMonths);
      paymentBefore = loanAmount * (monthlyRateBefore * p) / (p - 1);
    }

    for (let m = 1; m <= fixationMonths && remaining > 0; m++) {
      const interest = remaining * monthlyRateBefore;
      const principal = Math.min(paymentBefore - interest, remaining);
      remaining -= principal;
      totalInterest += interest;
    }

    // Fáze 2: po fixaci
    const remainingMonths = totalMonths - fixationMonths;
    if (remaining > 0 && remainingMonths > 0) {
      if (rateAfter === 0) {
        paymentAfter = remaining / remainingMonths;
      } else {
        const p = Math.pow(1 + monthlyRateAfter, remainingMonths);
        paymentAfter = remaining * (monthlyRateAfter * p) / (p - 1);
      }

      for (let m = 1; m <= remainingMonths && remaining > 0; m++) {
        const interest = remaining * monthlyRateAfter;
        const principal = Math.min(paymentAfter - interest, remaining);
        remaining -= principal;
        totalInterest += interest;
      }
    }

    return {
      paymentBefore: Math.round(paymentBefore),
      paymentAfter: Math.round(paymentAfter || paymentBefore),
      totalInterest: Math.round(totalInterest),
      totalPaid: Math.round(loanAmount + totalInterest),
    };
  };

  const current = simulate(interestRate, interestRate);
  const afterFixation = simulate(interestRate, fixation.newRateAfter);
  const refinanced = simulate(interestRate, fixation.refinanceRate);

  return [
    {
      label: `Současná sazba celou dobu (${interestRate}%)`,
      monthlyPaymentBefore: current.paymentBefore,
      monthlyPaymentAfter: current.paymentAfter,
      totalInterest: current.totalInterest,
      totalPaid: current.totalPaid,
      color: '#4a90d9',
    },
    {
      label: `Po fixaci nová sazba (${fixation.newRateAfter}%)`,
      monthlyPaymentBefore: afterFixation.paymentBefore,
      monthlyPaymentAfter: afterFixation.paymentAfter,
      totalInterest: afterFixation.totalInterest,
      totalPaid: afterFixation.totalPaid,
      color: '#e67e22',
    },
    {
      label: `Refinancování (${fixation.refinanceRate}%)`,
      monthlyPaymentBefore: refinanced.paymentBefore,
      monthlyPaymentAfter: refinanced.paymentAfter,
      totalInterest: refinanced.totalInterest,
      totalPaid: refinanced.totalPaid,
      color: '#27ae60',
    },
  ];
};
