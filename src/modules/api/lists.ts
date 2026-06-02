// ─── Lists data layer ───────────────────────────────────────────────────────
import { supabase } from '../../../lib/supabase';
import type { Parcel } from '../../../lib/types';
import { currentUser } from '../state';

export interface ParcelList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export async function fetchLists(): Promise<ParcelList[]> {
  if (!currentUser) return [];
  const { data, error } = await supabase
    .from('lists').select('*').eq('user_id', currentUser)
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data || []) as ParcelList[];
}

export async function createList(name: string): Promise<ParcelList | null> {
  if (!currentUser) return null;
  const { data, error } = await supabase
    .from('lists').insert({ user_id: currentUser, name }).select().single();
  if (error) return null;
  return data as ParcelList;
}

export async function addParcelToList(listId: string, parcelId: string): Promise<boolean> {
  const { error } = await supabase
    .from('parcel_list_items').insert({ list_id: listId, parcel_id: parcelId });
  return !error;
}

export async function fetchParcelsInList(listId: string): Promise<Parcel[]> {
  if (!currentUser) return [];
  const { data, error } = await supabase
    .from('parcel_list_items')
    .select('parcel_id, position, parcels(*)')
    .eq('list_id', listId)
    .order('position', { ascending: true, nullsFirst: false })
    .order('added_at', { ascending: true });
  if (error) return [];
  return (data || []).map((item: any) => item.parcels).filter(Boolean) as Parcel[];
}

export async function removeParcelFromList(listId: string, parcelId: string): Promise<boolean> {
  const { error } = await supabase
    .from('parcel_list_items').delete()
    .eq('list_id', listId).eq('parcel_id', parcelId);
  return !error;
}

export async function deleteList(listId: string): Promise<boolean> {
  const { error } = await supabase.from('lists').delete().eq('id', listId);
  return !error;
}
