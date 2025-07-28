/*
  # Fix Schema Consistency and Relationships

  1. Schema Fixes
    - Ensure proper table relationships
    - Fix foreign key constraints
    - Standardize column names and types
    - Add missing indexes

  2. Data Integrity
    - Add proper constraints
    - Fix cascading deletes
    - Ensure referential integrity

  3. Performance
    - Add missing indexes
    - Optimize query performance
*/

-- Fix creative_profiles table structure
DO $$
BEGIN
  -- Add missing columns if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creative_profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE creative_profiles ADD COLUMN location TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creative_profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE creative_profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creative_profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE creative_profiles ADD COLUMN email TEXT;
  END IF;
END $$;

-- Fix client_profiles table structure
DO $$
BEGIN
  -- Ensure avatar_url column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'client_profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE client_profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Create missing tables if they don't exist
CREATE TABLE IF NOT EXISTS creative_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  recurring_availability JSONB NOT NULL DEFAULT '{
    "0": {"start": "09:00", "end": "17:00", "isAvailable": false},
    "1": {"start": "09:00", "end": "17:00", "isAvailable": true},
    "2": {"start": "09:00", "end": "17:00", "isAvailable": true},
    "3": {"start": "09:00", "end": "17:00", "isAvailable": true},
    "4": {"start": "09:00", "end": "17:00", "isAvailable": true},
    "5": {"start": "09:00", "end": "17:00", "isAvailable": true},
    "6": {"start": "09:00", "end": "17:00", "isAvailable": false}
  }',
  buffer_time INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(creative_id)
);

-- Ensure proper RLS on creative_availability
ALTER TABLE creative_availability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Allow public read access" ON creative_availability;
DROP POLICY IF EXISTS "Allow creative owners to update their availability" ON creative_availability;

CREATE POLICY "Public can view creative availability"
  ON creative_availability
  FOR SELECT
  USING (true);

CREATE POLICY "Creatives can manage own availability"
  ON creative_availability
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

-- Fix foreign key relationships
DO $$
BEGIN
  -- Fix services table foreign key if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
    -- Drop and recreate foreign key constraint if needed
    ALTER TABLE services DROP CONSTRAINT IF EXISTS services_creative_id_fkey;
    ALTER TABLE services ADD CONSTRAINT services_creative_id_fkey 
      FOREIGN KEY (creative_id) REFERENCES creative_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix portfolio_items table foreign key if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolio_items') THEN
    ALTER TABLE portfolio_items DROP CONSTRAINT IF EXISTS portfolio_items_creative_id_fkey;
    ALTER TABLE portfolio_items ADD CONSTRAINT portfolio_items_creative_id_fkey 
      FOREIGN KEY (creative_id) REFERENCES creative_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Fix bookings table foreign keys if it exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bookings') THEN
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;
    ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_creative_id_fkey;
    
    ALTER TABLE bookings ADD CONSTRAINT bookings_client_id_fkey 
      FOREIGN KEY (client_id) REFERENCES client_profiles(id) ON DELETE CASCADE;
    ALTER TABLE bookings ADD CONSTRAINT bookings_creative_id_fkey 
      FOREIGN KEY (creative_id) REFERENCES creative_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS idx_creative_profiles_user_id ON creative_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creative_profiles_approval_status ON creative_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_creative_profiles_category ON creative_profiles(category);
CREATE INDEX IF NOT EXISTS idx_creative_profiles_location ON creative_profiles(location);
CREATE INDEX IF NOT EXISTS idx_client_profiles_email ON client_profiles(email);
CREATE INDEX IF NOT EXISTS idx_creative_availability_creative_id ON creative_availability(creative_id);

-- Ensure updated_at triggers exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at if they don't exist
DO $$
BEGIN
  -- Creative availability trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_creative_availability_updated_at'
  ) THEN
    CREATE TRIGGER update_creative_availability_updated_at
      BEFORE UPDATE ON creative_availability
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;