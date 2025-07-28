/*
  # Create Reviews and Ratings System

  1. New Tables
    - `reviews`
      - `id` (uuid, primary key)
      - `booking_id` (uuid, references bookings)
      - `client_id` (uuid, references client_profiles)
      - `creative_id` (uuid, references creative_profiles)
      - `rating` (integer, 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on reviews table
    - Add policies for clients to create reviews
    - Add policies for public read access

  3. Functions
    - Function to update creative average rating when review is added
*/

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(booking_id) -- One review per booking
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Clients can create reviews for their completed bookings"
  ON reviews
  FOR INSERT
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE id = booking_id 
      AND client_id = auth.uid() 
      AND status = 'completed'
    )
  );

CREATE POLICY "Clients can update their own reviews"
  ON reviews
  FOR UPDATE
  USING (auth.uid() = client_id);

-- Function to update creative rating
CREATE OR REPLACE FUNCTION update_creative_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the creative's average rating and review count
  UPDATE creative_profiles 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE creative_id = NEW.creative_id
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE creative_id = NEW.creative_id
    ),
    updated_at = now()
  WHERE user_id = NEW.creative_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating when review is added/updated
CREATE TRIGGER update_creative_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_rating();

-- Add approval status to creative_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creative_profiles' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE creative_profiles 
    ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    ADD COLUMN approved_by UUID REFERENCES auth.users(id),
    ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;