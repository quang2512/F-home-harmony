-- Create members table for HomeHarmony shared living app
-- Note: Password storage in plain text is a security risk. Consider using Supabase Auth instead.

CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL, -- SECURITY RISK: Plain text password storage
    avatar TEXT NOT NULL DEFAULT '👤',
    color TEXT NOT NULL DEFAULT 'blue-500',
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on name to prevent duplicate usernames
ALTER TABLE members ADD CONSTRAINT members_name_unique UNIQUE (name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow anyone to read members for login (temporary - for development)
CREATE POLICY "Allow anyone to read members for login" ON members
    FOR SELECT USING (true);

-- Create policy: Allow anyone to insert members (temporary - for development)
CREATE POLICY "Allow anyone to insert members" ON members
    FOR INSERT WITH CHECK (true);

-- Create policy: Allow anyone to update members (temporary - for development)
CREATE POLICY "Allow anyone to update members" ON members
    FOR UPDATE USING (true);

-- Create policy: Allow anyone to delete members (temporary - for development)
CREATE POLICY "Allow anyone to delete members" ON members
    FOR DELETE USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name);
CREATE INDEX IF NOT EXISTS idx_members_is_admin ON members(is_admin);
CREATE INDEX IF NOT EXISTS idx_members_created_at ON members(created_at);
