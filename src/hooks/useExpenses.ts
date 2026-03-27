import { useState, useEffect, useCallback } from 'react';
import { Expense } from '@/lib/types';

const STORAGE_KEY = 'expense-tracker-data';
const BUDGET_KEY = 'expense-tracker-budget';

const loadExpenses = (): Expense[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveExpenses = (expenses: Expense[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(loadExpenses);
  const [budget, setBudgetState] = useState<number>(() => {
    const b = localStorage.getItem(BUDGET_KEY);
    return b ? Number(b) : 0;
  });

  useEffect(() => { saveExpenses(expenses); }, [expenses]);
  useEffect(() => { localStorage.setItem(BUDGET_KEY, String(budget)); }, [budget]);

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

  return { expenses, budget, addExpense, updateExpense, deleteExpense, setBudget };
}
