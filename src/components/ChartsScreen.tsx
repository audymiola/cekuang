import { useMemo } from 'react';
import { Expense, Category, formatRupiah } from '@/lib/types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, format, eachDayOfInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CHART_COLORS = ['#2a9d8f', '#e9c46a', '#f4a261', '#e76f51', '#264653', '#a8dadc', '#457b9d', '#cdb4db'];

interface ChartsScreenProps {
  expenses: Expense[];
  categories: Category[];
}

export function ChartsScreen({ expenses, categories }: ChartsScreenProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const weeklyData = useMemo(() => {
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const total = expenses
        .filter(e => format(new Date(e.date), 'yyyy-MM-dd') === dayStr)
        .reduce((s, e) => s + e.amount, 0);
      return { day: format(day, 'EEE'), amount: total };
    });
  }, [expenses]);

  const categoryData = useMemo(() => {
    const monthExpenses = expenses.filter(e =>
      isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd })
    );
    const map = new Map<string, number>();
    monthExpenses.forEach(e => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return categories
      .filter(c => map.has(c.key))
      .map(c => ({ name: c.icon + ' ' + c.label, value: map.get(c.key) || 0 }));
  }, [expenses, categories]);

  const weekTotal = useMemo(() =>
    expenses.filter(e => isWithinInterval(new Date(e.date), { start: weekStart, end: weekEnd }))
      .reduce((s, e) => s + e.amount, 0), [expenses]);

  const monthTotal = useMemo(() =>
    expenses.filter(e => isWithinInterval(new Date(e.date), { start: monthStart, end: monthEnd }))
      .reduce((s, e) => s + e.amount, 0), [expenses]);

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Analytics</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-3.5 shadow-card">
          <p className="text-[11px] text-muted-foreground font-medium">This Week</p>
          <p className="text-lg font-bold text-foreground mt-1">{formatRupiah(weekTotal)}</p>
        </div>
        <div className="bg-card rounded-xl p-3.5 shadow-card">
          <p className="text-[11px] text-muted-foreground font-medium">This Month</p>
          <p className="text-lg font-bold text-foreground mt-1">{formatRupiah(monthTotal)}</p>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card">
        <p className="text-sm font-semibold text-foreground mb-3">Daily Spending (This Week)</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={40}
              tickFormatter={(v) => v >= 1000 ? `${v/1000}k` : v} />
            <Tooltip formatter={(v: number) => formatRupiah(v)} />
            <Bar dataKey="amount" fill="hsl(168, 56%, 42%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card">
        <p className="text-sm font-semibold text-foreground mb-3">By Category (This Month)</p>
        {categoryData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatRupiah(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {categoryData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {d.name}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No data this month</p>
        )}
      </div>
    </div>
  );
}
