-- Create tasks table for HomeHarmony shared living app

CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES members(id) ON DELETE SET NULL,
    schedule TEXT NOT NULL DEFAULT '',
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    duration INTEGER NOT NULL DEFAULT 0 CHECK (duration >= 0),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    weight INTEGER NOT NULL DEFAULT 1 CHECK (weight > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy: Allow authenticated users to read all tasks
CREATE POLICY "Allow authenticated users to read tasks" ON tasks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to insert tasks
CREATE POLICY "Allow authenticated users to insert tasks" ON tasks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to update tasks
CREATE POLICY "Allow authenticated users to update tasks" ON tasks
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy: Allow authenticated users to delete tasks
CREATE POLICY "Allow authenticated users to delete tasks" ON tasks
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
