@@ .. @@
 -- Create creative profiles table
 CREATE TABLE creative_profiles (
   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
-  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
+  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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