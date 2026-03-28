import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage('Account created! Please check your email to confirm, then log in.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[390px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-elevated">
            <Wallet size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CekUang</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily expenses</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
          {message && <p className="text-xs text-green-600 mt-3">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-5 active:scale-95 transition-transform disabled:opacity-60"
          >
            {loading ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
          </button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); setMessage(''); }}
              className="text-primary font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}