import { Expense, Category, formatRupiah } from '@/lib/types';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseCardProps {
  expense: Expense;
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, categories, onEdit, onDelete }: ExpenseCardProps) {
  const [showActions, setShowActions] = useState(false);
  const cat = categories.find(c => c.key === expense.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="bg-card rounded-xl shadow-card p-3.5 flex items-center gap-3"
      onClick={() => setShowActions(!showActions)}
    >
      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-lg shrink-0">
        {cat?.icon || '📦'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{expense.title}</p>
        {expense.notes && (
          <p className="text-xs text-muted-foreground truncate">{expense.notes}</p>
        )}
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {format(new Date(expense.date), 'dd MMM yyyy')}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex gap-1 overflow-hidden"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(expense); }}
                className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-primary"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(expense.id); }}
                className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="text-sm font-bold text-foreground whitespace-nowrap">
          {formatRupiah(expense.amount)}
        </span>
      </div>
    </motion.div>
  );
}
