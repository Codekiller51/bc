/*
  # Complete Database Reset and Recreation
  
  This migration drops all existing tables and recreates the entire database schema
  with proper structure for the three user types: clients, creatives, and admins.
  
  1. Drop all existing tables and functions
  2. Create new tables with proper relationships
  3. Set up Row Level Security (RLS)
  4. Create triggers and functions
  5. Insert sample data
*/

-- Drop all existing tables and functions
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS portfolio_items CASCADE;
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS creative_profiles CASCADE;
DROP TABLE IF EXISTS client_profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_creative_rating() CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create client_profiles table
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

-- Create creative_profiles table
CREATE TABLE creative_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  availability_status TEXT DEFAULT 'available',
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  avatar_url TEXT,
  portfolio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create portfolio_items table
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES client_profiles(id) ON DELETE CASCADE,
  creative_id UUID REFERENCES creative_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'payment', 'message', 'reminder', 'update', 'approval')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Public can view client profiles" ON client_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own client profile" ON client_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own client profile" ON client_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for creative_profiles
CREATE POLICY "Public can view approved creative profiles" ON creative_profiles FOR SELECT USING (approval_status = 'approved');
CREATE POLICY "Admins can view all creative profiles" ON creative_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);
CREATE POLICY "Users can update own creative profile" ON creative_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own creative profile" ON creative_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any creative profile" ON creative_profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- RLS Policies for services
CREATE POLICY "Public can view active services" ON services FOR SELECT USING (active = true);
CREATE POLICY "Creatives can manage own services" ON services FOR ALL USING (
  creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for portfolio_items
CREATE POLICY "Public can view portfolio items" ON portfolio_items FOR SELECT USING (true);
CREATE POLICY "Creatives can manage own portfolio" ON portfolio_items FOR ALL USING (
  creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
);
CREATE POLICY "Clients can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Booking parties can update bookings" ON bookings FOR UPDATE USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
);
CREATE POLICY "Admins can view all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
);

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
);
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK (
  auth.uid() = client_id OR 
  auth.uid() IN (SELECT user_id FROM creative_profiles WHERE id = creative_id)
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  conversation_id IN (
    SELECT id FROM conversations WHERE 
    client_id = auth.uid() OR 
    creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in own conversations" ON messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  conversation_id IN (
    SELECT id FROM conversations WHERE 
    client_id = auth.uid() OR 
    creative_id IN (SELECT id FROM creative_profiles WHERE user_id = auth.uid())
  )
);

-- RLS Policies for reviews
CREATE POLICY "Public can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Clients can create reviews for completed bookings" ON reviews FOR INSERT WITH CHECK (
  auth.uid() = client_id AND
  EXISTS (SELECT 1 FROM bookings WHERE id = booking_id AND status = 'completed' AND client_id = auth.uid())
);
CREATE POLICY "Clients can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = client_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON client_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_profiles_updated_at
  BEFORE UPDATE ON creative_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- Trigger to update rating when review is added/updated
CREATE TRIGGER update_creative_rating_trigger
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_rating();

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
  -- Get user metadata
  user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User');
  user_email := NEW.email;
  user_phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  user_location := COALESCE(NEW.raw_user_meta_data->>'location', 'Tanzania');
  user_profession := COALESCE(NEW.raw_user_meta_data->>'profession', '');
  
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_creative_profiles_user_id ON creative_profiles(user_id);
CREATE INDEX idx_creative_profiles_approval_status ON creative_profiles(approval_status);
CREATE INDEX idx_creative_profiles_category ON creative_profiles(category);
CREATE INDEX idx_creative_profiles_rating ON creative_profiles(rating DESC);
CREATE INDEX idx_services_creative_id ON services(creative_id);
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_creative_id ON bookings(creative_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_reviews_creative_id ON reviews(creative_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);

-- Insert sample data for testing (optional)
-- This will be created by the application when users register