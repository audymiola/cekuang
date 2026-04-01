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
      // Load household details
      const { data: hh } = await supabase
        .from('households')
        .select('*')
        .eq('id', memberRow.household_id)
        .single();

      if (hh) {
        setHousehold(hh);
        // Load members
        const { data: membersList } = await supabase
          .from('household_members')
          .select('*')
          .eq('household_id', hh.id);
        if (membersList) setMembers(membersList);
      }
    } else {
      // No household — create one for this user
      const { data: newHH } = await supabase
        .from('households')
        .insert({ admin_id: user.id, name: 'My Household' })
        .select()
        .single();

      if (newHH) {
        setHousehold(newHH);
        // Add self as member
        const { data: selfMember } = await supabase
          .from('household_members')
          .insert({ household_id: newHH.id, user_id: user.id, email: user.email! })
          .select()
          .single();
        if (selfMember) setMembers([selfMember]);
      }
    }

    setLoading(false);
  };

  const generateInviteCode = useCallback(async () => {
    if (!household) return null;
    if (members.length >= 3) return { error: 'Household is full (max 3 members)' };

    // Check if user is admin
    if (household.admin_id !== user.id) return { error: 'Only admin can invite members' };

    // Invalidate old unused codes first
    await supabase
      .from('household_invites')
      .update({ used: true })
      .eq('household_id', household.id)
      .eq('used', false);

    // Generate new code
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

    if (existing) return { error: 'You are already in a household. Leave it first before joining another.' };

    // Validate code
    const { data: invite } = await supabase
      .from('household_invites')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('used', false)
      .single();

    if (!invite) return { error: 'Invalid or expired invite code.' };
    if (new Date(invite.expires_at) < new Date()) return { error: 'This invite code has expired.' };

    // Check household capacity
    const { data: currentMembers } = await supabase
      .from('household_members')
      .select('id')
      .eq('household_id', invite.household_id);

    if (currentMembers && currentMembers.length >= 3) return { error: 'This household is already full.' };

    // Join household
    await supabase
      .from('household_members')
      .insert({ household_id: invite.household_id, user_id: user.id, email: user.email! });

    // Mark invite as used
    await supabase
      .from('household_invites')
      .update({ used: true })
      .eq('id', invite.id);

    // Reload
    await loadHousehold();
    return { success: true };
  }, [user]);

  const kickMember = useCallback(async (memberId: string) => {
    if (!household || household.admin_id !== user.id) return { error: 'Only admin can kick members' };

    await supabase
      .from('household_members')
      .delete()
      .eq('id', memberId)
      .neq('user_id', household.admin_id); // Can't kick admin

    setMembers(prev => prev.filter(m => m.id !== memberId));
    return { success: true };
  }, [household, user]);

  const leaveHousehold = useCallback(async () => {
    if (!household) return;
    if (household.admin_id === user.id) {
      // Admin leaving — dissolve household if alone, else transfer
      if (members.length === 1) {
        await supabase.from('households').delete().eq('id', household.id);
      } else {
        // Transfer admin to next member
        const nextAdmin = members.find(m => m.user_id !== user.id);
        if (nextAdmin) {
          await supabase.from('households').update({ admin_id: nextAdmin.user_id }).eq('id', household.id);
        }
        await supabase.from('household_members').delete().eq('user_id', user.id).eq('household_id', household.id);
      }
    } else {
      await supabase.from('household_members').delete().eq('user_id', user.id).eq('household_id', household.id);
    }

    setHousehold(null);
    setMembers([]);
    await loadHousehold(); // Will create a new personal household
  }, [household, members, user]);

  return { household, members, loading, generateInviteCode, joinHousehold, kickMember, leaveHousehold };
}