-- Script to create an admin user in Supabase
-- Run this in your Supabase SQL Editor after registering a user

-- Replace 'admin@brandconnect.co.tz' with the email you registered with
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb 
WHERE email = 'admin@brandconnect.co.tz';

-- Verify the admin user was created
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE raw_user_meta_data->>'role' = 'admin';