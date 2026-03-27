import { useState } from 'react';
import { formatRupiah, CATEGORIES } from '@/lib/types';
import { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface SettingsScreenProps {
  budget: number;
  expenses: Expense[];
  onSetBudget: (amount: number) => void;
}

export function SettingsScreen({ budget, expenses, onSetBudget }: SettingsScreenProps) {
  const [inputVal, setInputVal] = useState(budget > 0 ? String(budget) : '');

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const monthExpenses = expenses.filter(e =>
    isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
  );

  const categoryTotals = CATEGORIES.map(cat => ({
    ...cat,
    total: monthExpenses.filter(e => e.category === cat.key).reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total);

  const topCategory = categoryTotals[0];

  const handleSave = () => {
    const val = Number(inputVal);
    if (val >= 0) onSetBudget(val);
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
        <p className="text-sm font-semibold text-foreground">Categories (This Month)</p>
        <div className="space-y-2">
          {categoryTotals.map(cat => (
            <div
              key={cat.key}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg",
                cat === topCategory && cat.total > 0 ? "bg-accent ring-1 ring-primary/20" : "bg-secondary"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium text-foreground">{cat.label}</span>
                {cat === topCategory && cat.total > 0 && (
                  <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-semibold">TOP</span>
                )}
              </div>
              <span className="text-sm font-bold text-foreground">{formatRupiah(cat.total)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
