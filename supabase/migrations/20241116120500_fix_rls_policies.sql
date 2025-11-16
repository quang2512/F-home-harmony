-- Fix RLS policies for development environment
-- Temporarily allow all operations on tasks and items tables for development
-- TODO: Implement proper authentication and revert these policies for production

-- Drop existing restrictive policies for tasks table
DROP POLICY IF EXISTS "Allow authenticated users to read tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to insert tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated users to delete tasks" ON tasks;

-- Create temporary permissive policies for tasks table (development only)
CREATE POLICY "Allow anyone to read tasks (development)" ON tasks
    FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert tasks (development)" ON tasks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update tasks (development)" ON tasks
    FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to delete tasks (development)" ON tasks
    FOR DELETE USING (true);

-- Drop existing restrictive policies for items table
DROP POLICY IF EXISTS "Allow authenticated users to read items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to insert items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to update items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to delete items" ON items;

-- Create temporary permissive policies for items table (development only)
CREATE POLICY "Allow anyone to read items (development)" ON items
    FOR SELECT USING (true);

CREATE POLICY "Allow anyone to insert items (development)" ON items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anyone to update items (development)" ON items
    FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to delete items (development)" ON items
    FOR DELETE USING (true);
