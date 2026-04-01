import { useState, useEffect, useCallback } from 'react';
import { Expense, Category, DEFAULT_CATEGORIES } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export function useExpenses(user: User, householdId: string | null) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user || !householdId) return;
    const load = async () => {
      const [{ data: exp }, { data: cats }, { data: bud }] = await Promise.all([
        supabase.from('expenses').select('*').eq('household_id', householdId).order('date', { ascending: false }),
        supabase.from('categories').select('*').eq('household_id', householdId),
        supabase.from('budgets').select('*').eq('user_id', user.id).single(),
      ]);

      if (exp) setExpenses(exp);

      if (cats && cats.length > 0) {
        setCategories(cats);
      } else {
        // Seed default categories for new household
        const toInsert = DEFAULT_CATEGORIES.map(c => ({
          key: c.key,
          label: c.label,
          icon: c.icon,
          budget: 0,
          user_id: user.id,
          household_id: householdId,
        }));
        const { data: inserted } = await supabase.from('categories').insert(toInsert).select();
        if (inserted && inserted.length > 0) setCategories(inserted);
      }

      if (bud) setBudgetState(bud.amount);
      setLoaded(true);
    };
    load();
  }, [user, householdId]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    const { data } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id, household_id: householdId })
      .select()
      .single();
    if (data) setExpenses(prev => [data, ...prev]);
  }, [user, householdId]);

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
    const { data } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user.id, household_id: householdId })
      .select()
      .single();
    if (data) setCategories(prev => [...prev, data]);
  }, [user, householdId]);

  const deleteCategory = useCallback(async (key: string) => {
    await supabase.from('categories').delete().eq('key', key).eq('household_id', householdId);
    setCategories(prev => prev.filter(c => c.key !== key));
  }, [householdId]);

  const updateCategoryBudget = useCallback(async (key: string, budget: number) => {
    await supabase.from('categories').update({ budget }).eq('key', key).eq('household_id', householdId);
    setCategories(prev => prev.map(c => c.key === key ? { ...c, budget } : c));
  }, [householdId]);

  return { expenses, budget, categories, loaded, addExpense, updateExpense, deleteExpense, setBudget, addCategory, deleteCategory, updateCategoryBudget };
}