/*
  # Create parcels table

  1. New Tables
    - `parcels`
      - `id` (uuid, primary key, auto-generated)
      - `user_id` (uuid, references auth.users for ownership)
      - `length` (numeric, length in cm)
      - `width` (numeric, width in cm)
      - `height` (numeric, height in cm)
      - `real_weight` (numeric, real weight in kg)
      - `volumetric_weight` (numeric, calculated volumetric weight)
      - `status` (text: 'active', 'archived', 'deleted')
      - `created_at` (timestamp, auto-generated)
      - `updated_at` (timestamp, auto-updated)

  2. Security
    - Enable RLS on `parcels` table
    - Policy: Users can only CRUD their own parcels

  3. Notes
    - Conversion factor for volumetric weight: 5000
    - Status values: 'active' (current), 'archived' (saved), 'deleted' (trash)
*/

CREATE TABLE IF NOT EXISTS parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  length numeric(10,2),
  width numeric(10,2),
  height numeric(10,2),
  real_weight numeric(10,3),
  volumetric_weight numeric(10,3) GENERATED ALWAYS AS (
    CASE 
      WHEN length IS NOT NULL AND width IS NOT NULL AND height IS NOT NULL 
      THEN (length * width * height) / 5000 
      ELSE NULL 
    END
  ) STORED,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE parcels ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own parcels
CREATE POLICY "Users can view own parcels"
  ON parcels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own parcels
CREATE POLICY "Users can insert own parcels"
  ON parcels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own parcels
CREATE POLICY "Users can update own parcels"
  ON parcels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own parcels
CREATE POLICY "Users can delete own parcels"
  ON parcels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster queries by user and status
CREATE INDEX IF NOT EXISTS idx_parcels_user_status ON parcels(user_id, status);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_parcels_updated_at
  BEFORE UPDATE ON parcels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
