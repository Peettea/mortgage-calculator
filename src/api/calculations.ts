import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://snapzkzlvwtkvhwsmyto.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNuYXB6a3psdnd0a3Zod3NteXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTM5NjEsImV4cCI6MjA3MDg2OTk2MX0.QHJFb3r_cxaH9cdUsR4FU2_zB6h6FT3XcXg2sp_Q85c'
);

export interface SavedCalculation {
  id: number;
  loan_amount: number;
  interest_rate: number;
  loan_period_years: number;
  monthly_payment: number;
  total_paid: number;
  total_interest: number;
  created_at: string;
}

// Načte historii výpočtů ze Supabase
export const fetchCalculations = async (): Promise<SavedCalculation[]> => {
  const { data, error } = await supabase
    .from('mortgage_calculations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
};

// Uloží nový výpočet do Supabase
export const saveCalculation = async (
  data: Omit<SavedCalculation, 'id' | 'created_at'>
): Promise<SavedCalculation> => {
  const { data: row, error } = await supabase
    .from('mortgage_calculations')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return row;
};

// Smaže výpočet ze Supabase
export const deleteCalculation = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('mortgage_calculations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
