-- Add performance indexes and constraints for HomeHarmony

-- Additional indexes for tasks table (composite indexes for common queries)
CREATE INDEX IF NOT EXISTS idx_tasks_completed_due_date ON tasks(completed, due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_completed ON tasks(assigned_to, completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority_due_date ON tasks(priority, due_date);

-- Additional indexes for items table
CREATE INDEX IF NOT EXISTS idx_items_quantity_min_quantity ON items(quantity, min_quantity);

-- Partial index for low stock alerts (items below minimum quantity)
CREATE INDEX IF NOT EXISTS idx_items_low_stock ON items(id) WHERE quantity <= min_quantity;

-- Add a check constraint to ensure due_date is not in the past for new tasks
ALTER TABLE tasks ADD CONSTRAINT tasks_due_date_future
    CHECK (due_date IS NULL OR due_date >= CURRENT_DATE);

-- Add a function to get member workload (sum of task weights)
CREATE OR REPLACE FUNCTION get_member_workload(member_id UUID)
RETURNS INTEGER AS $$
    SELECT COALESCE(SUM(weight), 0)::INTEGER
    FROM tasks
    WHERE assigned_to = member_id AND completed = FALSE;
$$ LANGUAGE SQL IMMUTABLE;

-- Add a function to get overdue tasks count
CREATE OR REPLACE FUNCTION get_overdue_tasks_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM tasks
    WHERE completed = FALSE AND due_date < CURRENT_DATE;
$$ LANGUAGE SQL IMMUTABLE;

-- Add a function to get low stock items count
CREATE OR REPLACE FUNCTION get_low_stock_items_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM items
    WHERE quantity <= min_quantity;
$$ LANGUAGE SQL IMMUTABLE;

-- Create a view for task statistics
CREATE OR REPLACE VIEW task_statistics AS
SELECT
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE completed = TRUE) as completed_tasks,
    COUNT(*) FILTER (WHERE completed = FALSE) as pending_tasks,
    COUNT(*) FILTER (WHERE completed = FALSE AND due_date < CURRENT_DATE) as overdue_tasks,
    ROUND(
        CASE
            WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE completed = TRUE))::DECIMAL / COUNT(*) * 100
            ELSE 0
        END,
        2
    ) as completion_rate
FROM tasks;

-- Create a view for member workload statistics
CREATE OR REPLACE VIEW member_workload AS
SELECT
    m.id,
    m.name,
    m.avatar,
    m.color,
    COALESCE(SUM(t.weight), 0) as total_weight,
    COUNT(t.id) as total_tasks,
    COUNT(t.id) FILTER (WHERE t.completed = TRUE) as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.completed = FALSE) as pending_tasks
FROM members m
LEFT JOIN tasks t ON m.id = t.assigned_to
GROUP BY m.id, m.name, m.avatar, m.color
ORDER BY total_weight DESC;
