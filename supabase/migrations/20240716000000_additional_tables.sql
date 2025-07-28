-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creative_id UUID REFERENCES creative_profiles ON DELETE CASCADE,
    client_id UUID REFERENCES client_profiles ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    creative_id UUID REFERENCES creative_profiles ON DELETE CASCADE,
    client_id UUID REFERENCES client_profiles ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookings"
    ON bookings FOR SELECT
    USING (auth.uid() = creative_id OR auth.uid() = client_id);

CREATE POLICY "Users can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own bookings"
    ON bookings FOR UPDATE
    USING (auth.uid() = creative_id OR auth.uid() = client_id);

-- Create RLS policies for testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all testimonials"
    ON testimonials FOR SELECT
    USING (true);

CREATE POLICY "Users can create testimonials"
    ON testimonials FOR INSERT
    WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Users can update their own testimonials"
    ON testimonials FOR UPDATE
    USING (auth.uid() = client_id);
