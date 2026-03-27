import { formatRupiah } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle, XCircle } from 'lucide-react';

interface BudgetBarProps {
  budget: number;
  spent: number;
}

export function BudgetBar({ budget, spent }: BudgetBarProps) {
  if (budget <= 0) return null;

  const percentage = Math.min((spent / budget) * 100, 100);
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = spent >= budget;

  return (
    <div className="space-y-2">
      {isExceeded && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive font-medium">
          <XCircle size={16} />
          Budget exceeded!
        </div>
      )}
      {isWarning && !isExceeded && (
        <div className="flex items-center gap-2 rounded-lg bg-warning-bg px-3 py-2 text-sm text-warning-foreground font-medium">
          <AlertTriangle size={16} />
          Approaching budget limit
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatRupiah(spent)} spent</span>
        <span>{formatRupiah(budget)} budget</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isExceeded ? "bg-destructive" : isWarning ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
