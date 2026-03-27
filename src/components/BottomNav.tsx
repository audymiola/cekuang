import { Home, PlusCircle, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabKey = 'home' | 'add' | 'charts' | 'settings';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'add', label: 'Add', icon: PlusCircle },
  { key: 'charts', label: 'Charts', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-elevated">
      <div className="mx-auto max-w-[430px] flex">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={cn(
              "flex-1 flex flex-col items-center gap-0.5 py-2 min-h-[56px] transition-colors",
              activeTab === key
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon size={22} strokeWidth={activeTab === key ? 2.5 : 2} />
            <span className="text-[11px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
