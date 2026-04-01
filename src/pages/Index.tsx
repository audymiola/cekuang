import { useState } from 'react';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ChartsScreen } from '@/components/ChartsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { HouseholdScreen } from '@/components/HouseholdScreen';
import { useExpenses } from '@/hooks/useExpenses';
import { useHousehold } from '@/hooks/useHousehold';
import { Expense } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Index = ({ user }: { user: User }) => {
  const { household, members, loading: householdLoading } = useHousehold(user);
  const { expenses, budget, categories, addExpense, updateExpense, deleteExpense, setBudget, addCategory, deleteCategory, updateCategoryBudget } = useExpenses(user, household?.id ?? null);
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddForm(true);
  };

  const handleSave = (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      setEditingExpense(null);
      toast({ description: "Expense updated successfully!" });
    } else {
      addExpense(data);
      toast({ description: "✓ Expense added!" });
    }
    setShowAddForm(false);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingExpense(null);
  };

  // Show loading until household is ready
  if (householdLoading) return (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <p className="text-muted-foreground text-sm">Loading harap bersabar...</p>
  </div>
);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-4 pt-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <HomeScreen expenses={expenses} categories={categories} budget={budget} onEdit={handleEdit} onDelete={deleteExpense} />
            </motion.div>
          )}
          {activeTab === 'charts' && (
            <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChartsScreen expenses={expenses} categories={categories} />
            </motion.div>
          )}
          {activeTab === 'household' && (
            <motion.div key="household" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <HouseholdScreen user={user} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <SettingsScreen budget={budget} expenses={expenses} categories={categories} onSetBudget={setBudget} onAddCategory={addCategory} onDeleteCategory={deleteCategory} onUpdateCategoryBudget={updateCategoryBudget} onSignOut={signOut} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!showAddForm && activeTab !== 'household' && (
        <button
          onClick={() => setShowAddForm(true)}
          className="fixed z-50 bottom-[76px] right-4 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center active:scale-95 transition-transform"
          style={{ right: 'max(1rem, calc((100vw - 430px) / 2 + 1rem))' }}
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-foreground/30 flex items-end justify-center"
            onClick={handleCloseForm}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-[430px] bg-card rounded-t-2xl shadow-modal max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 pb-0">
                <h2 className="text-lg font-bold text-foreground">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h2>
                <button onClick={handleCloseForm} className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                  <X size={18} />
                </button>
              </div>
              <div className="p-4">
                <ExpenseForm expense={editingExpense} categories={categories} onSave={handleSave} onCancel={handleCloseForm} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;