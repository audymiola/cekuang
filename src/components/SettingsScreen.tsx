import { useState } from 'react';
import { formatRupiah, Category, Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus, Trash2, X, LogOut } from 'lucide-react';

interface SettingsScreenProps {
  budget: number;
  expenses: Expense[];
  categories: Category[];
  onSetBudget: (amount: number) => void;
  onAddCategory: (cat: Category) => void;
  onDeleteCategory: (key: string) => void;
  onSignOut: () => void;
}

export function SettingsScreen({ budget, expenses, categories, onSetBudget, onAddCategory, onDeleteCategory, onSignOut }: SettingsScreenProps) {
  const [inputVal, setInputVal] = useState(budget > 0 ? String(budget) : '');
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');

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

  const handleSave = () => {
    const val = Number(inputVal);
    if (val >= 0) onSetBudget(val);
  };

  const handleAddCategory = () => {
    if (!newCatLabel.trim()) return;
    const key = newCatLabel.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    onAddCategory({ key, label: newCatLabel.trim(), icon: newCatIcon || '📌' });
    setNewCatLabel('');
    setNewCatIcon('');
    setShowAddCat(false);
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Settings</h1>

      <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
        <Label htmlFor="budget" className="text-sm font-semibold">Monthly Budget (Rp)</Label>
        <div className="flex gap-2">
          <Input
            id="budget"
            type="number"
            placeholder="e.g. 3000000"
            min="0"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            className="h-12 flex-1"
          />
          <Button onClick={handleSave} className="h-12 px-6 font-semibold">Save</Button>
        </div>
        {budget > 0 && (
          <p className="text-xs text-muted-foreground">Current budget: {formatRupiah(budget)}</p>
        )}
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Categories</p>
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
                placeholder="Icon (emoji)"
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
            return (
              <div
                key={cat.key}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg",
                  cat === topCategory && cat.total > 0 ? "bg-accent ring-1 ring-primary/20" : "bg-secondary"
                )}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-sm font-medium text-foreground truncate">{cat.label}</span>
                  {cat === topCategory && cat.total > 0 && (
                    <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-semibold shrink-0">TOP</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-foreground">{formatRupiah(cat.total)}</span>
                  {!hasExpenses && (
                    <button
                      onClick={() => onDeleteCategory(cat.key)}
                      className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-card rounded-xl p-4 shadow-card">
        <p className="text-sm font-semibold text-foreground mb-3">Account</p>
        <button
          onClick={onSignOut}
          className="w-full h-11 rounded-xl border border-destructive/40 text-destructive font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

    </div>
  );
}