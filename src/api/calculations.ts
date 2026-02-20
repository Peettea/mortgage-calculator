const API_URL = 'http://localhost:3001/api';

export interface SavedCalculation {
  id: number;
  loanAmount: number;
  interestRate: number;
  loanPeriodYears: number;
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  createdAt: string;
}

// Načte historii výpočtů ze serveru
export const fetchCalculations = async (): Promise<SavedCalculation[]> => {
  const res = await fetch(`${API_URL}/calculations`);
  return res.json();
};

// Uloží nový výpočet na server
export const saveCalculation = async (data: Omit<SavedCalculation, 'id' | 'createdAt'>): Promise<SavedCalculation> => {
  const res = await fetch(`${API_URL}/calculations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

// Smaže výpočet ze serveru
export const deleteCalculation = async (id: number): Promise<void> => {
  await fetch(`${API_URL}/calculations/${id}`, {
    method: 'DELETE',
  });
};
