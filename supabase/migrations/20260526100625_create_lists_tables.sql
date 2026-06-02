/*
  # Create lists and parcel_list_items tables

  1. New Tables
    - `lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, list name)
      - `created_at` (timestamptz)
    - `parcel_list_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, foreign key to lists)
      - `parcel_id` (uuid, foreign key to parcels)
      - `added_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own lists and items in those lists
*/

CREATE TABLE IF NOT EXISTS lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own lists"
  ON lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists"
  ON lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS parcel_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  parcel_id uuid NOT NULL REFERENCES parcels(id) ON DELETE CASCADE,
  added_at timestamptz DEFAULT now(),
  UNIQUE(list_id, parcel_id)
);

ALTER TABLE parcel_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items in own lists"
  ON parcel_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = parcel_list_items.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items in own lists"
  ON parcel_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = parcel_list_items.list_id
      AND lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in own lists"
  ON parcel_list_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = parcel_list_items.list_id
      AND lists.user_id = auth.uid()
    )
  );
