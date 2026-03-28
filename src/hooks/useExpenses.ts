import { useState, useEffect, useCallback } from 'react';
import { Expense, Category, DEFAULT_CATEGORIES } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useExpenses(user: User) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loaded, setLoaded] = useState(false);

  // Load all data on mount
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: exp }, { data: cats }, { data: bud }] = await Promise.all([
        supabase.from('expenses').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('categories').select('*').eq('user_id', user.id),
        supabase.from('budgets').select('*').eq('user_id', user.id).single(),
      ]);
      if (exp) setExpenses(exp);
      if (cats && cats.length > 0) setCategories(cats);
      else {
        // Seed default categories for new user
        const toInsert = DEFAULT_CATEGORIES.map(c => ({ ...c, user_id: user.id }));
        const { data: inserted } = await supabase.from('categories').insert(toInsert).select();
        if (inserted) setCategories(inserted);
      }
      if (bud) setBudgetState(bud.amount);
      setLoaded(true);
    };
    load();
  }, [user]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const { data } = await supabase.from('expenses').insert({ ...expense, user_id: user.id }).select().single();
    if (data) setExpenses(prev => [data, ...prev]);
  }, [user]);

  const updateExpense = useCallback(async (id: string, data: Omit<Expense, 'id'>) => {
    await supabase.from('expenses').update(data).eq('id', id);
    setExpenses(prev => prev.map(e => e.id === id ? { ...data, id } : e));
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  const setBudget = useCallback(async (amount: number) => {
    const { data: existing } = await supabase.from('budgets').select('id').eq('user_id', user.id).single();
    if (existing) {
      await supabase.from('budgets').update({ amount, updated_at: new Date().toISOString() }).eq('user_id', user.id);
    } else {
      await supabase.from('budgets').insert({ user_id: user.id, amount });
    }
    setBudgetState(amount);
  }, [user]);

  const addCategory = useCallback(async (cat: Category) => {
    const { data } = await supabase.from('categories').insert({ ...cat, user_id: user.id }).select().single();
    if (data) setCategories(prev => [...prev, data]);
  }, [user]);

  const deleteCategory = useCallback(async (key: string) => {
    await supabase.from('categories').delete().eq('key', key).eq('user_id', user.id);
    setCategories(prev => prev.filter(c => c.key !== key));
  }, [user]);

  return { expenses, budget, categories, loaded, addExpense, updateExpense, deleteExpense, setBudget, addCategory, deleteCategory };
}