-- Create creative_availability table
CREATE TABLE creative_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(creative_id)
);

-- Add RLS policies
ALTER TABLE creative_availability ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON creative_availability
  FOR SELECT
  TO public
  USING (true);

-- Allow creative owners to update their own availability
CREATE POLICY "Allow creative owners to update their availability" ON creative_availability
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

-- Create index for faster lookups
CREATE INDEX idx_creative_availability_creative_id ON creative_availability(creative_id);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON creative_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();