/*
  # Add position column to parcels table

  Adds a `position` integer column to control display order of parcels.
  Existing rows get their position set based on their created_at order (ascending).
  New parcels default to NULL (appended last when NULL).

  1. Changes
    - `parcels`: add `position` integer column, nullable
    - Backfill existing rows with sequential positions based on created_at order per user

  2. Notes
    - fetchParcels will need to order by position ASC NULLS LAST, then created_at ASC
*/

ALTER TABLE parcels ADD COLUMN IF NOT EXISTS position integer;

-- Backfill: assign positions by created_at order per user
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) * 10 AS pos
  FROM parcels
)
UPDATE parcels SET position = ranked.pos FROM ranked WHERE parcels.id = ranked.id;
