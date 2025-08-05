/*
  # Complete Database Reset and Recreation
  
  This migration completely resets the database and recreates all tables, relationships,
  Row Level Security policies, functions, and triggers for the Brand Connect platform.
  
  1. Drop all existing tables and functions
  2. Create core tables with proper relationships
  3. Set up Row Level Security (RLS) policies
  4. Create functions and triggers
  5. Create storage buckets and policies
  6. Add performance indexes
*/

-- =============================================
-- DROP EXISTING SCHEMA
-- =============================================

-- Drop all tables in dependency order
DROP TABLE IF EXISTS notification_events CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS creative_availability CASCADE;
DROP TABLE IF EXISTS creative_profiles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_creative_rating() CASCADE;
DROP FUNCTION IF EXISTS handle_new_notification() CASCADE;

-- Drop storage buckets
DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'portfolio');
DELETE FROM storage.buckets WHERE id IN ('avatars', 'portfolio');

-- =============================================
-- ENABLE EXTENSIONS
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- CREATE CORE TABLES
-- =============================================

-- Client profiles table
CREATE TABLE client_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  location TEXT,
  company_name TEXT,
  industry TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Creative profiles table
CREATE TABLE creative_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2) DEFAULT 50000,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  location TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  portfolio_url TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Portfolio items table
CREATE TABLE portfolio_items (
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

-- Creative availability table
CREATE TABLE creative_availability (
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

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID NOT NULL REFERENCES creative_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'message', 'reminder', 'update', 'approval')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification events table for real-time updates
CREATE TABLE notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('created', 'updated', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Client profiles policies
CREATE POLICY "Public can view client profiles"
  ON client_profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own client profile"
  ON client_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own client profile"
  ON client_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Creative profiles policies
CREATE POLICY "Public can view approved creative profiles"
  ON creative_profiles FOR SELECT USING (approval_status = 'approved');

CREATE POLICY "Admins can view all creative profiles"
  ON creative_profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Users can update own creative profile"
  ON creative_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own creative profile"
  ON creative_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any creative profile"
  ON creative_profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Services policies
CREATE POLICY "Public can view active services"
  ON services FOR SELECT USING (active = true);

CREATE POLICY "Creatives can manage own services"
  ON services FOR ALL USING (
    creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
  );

-- Portfolio items policies
CREATE POLICY "Public can view portfolio items"
  ON portfolio_items FOR SELECT USING (true);

CREATE POLICY "Creatives can manage own portfolio"
  ON portfolio_items FOR ALL USING (
    creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
  );

-- Creative availability policies
CREATE POLICY "Public can view creative availability"
  ON creative_availability FOR SELECT USING (true);

CREATE POLICY "Creatives can manage own availability"
  ON creative_availability FOR ALL USING (
    creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Booking parties can update bookings"
  ON bookings FOR UPDATE USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "Admins can update any booking"
  ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Conversations policies
CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT USING (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
  );

CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT WITH CHECK (
    auth.uid() = client_id OR 
    auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
  );

CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Messages policies
CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE 
      client_id = auth.uid() OR 
      creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in own conversations"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM conversations WHERE 
      client_id = auth.uid() OR 
      creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- Reviews policies
CREATE POLICY "Public can view reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Clients can create reviews for completed bookings"
  ON reviews FOR INSERT WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND status = 'completed' AND client_id = auth.uid())
  );

CREATE POLICY "Clients can update own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = client_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Notification events policies
CREATE POLICY "Users can view own notification events"
  ON notification_events FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notification events"
  ON notification_events FOR INSERT WITH CHECK (true);

-- =============================================
-- CREATE FUNCTIONS
-- =============================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update creative rating when review is added/updated
CREATE OR REPLACE FUNCTION update_creative_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE creative_profiles 
  SET 
    rating = (
      SELECT COALESCE(AVG(rating::DECIMAL), 0) 
      FROM reviews 
      WHERE creative_id = NEW.creative_id
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE creative_id = NEW.creative_id
    ),
    updated_at = now()
  WHERE id = NEW.creative_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user creation
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
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', NEW.raw_user_meta_data->>'role', 'client');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User');
  user_email := COALESCE(NEW.email, '');
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_location := COALESCE(NEW.raw_user_meta_data->>'location', 'Tanzania');
  user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', 'Creative Professional');
  
  -- Skip profile creation for admin users
  IF user_type = 'admin' THEN
    RETURN NEW;
  END IF;
  
  -- Create appropriate profile based on user type
  IF user_type = 'creative' THEN
    -- Insert into creative_profiles
    INSERT INTO creative_profiles (
      user_id,
      title,
      category,
      bio,
      location,
      phone,
      email,
      approval_status
    ) VALUES (
      NEW.id,
      user_profession,
      COALESCE(NEW.raw_user_meta_data->>'category', 'General'),
      'Professional ' || user_profession || ' based in ' || user_location,
      user_location,
      user_phone,
      user_email,
      'pending'
    );
  ELSE
    -- Insert into client_profiles (default for clients)
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

-- Function to handle new notification creation
CREATE OR REPLACE FUNCTION handle_new_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_events (notification_id, recipient_id, event_type)
  VALUES (NEW.id, NEW.user_id, 'created');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers for updated_at columns
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_profiles_updated_at
  BEFORE UPDATE ON creative_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_availability_updated_at
  BEFORE UPDATE ON creative_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update creative rating when review is added/updated
CREATE TRIGGER update_creative_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_rating();

-- Trigger for new notifications
CREATE TRIGGER on_notification_created
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_notification();

-- =============================================
-- CREATE STORAGE BUCKETS
-- =============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CREATE STORAGE POLICIES
-- =============================================

-- Avatar storage policies
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

-- Portfolio storage policies
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

-- =============================================
-- CREATE PERFORMANCE INDEXES
-- =============================================

-- Client profiles indexes
CREATE INDEX idx_client_profiles_email ON client_profiles(email);
CREATE INDEX idx_client_profiles_location ON client_profiles(location);

-- Creative profiles indexes
CREATE INDEX idx_creative_profiles_user_id ON creative_profiles(user_id);
CREATE INDEX idx_creative_profiles_approval_status ON creative_profiles(approval_status);
CREATE INDEX idx_creative_profiles_category ON creative_profiles(category);
CREATE INDEX idx_creative_profiles_location ON creative_profiles(location);
CREATE INDEX idx_creative_profiles_rating ON creative_profiles(rating DESC);
CREATE INDEX idx_creative_profiles_availability_status ON creative_profiles(availability_status);

-- Services indexes
CREATE INDEX idx_services_creative_id ON services(creative_id);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_category ON services(category);

-- Portfolio items indexes
CREATE INDEX idx_portfolio_items_creative_id ON portfolio_items(creative_id);
CREATE INDEX idx_portfolio_items_category ON portfolio_items(category);
CREATE INDEX idx_portfolio_items_created_at ON portfolio_items(created_at DESC);

-- Creative availability indexes
CREATE INDEX idx_creative_availability_creative_id ON creative_availability(creative_id);

-- Bookings indexes
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_creative_id ON bookings(creative_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Conversations indexes
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_creative_id ON conversations(creative_id);
CREATE INDEX idx_conversations_booking_id ON conversations(booking_id);
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_read_at ON messages(read_at);

-- Reviews indexes
CREATE INDEX idx_reviews_creative_id ON reviews(creative_id);
CREATE INDEX idx_reviews_client_id ON reviews(client_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Notification events indexes
CREATE INDEX idx_notification_events_recipient_id ON notification_events(recipient_id);
CREATE INDEX idx_notification_events_notification_id ON notification_events(notification_id);
CREATE INDEX idx_notification_events_created_at ON notification_events(created_at DESC);

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions for auth schema access
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT SELECT ON TABLE auth.users TO anon, authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_creative_rating() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION handle_new_notification() TO authenticated, anon;