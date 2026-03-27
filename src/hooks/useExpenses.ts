import { useState, useEffect, useCallback } from 'react';
import { Expense, Category, DEFAULT_CATEGORIES } from '@/lib/types';

const STORAGE_KEY = 'expense-tracker-data';
const BUDGET_KEY = 'expense-tracker-budget';
const CATEGORIES_KEY = 'expense-tracker-categories';

const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const loadCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  } catch { return DEFAULT_CATEGORIES; }
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [budget, setBudgetState] = useState<number>(() => {
    const b = localStorage.getItem(BUDGET_KEY);
    return b ? Number(b) : 0;
  });
  const [categories, setCategories] = useState<Category[]>(loadCategories);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(BUDGET_KEY, String(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories)); }, [categories]);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: crypto.randomUUID() }]);
  }, []);

  const updateExpense = useCallback((id: string, data: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...data, id } : e));
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const setBudget = useCallback((amount: number) => {
    setBudgetState(amount);
  }, []);

  const addCategory = useCallback((cat: Category) => {
    setCategories(prev => [...prev, cat]);
  }, []);

  const deleteCategory = useCallback((key: string) => {
    setCategories(prev => prev.filter(c => c.key !== key));
  }, []);

  return { expenses, budget, categories, addExpense, updateExpense, deleteExpense, setBudget, addCategory, deleteCategory };
}
