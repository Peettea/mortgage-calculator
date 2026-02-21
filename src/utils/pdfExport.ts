import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { MortgageInputs, MortgageResults } from '../types/mortgage';
import { generateAmortizationSchedule } from './mortgageCalculations';

const fmt = (amount: number): string =>
  new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export const exportToPDF = (inputs: MortgageInputs, results: MortgageResults) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Nadpis
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text('Hypotecni kalkulacka', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Vygenerovano: ${new Date().toLocaleDateString('cs-CZ')}`, pageWidth / 2, 28, { align: 'center' });

  // Vstupní parametry
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Vstupni parametry', 14, 42);

  autoTable(doc, {
    startY: 46,
    head: [['Parametr', 'Hodnota']],
    body: [
      ['Vyse uveru', `${fmt(inputs.loanAmount)} Kc`],
      ['Urokova sazba', `${inputs.interestRate} %`],
      ['Doba splaceni', `${inputs.loanPeriodYears} let`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  // Výsledky
  const afterParams = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 80;
  doc.setFontSize(14);
  doc.text('Vysledky', 14, afterParams + 12);

  autoTable(doc, {
    startY: afterParams + 16,
    head: [['Ukazatel', 'Hodnota']],
    body: [
      ['Mesicni splatka', `${fmt(results.monthlyPayment)} Kc`],
      ['Celkem zaplaceno', `${fmt(results.totalAmountPaid)} Kc`],
      ['Z toho uroky', `${fmt(results.totalInterestPaid)} Kc`],
      ['Preplatek', `${(((results.totalAmountPaid / inputs.loanAmount) - 1) * 100).toFixed(1)} %`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
  });

  // Amortizační plán (prvních 12 měsíců)
  const afterResults = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 140;
  doc.setFontSize(14);
  doc.text('Amortizacni plan (prvnich 12 mesicu)', 14, afterResults + 12);

  const schedule = generateAmortizationSchedule(inputs, results.monthlyPayment);
  const first12 = schedule.slice(0, 12);

  autoTable(doc, {
    startY: afterResults + 16,
    head: [['Mesic', 'Jistina', 'Urok', 'Zbyvajici dluh']],
    body: first12.map((row) => [
      `${row.month}.`,
      `${fmt(row.principalPayment)} Kc`,
      `${fmt(row.interestPayment)} Kc`,
      `${fmt(row.remainingBalance)} Kc`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 8 },
  });

  // Patička
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Hypotecni kalkulacka — mortgage-calculator-m42j.vercel.app', pageWidth / 2, pageHeight - 10, { align: 'center' });

  doc.save(`hypoteka-${fmt(inputs.loanAmount)}-${inputs.interestRate}pct.pdf`);
};
