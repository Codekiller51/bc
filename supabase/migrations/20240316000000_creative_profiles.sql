-- Create creative profiles table
CREATE TABLE creative_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  services JSONB DEFAULT '[]',
  portfolio JSONB DEFAULT '[]',
  testimonials JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies
ALTER TABLE creative_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Creative profiles are viewable by everyone" 
  ON creative_profiles FOR SELECT 
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own creative profile" 
  ON creative_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own creative profile" 
  ON creative_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_creative_profiles_updated_at
  BEFORE UPDATE ON creative_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX creative_profiles_user_id_idx ON creative_profiles(user_id);
CREATE INDEX creative_profiles_rating_idx ON creative_profiles(rating DESC);