import type { SupabaseClient } from '@supabase/supabase-js';

export type ProfileRole = 'buyer' | 'seller' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: ProfileRole;
  region: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, phone, role, region, avatar_url, status, created_at, updated_at')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  fullName: string,
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: fullName,
      role: 'buyer',
      status: 'active',
    })
    .select('id, email, full_name, phone, role, region, avatar_url, status, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'region' | 'avatar_url'>>,
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id, email, full_name, phone, role, region, avatar_url, status, created_at, updated_at')
    .single();

  if (error) throw error;
  return data as Profile;
}
