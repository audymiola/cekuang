import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { AuthScreen } from "@/components/AuthScreen";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Check if this is a password recovery session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (event === 'USER_UPDATED') {
        setIsPasswordRecovery(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  );

  // Show auth screen if not logged in OR if in password recovery mode
  if (!user || isPasswordRecovery) return <AuthScreen isPasswordRecovery={isPasswordRecovery} />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index user={user} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;