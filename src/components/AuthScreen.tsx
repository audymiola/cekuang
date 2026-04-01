import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Wallet } from 'lucide-react';

type Screen = 'login' | 'signup' | 'forgot' | 'reset';

interface AuthScreenProps {
  isPasswordRecovery?: boolean;
}

export function AuthScreen({ isPasswordRecovery }: AuthScreenProps) {
  const { signIn, signUp, resetPassword } = useAuth();
  const [screen, setScreen] = useState<Screen>(isPasswordRecovery ? 'reset' : 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  useEffect(() => {
    if (isPasswordRecovery) { setScreen('reset'); return; }

    // Detect invite code from URL
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCode(invite);
      setScreen('signup');
    }

    // Detect password recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setScreen('reset');
    });
    return () => subscription.unsubscribe();
  }, [isPasswordRecovery]);

  const reset = () => { setError(''); setMessage(''); setEmail(''); setPassword(''); };

  const handleResetPassword = async () => {
    setError('');
    if (!newPassword || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setError(error.message);
    else {
      setMessage('Password updated! Redirecting to login...');
      await supabase.auth.signOut();
      setTimeout(() => setScreen('login'), 2000);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    if (!email) { setError('Please enter your email.'); return; }
    if (screen !== 'forgot' && !password) { setError('Please enter your password.'); return; }
    if (screen !== 'forgot' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);

    if (screen === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        // Check for pending invite code after login
        const pendingCode = localStorage.getItem('pendingInviteCode');
        if (pendingCode) {
          localStorage.removeItem('pendingInviteCode');
          localStorage.setItem('joinAfterLogin', pendingCode);
        }
      }
    } else if (screen === 'signup') {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message);
      } else {
        if (inviteCode) {
          localStorage.setItem('pendingInviteCode', inviteCode);
        }
        setMessage('Account created! Please check your email to confirm, then log in.');
      }
    } else if (screen === 'forgot') {
      const { error } = await resetPassword(email);
      if (error) setError(error.message);
      else setMessage('Password reset email sent! Check your inbox.');
    }

    setLoading(false);
  };

  const getTitle = () => {
    if (screen === 'login') return 'Welcome back';
    if (screen === 'signup') return inviteCode ? '🎉 You\'re invited!' : 'Create account';
    if (screen === 'forgot') return 'Reset password';
    return 'Set new password';
  };

  const getButtonLabel = () => {
    if (loading) return 'Please wait...';
    if (screen === 'login') return 'Log In';
    if (screen === 'signup') return 'Sign Up';
    if (screen === 'forgot') return 'Send Reset Email';
    return 'Update Password';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[390px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3 shadow-elevated">
            <Wallet size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">CekUang</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily expenses</p>
        </div>

        <div className="bg-card rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-bold text-foreground mb-5">{getTitle()}</h2>

          {screen === 'reset' ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                />
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              {message && <p className="text-xs text-green-600 mt-1">{message}</p>}
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-2 active:scale-95 transition-transform disabled:opacity-60"
              >
                {getButtonLabel()}
              </button>
            </div>
          ) : (
            <div className="space-y-3">

              {/* Invite code banner */}
              {screen === 'signup' && inviteCode && (
                <div className="p-3 bg-primary/10 rounded-xl">
                  <p className="text-xs text-primary font-medium">
                    You'll join a household after signing up. Code: <span className="font-bold">{inviteCode}</span>
                  </p>
                </div>
              )}

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
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              {message && <p className="text-xs text-green-600 mt-1">{message}</p>}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm mt-2 active:scale-95 transition-transform disabled:opacity-60"
              >
                {getButtonLabel()}
              </button>
              <div className="text-center text-sm text-muted-foreground mt-2">
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
          )}
        </div>
      </div>
    </div>
  );
}