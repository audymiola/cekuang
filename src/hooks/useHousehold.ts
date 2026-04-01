import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface HouseholdMember {
  id: string;
  user_id: string;
  email: string;
  joined_at: string;
}

export interface Household {
  id: string;
  name: string;
  admin_id: string;
}

export function useHousehold(user: User) {
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadHousehold();
  }, [user]);

  const loadHousehold = async () => {
    setLoading(true);

    // Check if user is a member of any household
    const { data: memberRow } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single();

    if (memberRow) {
      const { data: hh } = await supabase
        .from('households')
        .select('*')
        .eq('id', memberRow.household_id)
        .single();

      if (hh) {
        setHousehold(hh);
        const { data: membersList } = await supabase
          .from('household_members')
          .select('*')
          .eq('household_id', hh.id);
        if (membersList) setMembers(membersList);
      }
    } else {
      // No household — that's fine, solo mode
      setHousehold(null);
      setMembers([]);
    }

    setLoading(false);
  };

  const createHousehold = useCallback(async (name: string) => {
    // Create household
    const { data: newHH, error } = await supabase
      .from('households')
      .insert({ admin_id: user.id, name })
      .select()
      .single();

    if (error) return { error: error.message };

    // Add self as member
    await supabase
      .from('household_members')
      .insert({ household_id: newHH.id, user_id: user.id, email: user.email! });

    await loadHousehold();
    return { success: true };
  }, [user]);

  const deleteHousehold = useCallback(async () => {
    if (!household) return;
    if (household.admin_id !== user.id) return { error: 'Only admin can delete household' };

    // Delete all members first
    await supabase.from('household_members').delete().eq('household_id', household.id);
    // Delete household (expenses stay, household_id just becomes orphaned)
    await supabase.from('households').delete().eq('id', household.id);

    setHousehold(null);
    setMembers([]);
    return { success: true };
  }, [household, user]);

  const generateInviteCode = useCallback(async () => {
    if (!household) return { error: 'No household found' };
    if (members.length >= 3) return { error: 'Household is full (max 3 members)' };
    if (household.admin_id !== user.id) return { error: 'Only admin can invite members' };

    // Invalidate old unused codes
    await supabase
      .from('household_invites')
      .update({ used: true })
      .eq('household_id', household.id)
      .eq('used', false);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('household_invites')
      .insert({ household_id: household.id, code, created_by: user.id, expires_at })
      .select()
      .single();

    if (error) return { error: error.message };
    return { code: data.code, expires_at: data.expires_at };
  }, [household, members, user]);

  const joinHousehold = useCallback(async (code: string) => {
    // Check if user already in a household
    const { data: existing } = await supabase
      .from('household_members')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) return { error: 'You are already in a household. Leave it first.' };

    // Validate code
    const { data: invite } = await supabase
      .from('household_invites')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .single();

    if (!invite) return { error: 'Invalid or expired invite code.' };
    if (new Date(invite.expires_at) < new Date()) return { error: 'This invite code has expired.' };

    // Check capacity
    const { data: currentMembers } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', invite.household_id);

    if (currentMembers && currentMembers.length >= 3) return { error: 'This household is already full.' };

    // Join
    await supabase
      .from('household_members')
      .insert({ household_id: invite.household_id, user_id: user.id, email: user.email! });

    // Mark invite used
    await supabase
      .from('household_invites')
      .update({ used: true })
      .eq('id', invite.id);

    await loadHousehold();
    return { success: true };
  }, [user]);

  const kickMember = useCallback(async (memberId: string) => {
    if (!household || household.admin_id !== user.id) return { error: 'Only admin can kick members' };

    await supabase
      .from('household_members')
      .delete()
      .eq('id', memberId);

    setMembers(prev => prev.filter(m => m.id !== memberId));
    return { success: true };
  }, [household, user]);

  const leaveHousehold = useCallback(async () => {
    if (!household) return;
    await supabase
      .from('household_members')
      .delete()
      .eq('user_id', user.id)
      .eq('household_id', household.id);

    setHousehold(null);
    setMembers([]);
  }, [household, user]);

  return { household, members, loading, createHousehold, deleteHousehold, generateInviteCode, joinHousehold, kickMember, leaveHousehold };
}