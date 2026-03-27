export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: CategoryKey;
  date: string; // ISO string
  notes?: string;
}

export type CategoryKey = 'food' | 'transport' | 'shopping' | 'health' | 'entertainment' | 'housing' | 'utilities' | 'others';

export interface Category {
  key: CategoryKey;
  label: string;
  icon: string;
}

export const CATEGORIES: Category[] = [
  { key: 'food', label: 'Food & Drinks', icon: '🍔' },
  { key: 'transport', label: 'Transport', icon: '🚗' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'health', label: 'Health', icon: '💊' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { key: 'housing', label: 'Housing', icon: '🏠' },
  { key: 'utilities', label: 'Utilities', icon: '📱' },
  { key: 'others', label: 'Others', icon: '📦' },
];

export const getCategoryByKey = (key: CategoryKey): Category => {
  return CATEGORIES.find(c => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
};

export const formatRupiah = (amount: number): string => {
  return 'Rp ' + amount.toLocaleString('id-ID');
};
