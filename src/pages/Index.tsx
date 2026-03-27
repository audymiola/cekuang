import { useState } from 'react';
import { BottomNav, TabKey } from '@/components/BottomNav';
import { HomeScreen } from '@/components/HomeScreen';
import { ExpenseForm } from '@/components/ExpenseForm';
import { ChartsScreen } from '@/components/ChartsScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { useExpenses } from '@/hooks/useExpenses';
import { Expense } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

const Index = () => {
  const { expenses, budget, addExpense, updateExpense, deleteExpense, setBudget } = useExpenses();
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setActiveTab('add');
  };

  const handleSave = (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, data);
      setEditingExpense(null);
    } else {
      addExpense(data);
    }
    setActiveTab('home');
  };

  const handleTabChange = (tab: TabKey) => {
    if (tab !== 'add') setEditingExpense(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[430px] px-4 pt-6 pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <HomeScreen expenses={expenses} budget={budget} onEdit={handleEdit} onDelete={deleteExpense} />
            </motion.div>
          )}
          {activeTab === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-foreground">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h1>
                {editingExpense && (
                  <button onClick={() => { setEditingExpense(null); setActiveTab('home'); }}
                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground">
                    <X size={18} />
                  </button>
                )}
              </div>
              <div className="bg-card rounded-xl p-4 shadow-card">
                <ExpenseForm
                  expense={editingExpense}
                  onSave={handleSave}
                  onCancel={editingExpense ? () => { setEditingExpense(null); setActiveTab('home'); } : undefined}
                />
              </div>
            </motion.div>
          )}
          {activeTab === 'charts' && (
            <motion.div key="charts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChartsScreen expenses={expenses} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <SettingsScreen budget={budget} expenses={expenses} onSetBudget={setBudget} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Index;
