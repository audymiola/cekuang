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
  onUpdateCategoryBudget: (key: string, budget: number) => void;
  onSignOut: () => void;

}

const formatInput = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
};

const parseInput = (val: string): number => Number(val.replace(/\./g, ''));

export function SettingsScreen({ budget, expenses, categories, onSetBudget, onAddCategory, onDeleteCategory, onUpdateCategoryBudget, onSignOut }: SettingsScreenProps) {
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [catBudgetInputs, setCatBudgetInputs] = useState<Record<string, string>>({});
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

  const getBudgetWarning = (total: number, budgetNum: number) => {
    if (!budgetNum) return null;
    const pct = total / budgetNum;
    if (pct >= 1) return 'exceeded';
    if (pct >= 0.8) return 'warning';
    return null;
  };

  const getCatBudgetDisplay = (cat: Category) => {
    // Use input value if currently editing, otherwise use saved value
    if (catBudgetInputs[cat.key] !== undefined) return catBudgetInputs[cat.key];
    return cat.budget ? cat.budget.toLocaleString('id-ID') : '';
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
            const budgetStr = getCatBudgetDisplay(cat);
                const budgetNum = cat.budget || 0;
                const warning = getBudgetWarning(cat.total, budgetNum);
                const isEditing = editingBudget === cat.key;

            return (
              <div
                key={cat.key}
                className={cn(
                  "rounded-lg p-3 space-y-2",
                  warning === 'exceeded' ? "bg-destructive/10 ring-1 ring-destructive/30" :
                  warning === 'warning' ? "bg-amber-50 ring-1 ring-amber-200" :
                  cat === topCategory && cat.total > 0 ? "bg-accent ring-1 ring-primary/20" : "bg-secondary"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm font-medium text-foreground truncate">{cat.label}</span>
                    {cat === topCategory && cat.total > 0 && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-semibold shrink-0">TOP</span>
                    )}
                    {warning === 'exceeded' && (
                      <AlertTriangle size={13} className="text-destructive shrink-0" />
                    )}
                    {warning === 'warning' && (
                      <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-bold text-foreground">{formatRupiah(cat.total)}</span>
                    {!monthExpenses.some(e => e.category === cat.key) && (
  <button
    onClick={() => onDeleteCategory(cat.key)}
    className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center text-destructive"
  >
    <Trash2 size={13} />
  </button>
)}
                  </div>
                </div>

                {/* Budget per category */}
                {isEditing ? (
  <div className="flex gap-2">
    <Input
      type="text"
      inputMode="numeric"
      placeholder="Set budget (Rp)"
      value={budgetStr}
      onChange={e => setCatBudgetInputs(prev => ({ ...prev, [cat.key]: formatInput(e.target.value) }))}
      className="h-9 text-sm flex-1"
      autoFocus
    />
    <Button
      size="sm"
      variant="outline"
      className="h-9 px-3 text-xs text-destructive border-destructive/30"
      onClick={() => {
        onUpdateCategoryBudget(cat.key, 0);
        setCatBudgetInputs(prev => { const n = {...prev}; delete n[cat.key]; return n; });
        setEditingBudget(null);
      }}
    >
      Clear
    </Button>
    <Button
      size="sm"
      className="h-9 px-3 text-xs"
      onClick={() => {
        const val = parseInput(catBudgetInputs[cat.key] || '0');
        onUpdateCategoryBudget(cat.key, val);
        setCatBudgetInputs(prev => { const n = {...prev}; delete n[cat.key]; return n; });
        setEditingBudget(null);
      }}
    >
      Done
    </Button>
  </div>
                ) : (
                  <button
                    onClick={() => setEditingBudget(cat.key)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    {budgetNum > 0 ? (
                      <span className={cn(
                        warning === 'exceeded' ? "text-destructive font-medium" :
                        warning === 'warning' ? "text-amber-600 font-medium" : ""
                      )}>
                        Budget: {formatRupiah(budgetNum)}
                        {warning === 'exceeded' && ' — Exceeded!'}
                        {warning === 'warning' && ' — Almost reached!'}
                      </span>
                    ) : '+ Set budget'}
                  </button>
                )}

                {/* Budget progress bar */}
                {budgetNum > 0 && (
                  <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        warning === 'exceeded' ? "bg-destructive" :
                        warning === 'warning' ? "bg-amber-400" : "bg-primary"
                      )}
                      style={{ width: `${Math.min((cat.total / budgetNum) * 100, 100)}%` }}
                    />
                  </div>
                )}
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