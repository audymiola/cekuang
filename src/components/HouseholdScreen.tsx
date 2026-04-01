import { useState } from 'react';
import { Household, HouseholdMember } from '@/hooks/useHousehold';
import { User } from '@supabase/supabase-js';
import { Users, Copy, UserMinus, LogOut, Crown, Clock, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HouseholdScreenProps {
  user: User;
  household: Household | null;
  members: HouseholdMember[];
  activeInviteCode: string | null;
  activeInviteExpiry: string | null;
  onCreateHousehold: (name: string) => Promise<{ error?: string; success?: boolean } | undefined>;
  onDeleteHousehold: () => Promise<{ error?: string; success?: boolean } | undefined>;
  onGenerateInviteCode: () => Promise<{ error?: string; code?: string; expires_at?: string } | undefined>;
  onJoinHousehold: (code: string) => Promise<{ error?: string; success?: boolean } | undefined>;
  onKickMember: (memberId: string) => Promise<{ error?: string; success?: boolean } | undefined>;
  onLeaveHousehold: () => Promise<void>;
}

export function HouseholdScreen({
  user, household, members, activeInviteCode, activeInviteExpiry,
  onCreateHousehold, onDeleteHousehold, onGenerateInviteCode,
  onJoinHousehold, onKickMember, onLeaveHousehold
}: HouseholdScreenProps) {
  const [joinCode, setJoinCode] = useState('');
  const [householdName, setHouseholdName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);

  const isAdmin = household?.admin_id === user.id;
  const isFull = members.length >= 3;
  const inviteExpiry = activeInviteExpiry ? new Date(activeInviteExpiry).toLocaleString('id-ID') : '';

  const handleCreate = async () => {
    if (!householdName.trim()) return;
    setLoading(true);
    setError('');
    const result = await onCreateHousehold(householdName.trim());
    if (result?.error) setError(result.error);
    else { setMessage('Household created!'); setShowCreateForm(false); setHouseholdName(''); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Delete household? All members will be removed but expenses will remain.')) return;
    setLoading(true);
    await onDeleteHousehold();
    setLoading(false);
  };

  const handleGenerateInvite = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    const result = await onGenerateInviteCode();
    if (result?.error) setError(result.error);
    setLoading(false);
  };

  const handleCopy = () => {
    const link = `${window.location.origin}/?invite=${activeInviteCode}`;
    navigator.clipboard.writeText(link);
    setMessage('Invite link copied!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    setError('');
    const result = await onJoinHousehold(joinCode.trim());
    if (result?.error) setError(result.error);
    else { setMessage('Successfully joined!'); setShowJoinForm(false); setJoinCode(''); }
    setLoading(false);
  };

  const handleKick = async (memberId: string, email: string) => {
    if (!confirm(`Remove ${email} from household?`)) return;
    const result = await onKickMember(memberId);
    if (result?.error) setError(result.error);
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave?')) return;
    await onLeaveHousehold();
  };

  if (!household) {
    return (
      <div className="space-y-5">
        <h1 className="text-xl font-bold text-foreground">Household</h1>

        <div className="bg-card rounded-xl p-4 shadow-card">
          <p className="text-sm text-muted-foreground">
            You're tracking expenses solo. Create or join a household to share expenses.
          </p>
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plus size={15} /> Create a Household
          </p>
          {!showCreateForm ? (
            <Button onClick={() => { setShowCreateForm(true); setShowJoinForm(false); }} className="w-full h-11 font-semibold">
              Create Household
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Household name (e.g. Our Family)"
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                className="h-10 text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={handleCreate} disabled={loading} className="flex-1 h-10 font-semibold">
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users size={15} /> Join a Household
          </p>
          {!showJoinForm ? (
            <Button variant="outline" onClick={() => { setShowJoinForm(true); setShowCreateForm(false); }} className="w-full h-11 font-semibold">
              Join with Invite Code
            </Button>
          ) : (
            <div className="space-y-2">
              <Input
                placeholder="Enter invite code (e.g. ABC123)"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                className="h-10 text-sm uppercase tracking-widest"
                maxLength={6}
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowJoinForm(false)} className="flex-1 h-10">Cancel</Button>
                <Button onClick={handleJoin} disabled={loading} className="flex-1 h-10 font-semibold">
                  {loading ? 'Joining...' : 'Join'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-destructive px-1">{error}</p>}
        {message && <p className="text-xs text-green-600 px-1">{message}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Household</h1>
        <span className="text-sm font-medium text-muted-foreground">{household.name}</span>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Users size={15} /> Members ({members.length}/3)
        </p>
        <div className="space-y-2">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {household.admin_id === member.user_id && <Crown size={13} className="text-amber-500 shrink-0" />}
                <span className="text-sm text-foreground truncate">{member.email}</span>
                {member.user_id === user.id && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium shrink-0">You</span>
                )}
              </div>
              {isAdmin && member.user_id !== user.id && (
                <button onClick={() => handleKick(member.id, member.email)}
                  className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                  <UserMinus size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isAdmin && !isFull && (
        <div className="bg-card rounded-xl p-4 shadow-card space-y-3">
          <p className="text-sm font-semibold text-foreground">Invite Member</p>
          <Button onClick={handleGenerateInvite} disabled={loading} className="w-full h-11 font-semibold">
            {loading ? 'Generating...' : activeInviteCode ? 'Regenerate Invite Code' : 'Generate Invite Code'}
          </Button>
          {activeInviteCode && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                <span className="text-xl font-mono font-bold text-primary flex-1 tracking-widest">{activeInviteCode}</span>
                <button onClick={handleCopy} className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Copy size={14} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={11} /> Expires: {inviteExpiry}
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

      {error && <p className="text-xs text-destructive px-1">{error}</p>}
      {message && <p className="text-xs text-green-600 px-1">{message}</p>}

      {!isAdmin && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <button onClick={handleLeave}
            className="w-full h-11 rounded-xl border border-destructive/40 text-destructive font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <LogOut size={16} /> Leave Household
          </button>
        </div>
      )}

      {isAdmin && (
        <div className="bg-card rounded-xl p-4 shadow-card">
          <button onClick={handleDelete}
            className="w-full h-11 rounded-xl border border-destructive/40 text-destructive font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <Trash2 size={16} /> Delete Household
          </button>
        </div>
      )}
    </div>
  );
}