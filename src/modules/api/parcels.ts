// ─── Parcels data layer ─────────────────────────────────────────────────────
import { supabase } from '../../../lib/supabase';
import type { Parcel, ParcelInsert } from '../../../lib/types';
import { currentUser } from '../state';
import type { GuestParcel } from '../guest';

export async function fetchParcels(status: Parcel['status']): Promise<Parcel[]> {
  if (!currentUser) return [];
  const { data, error } = await supabase
    .from('parcels').select('*')
    .eq('user_id', currentUser).eq('status', status)
    .order('position', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });
  if (error) { console.error('fetchParcels:', error); return []; }
  return (data || []) as Parcel[];
}

export async function createParcelFromGuest(parcel: GuestParcel): Promise<Parcel | null> {
  const insertData: ParcelInsert = {
    user_id: currentUser!, length: parcel.length, width: parcel.width,
    height: parcel.height, real_weight: parcel.real_weight, status: 'active',
  };
  const { data, error } = await supabase
    .from('parcels').insert(insertData as unknown as Record<string, unknown>)
    .select().single();
  if (error) { console.error('createParcelFromGuest:', error); return null; }
  return data as Parcel;
}

export async function updateParcelDb(
  id: string,
  data: Partial<GuestParcel> & { name?: string | null }
): Promise<boolean> {
  const { error } = await supabase
    .from('parcels').update(data as unknown as Record<string, unknown>).eq('id', id);
  if (error) { console.error('updateParcelDb:', error); return false; }
  return true;
}

export async function emptyTrashDb(): Promise<boolean> {
  if (!currentUser) return false;
  const { error } = await supabase
    .from('parcels').delete().eq('user_id', currentUser).eq('status', 'deleted');
  if (error) { console.error('emptyTrashDb:', error); return false; }
  return true;
}

export async function deleteParcelDb(id: string): Promise<boolean> {
  const { error } = await supabase.from('parcels').delete().eq('id', id);
  if (error) { console.error('deleteParcelDb:', error); return false; }
  return true;
}

/** Insert a new parcel immediately after `sourceIndex`, respecting position gaps. */
export async function insertParcelAfterIndex(
  parcels: Parcel[],
  sourceIndex: number,
  extraFields: Partial<ParcelInsert> = {}
): Promise<Parcel | null> {
  const source = parcels[sourceIndex];
  const sourcePos: number = (source as any).position ?? (sourceIndex + 1) * 10;
  const next = parcels[sourceIndex + 1];
  const nextPos: number = next ? ((next as any).position ?? (sourceIndex + 2) * 10) : sourcePos + 20;
  let newPos = Math.round((sourcePos + nextPos) / 2);

  if (newPos === sourcePos || newPos === nextPos) {
    for (let i = 0; i < parcels.length; i++)
      await supabase.from('parcels').update({ position: (i + 1) * 10 }).eq('id', parcels[i].id);
    newPos = sourcePos + 5;
  }

  const insertData: ParcelInsert = {
    user_id: currentUser!, length: source.length, width: source.width,
    height: source.height, real_weight: source.real_weight, status: 'active',
    ...extraFields,
  };
  const { data, error } = await supabase
    .from('parcels')
    .insert({ ...insertData, position: newPos } as unknown as Record<string, unknown>)
    .select().single();
  if (error || !data) return null;
  return data as Parcel;
}
