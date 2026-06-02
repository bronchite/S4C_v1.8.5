export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ParcelStatus = 'active' | 'archived' | 'deleted';

export interface Parcel {
  id: string;
  user_id: string;
  name: string | null;
  length: number | null;
  width: number | null;
  height: number | null;
  real_weight: number | null;
  volumetric_weight: number | null;
  status: ParcelStatus;
  created_at: string;
  updated_at: string;
}

export interface ParcelInsert {
  id?: string;
  user_id: string;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  real_weight?: number | null;
  status?: ParcelStatus;
}

export interface ParcelUpdate {
  name?: string | null;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  real_weight?: number | null;
  status?: ParcelStatus;
}
