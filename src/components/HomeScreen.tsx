import { useState, useMemo } from 'react';
import { Expense, Category, formatRupiah } from '@/lib/types';
import { ExpenseCard } from './ExpenseCard';
import { AnimatePresence, motion } from 'framer-motion';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format } from 'date-fns';
import { ArrowUpDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortBy = 'date' | 'amount-high' | 'amount-low' | 'category';
type TimeFilter = 'all' | 'week' | 'month';

interface HomeScreenProps {
  expenses: Expense[];
  categories: Category[];
  budget: number;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function HomeScreen({ expenses, categories, budget, onEdit, onDelete }: HomeScreenProps) {
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [catFilter, setCatFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const now = new Date();

  const monthlySpent = useMemo(() => {
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return expenses
      .filter(e => isWithinInterval(new Date(e.date), { start, end }))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const filtered = useMemo(() => {
    let list = [...expenses];

    if (timeFilter === 'week') {
      const start = startOfWeek(now, { weekStartsOn: 1 });
      const end = endOfWeek(now, { weekStartsOn: 1 });
      list = list.filter(e => isWithinInterval(new Date(e.date), { start, end }));
    } else if (timeFilter === 'month') {
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      list = list.filter(e => isWithinInterval(new Date(e.date), { start, end }));
    }

    if (catFilter !== 'all') {
      list = list.filter(e => e.category === catFilter);
    }

    switch (sortBy) {
      case 'date': list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
      case 'amount-high': list.sort((a, b) => b.amount - a.amount); break;
      case 'amount-low': list.sort((a, b) => a.amount - b.amount); break;
      case 'category': list.sort((a, b) => a.category.localeCompare(b.category)); break;
    }
    return list;
  }, [expenses, sortBy, timeFilter, catFilter]);

  // Group expenses by month
  const grouped = useMemo(() => {
    if (sortBy !== 'date') return null; // Only group when sorting by date
    const groups: { label: string; items: Expense[] }[] = [];
    filtered.forEach(expense => {
      const label = format(new Date(expense.date), 'MMMM yyyy');
      const existing = groups.find(g => g.label === label);
      if (existing) existing.items.push(expense);
      else groups.push({ label, items: [expense] });
    });
    return groups;
  }, [filtered, sortBy]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Expenses</h1>
        <p className="text-sm text-muted-foreground">This month: {formatRupiah(monthlySpent)}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn("flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-medium transition-colors",
            showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}
        >
          <Filter size={14} /> Filter
        </button>
        <button
          onClick={() => {
            const sorts: SortBy[] = ['date', 'amount-high', 'amount-low', 'category'];
            setSortBy(sorts[(sorts.indexOf(sortBy) + 1) % sorts.length]);
          }}
          className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-secondary text-xs font-medium text-muted-foreground"
        >
          <ArrowUpDown size={14} /> {sortBy === 'date' ? 'Date' : sortBy === 'amount-high' ? 'High→Low' : sortBy === 'amount-low' ? 'Low→High' : 'Category'}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-2 bg-card rounded-xl p-3 shadow-card">
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'week', 'month'] as TimeFilter[]).map(t => (
              <button key={t} onClick={() => setTimeFilter(t)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium",
                  timeFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                {t === 'all' ? 'All Time' : t === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('all')}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-medium",
                catFilter === 'all' ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              )}
            >All</button>
            {categories.map(c => (
              <button key={c.key} onClick={() => setCatFilter(c.key)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-medium",
                  catFilter === c.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                )}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {grouped ? (
          // Grouped by month view
          grouped.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No expenses yet. Tap "+" to get started!
            </div>
          ) : (
            grouped.map(group => (
              <div key={group.label}>
                <div className="flex items-center gap-2 mb-2 mt-3 first:mt-0">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {group.label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                 <span className="text-xs text-muted-foreground">
  {formatRupiah(group.items.reduce((sum, e) => sum + e.amount, 0))}
</span>