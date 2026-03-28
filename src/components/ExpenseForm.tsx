import { useState, useEffect } from 'react';
import { Expense, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  expense?: Expense | null;
  categories: Category[];
  onSave: (data: Omit<Expense, 'id'>) => void;
  onCancel?: () => void;
}

// Format number to Indonesian dot-separated format
const formatInput = (val: string): string => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
};

const parseInput = (val: string): number => {
  return Number(val.replace(/\./g, ''));
};

export function ExpenseForm({ expense, categories, onSave, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState('');
  const [amountDisplay, setAmountDisplay] = useState('');
  const [category, setCategory] = useState(categories[0]?.key || '');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmountDisplay(formatInput(String(expense.amount)));
      setCategory(expense.category);
      setDate(format(new Date(expense.date), 'yyyy-MM-dd'));
      setNotes(expense.notes || '');
    }
  }, [expense]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmountDisplay(formatInput(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInput(amountDisplay);
    if (!title.trim() || !amount) return;
    onSave({
      title: title.trim(),
      amount,
      category,
      date: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });
    if (!expense) {
      setTitle('');
      setAmountDisplay('');
      setCategory(categories[0]?.key || '');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setNotes('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="e.g. Lunch"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="h-12"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount (Rp)</Label>
        <Input
          id="amount"
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountDisplay}
          onChange={handleAmountChange}
          className="h-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <div className="grid grid-cols-4 gap-2">
          {categories.map(c => (
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
        <Input
          id="date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-12"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add a memo..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
        />
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