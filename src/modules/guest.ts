// ─── Guest mode (localStorage-only parcels) ─────────────────────────────────
import { GUEST_STORAGE_KEY } from './state';

export interface GuestParcel {
  id: string;
  length: number | null;
  width: number | null;
  height: number | null;
  real_weight: number | null;
  volumetric_weight: number | null;
  status?: 'active' | 'archived' | 'deleted';
}

export function getGuestParcels(): GuestParcel[] {
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveGuestParcels(parcels: GuestParcel[]) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(parcels));
}
