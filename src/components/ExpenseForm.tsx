import { useState, useEffect } from 'react';
import { Expense, CategoryKey, CATEGORIES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  expense?: Expense | null;
  onSave: (data: Omit<Expense, 'id'>) => void;
  onCancel?: () => void;
}

export function ExpenseForm({ expense, onSave, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryKey>('food');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;
    onSave({
      title: title.trim(),
      amount: Number(amount),
      category,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });
    if (!expense) {
      setTitle(''); setAmount(''); setCategory('food');
      setDate(format(new Date(), 'yyyy-MM-dd')); setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Lunch" value={title} onChange={e => setTitle(e.target.value)} className="h-12" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (Rp)</Label>
        <Input id="amount" type="number" placeholder="0" min="0" value={amount} onChange={e => setAmount(e.target.value)} className="h-12" required />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              type="button"
              onClick={() => setCategory(c.key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2.5 text-xs font-medium transition-all min-h-[56px]",
                category === c.key
                  ? "bg-accent text-accent-foreground ring-2 ring-primary"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              <span className="text-lg">{c.icon}</span>
              <span className="truncate w-full text-center text-[10px]">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="h-12" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" placeholder="Add a memo..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12">
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1 h-12 font-semibold">
          {expense ? 'Update' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
}
