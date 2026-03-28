import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';

type Screen = 'login' | 'signup' | 'forgot';

export function AuthScreen() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [screen, setScreen] = useState<Screen>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setError(''); setMessage(''); setEmail(''); setPassword(''); };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (!email) { setError('Please enter your email.'); return; }
    if (screen !== 'forgot' && !password) { setError('Please enter your password.'); return; }
    if (screen !== 'forgot' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);

    if (screen === 'login') {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else if (screen === 'signup') {
      const { error } = await signUp(email, password);
      if (error) setError(error.message);
      else setMessage('Account created! Please check your email to confirm, then log in.');
    } else if (screen === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) setError(error.message);
      else setMessage('Password reset email sent! Check your inbox.');
    }

    setLoading(false);
  };

  const getTitle = () => {
    if (screen === 'login') return 'Welcome back';
    if (screen === 'signup') return 'Create account';
    return 'Reset password';
  };

  const getButtonLabel = () => {
    if (loading) return 'Please wait...';
    if (screen === 'login') return 'Log In';
    if (screen === 'signup') return 'Sign Up';
    return 'Send Reset Email';
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
          <h2 className="text-lg font-bold text-foreground mb-5">{getTitle()}</h2>

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

            {screen !== 'forgot' && (
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
            )}

            {screen === 'login' && (
              <div className="flex justify-end">
                <button
                  onClick={() => { reset(); setScreen('forgot'); }}
                  className="text-xs text-primary font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
          {message && <p className="text-xs text-green-600 mt-3">{message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-5 active:scale-95 transition-transform disabled:opacity-60"
          >
            {getButtonLabel()}
          </button>

          <div className="text-center text-sm text-muted-foreground mt-4 space-y-1">
            {screen === 'login' && (
              <p>Don't have an account?{' '}
                <button onClick={() => { reset(); setScreen('signup'); }} className="text-primary font-semibold">Sign Up</button>
              </p>
            )}
            {screen === 'signup' && (
              <p>Already have an account?{' '}
                <button onClick={() => { reset(); setScreen('login'); }} className="text-primary font-semibold">Log In</button>
              </p>
            )}
            {screen === 'forgot' && (
              <p>Remember your password?{' '}
                <button onClick={() => { reset(); setScreen('login'); }} className="text-primary font-semibold">Log In</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}