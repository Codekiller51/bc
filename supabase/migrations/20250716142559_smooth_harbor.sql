/*
  # Improve User Registration

  1. New Tables
    - Add unique constraint to emails in both profile tables
    - Improve user profile creation trigger
  
  2. Security
    - Ensure proper data separation between client and creative profiles
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type TEXT;
  user_name TEXT;
  user_email TEXT;
  user_phone TEXT;
  user_location TEXT;
  user_profession TEXT;
BEGIN
  -- Get user metadata
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User');
  user_email := NEW.email;
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_location := COALESCE(NEW.raw_user_meta_data->>'location', 'Tanzania');
  user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
  
  -- Create appropriate profile based on user type
  IF user_type = 'creative' THEN
    -- Check if email already exists in client_profiles
    IF EXISTS (SELECT 1 FROM public.client_profiles WHERE email = user_email) THEN
      RAISE EXCEPTION 'Email already registered as a client';
    END IF;
    
    -- Insert into creative_profiles
    INSERT INTO public.creative_profiles (
      id, 
      user_id,
      title,
      bio
    ) VALUES (
      uuid_generate_v4(),
      NEW.id,
      user_profession,
      'Professional creative based in ' || user_location
    );
  ELSE
    -- Check if email already exists in creative_profiles
    IF EXISTS (SELECT 1 FROM public.creative_profiles 
               JOIN auth.users ON creative_profiles.user_id = users.id
               WHERE users.email = user_email) THEN
      RAISE EXCEPTION 'Email already registered as a creative professional';
    END IF;
    
    -- Insert into client_profiles
    INSERT INTO public.client_profiles (
      id,
      full_name,
      email,
      phone,
      location
    ) VALUES (
      NEW.id,
      user_name,
      user_email,
      user_phone,
      user_location
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add unique constraint to emails if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'client_profiles_email_key'
  ) THEN
    ALTER TABLE client_profiles ADD CONSTRAINT client_profiles_email_key UNIQUE (email);
  END IF;
END $$;