-- Trip Planner Database Schema for Supabase
-- Run this in your Supabase SQL editor

-- Enable RLS (Row Level Security)
-- This is handled through Supabase dashboard

-- Users table (this is handled by Supabase Auth automatically)
-- But we'll create a profiles table for additional user data

-- Profiles table for additional user information
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trips table
CREATE TABLE trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration TEXT,
    overview TEXT,
    status TEXT CHECK (status IN ('planning', 'upcoming', 'active', 'completed')) DEFAULT 'planning',
    budget_total DECIMAL(10,2) DEFAULT 0,
    budget_currency TEXT DEFAULT 'USD',
    highlights JSONB DEFAULT '[]',
    itinerary JSONB DEFAULT '[]',
    accommodation JSONB DEFAULT '[]',
    transportation JSONB DEFAULT '[]',
    emergency_contacts JSONB DEFAULT '[]',
    documents JSONB DEFAULT '[]',
    packing_list JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    settings JSONB DEFAULT '{"isPublic": false, "allowCollaboration": true, "theme": "light"}',
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip members table (for sharing trips)
CREATE TABLE trip_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL, -- for invitations before user signs up
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trip_id, email)
);

-- Expenses table
CREATE TABLE expenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    expected_amount DECIMAL(10,2),
    actual_amount DECIMAL(10,2),
    date DATE NOT NULL,
    paid_by TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trip activities log (for tracking changes)
CREATE TABLE trip_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'joined', 'left', etc.
    entity_type TEXT NOT NULL, -- 'trip', 'expense', 'member', etc.
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_trips_created_by ON trips(created_by);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trip_members_trip_id ON trip_members(trip_id);
CREATE INDEX idx_trip_members_user_id ON trip_members(user_id);
CREATE INDEX idx_trip_members_email ON trip_members(email);
CREATE INDEX idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX idx_trip_activity_log_trip_id ON trip_activity_log(trip_id);

-- Functions and triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trips_updated_at BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trips policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trips they own or are members of" ON trips
    FOR SELECT USING (
        created_by = auth.uid() OR
        id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Users can insert their own trips" ON trips
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Trip owners and editors can update trips" ON trips
    FOR UPDATE USING (
        created_by = auth.uid() OR
        id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor') AND status = 'accepted'
        )
    );

CREATE POLICY "Trip owners can delete trips" ON trips
    FOR DELETE USING (created_by = auth.uid());

-- Trip members policies
ALTER TABLE trip_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trip members for trips they have access to" ON trip_members
    FOR SELECT USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        ) OR
        trip_id IN (
            SELECT trip_id FROM trip_members WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Trip owners can manage trip members" ON trip_members
    FOR ALL USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

CREATE POLICY "Users can update their own membership status" ON trip_members
    FOR UPDATE USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Expenses policies
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view expenses for trips they have access to" ON expenses
    FOR SELECT USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        ) OR
        trip_id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "Trip members can insert expenses" ON expenses
    FOR INSERT WITH CHECK (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        ) OR
        trip_id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor') AND status = 'accepted'
        )
    );

CREATE POLICY "Trip members can update expenses" ON expenses
    FOR UPDATE USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        ) OR
        trip_id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'editor') AND status = 'accepted'
        )
    );

CREATE POLICY "Trip members can delete expenses they created" ON expenses
    FOR DELETE USING (
        created_by = auth.uid() OR
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        )
    );

-- Trip activity log policies
ALTER TABLE trip_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity for trips they have access to" ON trip_activity_log
    FOR SELECT USING (
        trip_id IN (
            SELECT id FROM trips WHERE created_by = auth.uid()
        ) OR
        trip_id IN (
            SELECT trip_id FROM trip_members 
            WHERE user_id = auth.uid() AND status = 'accepted'
        )
    );

CREATE POLICY "System can insert activity logs" ON trip_activity_log
    FOR INSERT WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log trip activities
CREATE OR REPLACE FUNCTION log_trip_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO trip_activity_log (trip_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            NEW.trip_id,
            auth.uid(),
            'created',
            TG_TABLE_NAME,
            NEW.id::text,
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO trip_activity_log (trip_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            NEW.trip_id,
            auth.uid(),
            'updated',
            TG_TABLE_NAME,
            NEW.id::text,
            jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO trip_activity_log (trip_id, user_id, action, entity_type, entity_id, details)
        VALUES (
            OLD.trip_id,
            auth.uid(),
            'deleted',
            TG_TABLE_NAME,
            OLD.id::text,
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for activity logging
CREATE TRIGGER log_expense_activity
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION log_trip_activity();

CREATE TRIGGER log_trip_member_activity
    AFTER INSERT OR UPDATE OR DELETE ON trip_members
    FOR EACH ROW EXECUTE FUNCTION log_trip_activity();
