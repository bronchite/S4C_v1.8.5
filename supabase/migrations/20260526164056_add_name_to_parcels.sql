/*
  # Add name column to parcels table

  1. Modified Tables
    - `parcels`
      - `name` (text, nullable) — optional user-defined label for the parcel

  2. Notes
    - Existing rows will have NULL name, displayed as "Colis #N" in the UI
    - No RLS changes needed, existing policies cover the new column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parcels' AND column_name = 'name'
  ) THEN
    ALTER TABLE parcels ADD COLUMN name text DEFAULT NULL;
  END IF;
END $$;
