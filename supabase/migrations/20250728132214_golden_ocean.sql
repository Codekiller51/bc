/*
  # Add Portfolio Management Features

  1. Tables
    - Ensure portfolio_items table exists with proper structure
    - Add storage bucket for portfolio images

  2. Security
    - Enable RLS on portfolio_items
    - Add policies for portfolio management

  3. Storage
    - Create storage buckets for avatars and portfolio images
*/

-- Ensure portfolio_items table exists with proper structure
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_items
DROP POLICY IF EXISTS "Public can view portfolio items" ON portfolio_items;
DROP POLICY IF EXISTS "Creatives can manage own portfolio" ON portfolio_items;

CREATE POLICY "Public can view portfolio items"
  ON portfolio_items
  FOR SELECT
  USING (true);

CREATE POLICY "Creatives can manage own portfolio"
  ON portfolio_items
  FOR ALL
  TO authenticated
  USING (
    creative_id IN (
      SELECT id FROM creative_profiles
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    creative_id IN (
      SELECT id FROM creative_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for portfolio bucket
DROP POLICY IF EXISTS "Portfolio images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Creatives can upload portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Creatives can update portfolio images" ON storage.objects;
DROP POLICY IF EXISTS "Creatives can delete portfolio images" ON storage.objects;

CREATE POLICY "Portfolio images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio');

CREATE POLICY "Creatives can upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio' AND
    EXISTS (
      SELECT 1 FROM creative_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creatives can update portfolio images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    EXISTS (
      SELECT 1 FROM creative_profiles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Creatives can delete portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    EXISTS (
      SELECT 1 FROM creative_profiles
      WHERE user_id = auth.uid()
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolio_items_creative_id ON portfolio_items(creative_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_created_at ON portfolio_items(created_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_portfolio_items_updated_at ON portfolio_items;
CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();