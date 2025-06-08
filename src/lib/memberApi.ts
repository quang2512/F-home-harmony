import { supabase } from './supabase';

const MEMEBER_SCHEMA = 'members';
const BASE_SELECTED_FIELDS = 'id, name, avatar, color, isAdmin';

export interface Member {
  id: string;
  name: string;
  password: string;
  avatar: string;
  color: string;
  isAdmin: boolean;
}

export async function fetchMembers(): Promise<Member[]> {
  const { data, error } = await supabase.from(MEMEBER_SCHEMA).select(BASE_SELECTED_FIELDS);
  if (error) throw error;
  return data as Member[];
}

export async function addMember(member: Omit<Member, 'id'>): Promise<Member> {
  const { data, error } = await supabase.from(MEMEBER_SCHEMA).insert([member]).select(BASE_SELECTED_FIELDS).single();
  if (error) throw error;
  return data as Member;
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  const { data, error } = await supabase.from(MEMEBER_SCHEMA).update(updates).eq('id', id).select(BASE_SELECTED_FIELDS).single();
  if (error) throw error;
  return data as Member;
}

export async function deleteMember(id: string): Promise<void> {
  const { error } = await supabase.from(MEMEBER_SCHEMA).delete().eq('id', id);
  if (error) throw error;
}

export async function loginMember(name: string, password: string): Promise<Member | null> {
  const { data, error } = await supabase
    .from(MEMEBER_SCHEMA)
    .select(BASE_SELECTED_FIELDS) 
    .eq('name', name)
    .eq('password', password)
    .single();
  if (error || !data) return null;
  return data as Member;
}