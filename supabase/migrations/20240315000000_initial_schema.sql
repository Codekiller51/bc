-- Create tables for user profiles

-- Table for creative professionals
CREATE TABLE IF NOT EXISTS creative_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    location TEXT,
    bio TEXT,
    portfolio_url TEXT,
    specialties TEXT[],
    hourly_rate DECIMAL(10,2),
    availability BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Table for clients
CREATE TABLE IF NOT EXISTS client_profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    location TEXT,
    company_name TEXT,
    industry TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE creative_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all creative profiles"
    ON creative_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own creative profile"
    ON creative_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own creative profile"
    ON creative_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all client profiles"
    ON client_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own client profile"
    ON client_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own client profile"
    ON client_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Create function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.client_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();