/*
  # Add position column to parcel_list_items

  1. Changes
    - `parcel_list_items`: add `position` (integer, nullable) to allow ordered display within a list
  2. Notes
    - Existing rows get NULL position; they will be ordered by added_at as before
    - New insertions can supply an explicit position to control order
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parcel_list_items' AND column_name = 'position'
  ) THEN
    ALTER TABLE parcel_list_items ADD COLUMN position integer;
  END IF;
END $$;
