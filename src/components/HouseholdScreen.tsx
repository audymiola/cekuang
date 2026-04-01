import { useState } from 'react';
import { useHousehold } from '@/hooks/useHousehold';
import { User } from '@supabase/supabase-js';
import { Users, Copy, UserMinus, LogOut, Crown, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface HouseholdScreenProps {
  user: User;
}

export function HouseholdScreen({ user }: HouseholdScreenProps) {
  const { household, members, generateInviteCode, joinHousehold, kickMember, leaveHousehold } = useHousehold(user);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const isAdmin = household?.admin_id === user.id;
  const isFull = members.length >= 3;

  const handleGenerateInvite = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const result = await generateInviteCode();
    if (result?.error) setError(result.error);
    else if (result?.code) {
      setInviteCode(result.code);
      setInviteExpiry(new Date(result.expires_at).toLocaleString('id-ID'));
      setMessage('');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    const link = `${window.location.origin}/?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    setMessage('Invite link copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    const result = await joinHousehold(joinCode.trim());
    if (result?.error) setError(result.error);
    else setMessage('Successfully joined household!');
    setLoading(false);
  };

  const handleKick = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from household?`)) return;
    const result = await kickMember(memberId);
    if (result?.error) setError(result.error);
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this household?')) return;
    await leaveHousehold();
  };

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-foreground">Household</h1>

      {/* Members list */}
      <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users size={15} /> Members ({members.length}/3)
          </p>
          {!isAdmin && (
            <button
              onClick={() => setShowJoinForm(!showJoinForm)}
              className="text-xs text-primary font-medium"
            >
              Join a household
            </button>
          )}
        </div>

        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                {household?.admin_id === member.user_id && (
                  <Crown size={13} className="text-amber-500 shrink-0" />
                )}
                <span className="text-sm text-foreground truncate">{member.email}</span>
                {member.user_id === user.id && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">You</span>
                )}
              </div>
              {isAdmin && member.user_id !== user.id && (
                <button
                  onClick={() => handleKick(member.id, member.email)}
                  className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center text-destructive shrink-0"
                >
                  <UserMinus size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Join form for non-admin */}
        {showJoinForm && !isAdmin && (
          <div className="space-y-2 pt-1">
            <Input
              placeholder="Enter invite code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="h-10 text-sm uppercase"
              maxLength={6}
            />
            <Button onClick={handleJoin} disabled={loading} size="sm" className="w-full h-10 font-semibold">
              {loading ? 'Joining...' : 'Join Household'}
            </Button>
          </div>
        )}
      </div>

      {/* Invite section — admin only */}
      {isAdmin && !isFull && (
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold text-foreground">Invite Member</p>
          <Button
            onClick={handleGenerateInvite}
            disabled={loading}
            className="w-full h-11 font-semibold"
          >
            {loading ? 'Generating...' : 'Generate Invite Code'}
          </Button>

          {inviteCode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <span className="text-lg font-mono font-bold text-primary flex-1 tracking-widest">{inviteCode}</span>
                <button onClick={handleCopy} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} /> Expires: {inviteExpiry}
              </p>
              <p className="text-xs text-muted-foreground">
                Share the code or copy the invite link. Single use, valid 24 hours.
              </p>
            </div>
          )}
        </div>
      )}

      {isFull && isAdmin && (
        <div className="bg-secondary rounded-xl p-4 text-sm text-muted-foreground text-center">
          Household is full (3/3 members)
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
      {message && <p className="text-xs text-green-600">{message}</p>}

      {/* Leave household — non-admin only */}
      {!isAdmin && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <button
            onClick={handleLeave}
            className="w-full h-11 rounded-xl border border-destructive/40 text-destructive font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <LogOut size={16} />
            Leave Household
          </button>
        </div>
      )}
    </div>
  );
}