import { useState } from 'react';
import { formatRupiah, Category, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, LogOut, AlertTriangle } from 'lucide-react';

interface SettingsScreenProps {
  budget: number;
  expenses: Expense[];
  categories: Category[];
  onSetBudget: (amount: number) => void;
  onAddCategory: (cat: Category) => void;
  onDeleteCategory: (key: string) => void;
  onSignOut: () => void;
}

const formatInput = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
};

const parseInput = (val: string): number => Number(val.replace(/\./g, ''));

export function SettingsScreen({ budget, expenses, categories, onSetBudget, onAddCategory, onDeleteCategory, onSignOut }: SettingsScreenProps) {
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [catBudgets, setCatBudgets] = useState<Record<string, string>>({});
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthExpenses = expenses.filter(e =>
    isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const categoryTotals = categories.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0];

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const key = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    onAddCategory({ key, label: newCatLabel.trim(), icon: newCatIcon || '📌' });
    setNewCatLabel('');
    setNewCatIcon('');
    setShowAddCat(false);
  };

  const getBudgetWarning = (total: number, budgetStr: string) => {
    const budget = parseInput(budgetStr);
    if (!budget) return null;
    const pct = total / budget;
    if (pct >= 1) return 'exceeded';
    if (pct >= 0.8) return 'warning';
    return null;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      {/* Categories */}
      <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Categories & Budget</p>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
          >
            {showAddCat ? <X size={16} /> : <Plus size={16} />}
          </button>
        </div>

        {showAddCat && (
          <div className="bg-secondary rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Icon"
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                className="h-10 w-16 text-center text-lg"
                maxLength={2}
              />
              <Input
                placeholder="Category name"
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                className="h-10 flex-1"
              />
            </div>
            <Button onClick={handleAddCategory} size="sm" className="w-full h-10 font-semibold">
              Add Category
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {categoryTotals.map(cat => {
            const hasExpenses = monthExpenses.some(e => e.category === cat.key);
            const budgetStr = catBudgets[cat.key] || '';
            const warning = getBudgetWarning(cat.total, budgetStr);
            const budgetNum = parseInput(budgetStr);
            const isEditing = editingBudget === cat.key;

            return (
              <div
                key={cat.key}
                className={cn(
                  "rounded-lg p-3 space-y-2",
                  warning === 'exceeded' ? "bg-destructive/10 ring-1 ring-destructive/30" :