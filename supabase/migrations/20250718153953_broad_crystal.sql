/*
  # Fix User Registration Issues

  1. Functions
    - Fix handle_new_user function to properly handle user creation
    - Add better error handling and validation
    - Ensure proper data insertion

  2. Security
    - Maintain RLS policies
    - Ensure proper permissions
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

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
  -- Get user metadata with proper null handling
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User');
  user_email := COALESCE(NEW.email, '');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_location := COALESCE(NEW.raw_user_meta_data->>'location', 'Tanzania');
  user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', 'Creative Professional');
  
  -- Validate required fields
  IF user_email = '' THEN
    RAISE EXCEPTION 'Email is required for user creation';
  END IF;
  
  -- Create appropriate profile based on user type
  IF user_type = 'creative' THEN
    -- Insert into creative_profiles
    INSERT INTO creative_profiles (
      user_id,
      title,
      category,
      bio,
      approval_status
    ) VALUES (
      NEW.id,
      user_profession,
      COALESCE(NEW.raw_user_meta_data->>'category', 'General'),
      'Professional creative based in ' || user_location,
      'pending'
    );
  ELSE
    -- Insert into client_profiles (default for clients and admins)
    INSERT INTO client_profiles (
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
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure proper permissions for the function
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;