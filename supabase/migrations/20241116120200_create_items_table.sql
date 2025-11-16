-- Create items table for HomeHarmony shared living app inventory management

CREATE TABLE IF NOT EXISTS items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    min_quantity DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (min_quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'pieces',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint on name to prevent duplicate items
ALTER TABLE items ADD CONSTRAINT items_name_unique UNIQUE (name);

-- Create updated_at trigger
CREATE TRIGGER update_items_updated_at
    BEFORE UPDATE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow authenticated users to read all items
CREATE POLICY "Allow authenticated users to read items" ON items
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to insert items
CREATE POLICY "Allow authenticated users to insert items" ON items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to update items
CREATE POLICY "Allow authenticated users to update items" ON items
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to delete items
CREATE POLICY "Allow authenticated users to delete items" ON items
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_quantity ON items(quantity);
CREATE INDEX IF NOT EXISTS idx_items_min_quantity ON items(min_quantity);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at);
