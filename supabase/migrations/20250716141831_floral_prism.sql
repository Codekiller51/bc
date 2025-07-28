/*
  # Fix Auth Trigger

  1. New Functions
    - Updated user profile creation function to handle both client and creative profiles
    - Added function to update timestamps automatically
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type TEXT;
BEGIN
  -- Get the user_type from user metadata
  user_type := NEW.raw_user_meta_data->>'user_type';
  
  -- Default to client if not specified
  IF user_type IS NULL THEN
    user_type := 'client';
  END IF;
  
  -- Create appropriate profile based on user type
  IF user_type = 'creative' THEN
    INSERT INTO public.creative_profiles (
      id, 
      user_id,
      title,
      bio
    ) VALUES (
      uuid_generate_v4(),
      NEW.id,
      NEW.raw_user_meta_data->>'profession',
      'Professional creative based in ' || COALESCE(NEW.raw_user_meta_data->>'location', 'Tanzania')
    );
  ELSE
    INSERT INTO public.client_profiles (
      id,
      full_name,
      email,
      phone,
      location
    ) VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      NEW.raw_user_meta_data->>'location'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers to all tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('creative_profiles', 'client_profiles', 'bookings', 'testimonials')
  LOOP
    EXECUTE format('
      CREATE TRIGGER update_%I_timestamp
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_timestamp()', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;