export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
}

export interface Category {
  key: string;
  label: string;
  icon: string;
  budget?: number;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { key: 'food', label: 'Food & Drinks', icon: '🍔' },
  { key: 'transport', label: 'Transport', icon: '🚗' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'health', label: 'Health', icon: '💊' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { key: 'housing', label: 'Housing', icon: '🏠' },
  { key: 'utilities', label: 'Utilities', icon: '📱' },
  { key: 'others', label: 'Others', icon: '📦' },
];

export const formatRupiah = (amount: number): string => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};