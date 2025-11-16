-- Seed data for HomeHarmony application
-- This file provides initial data for testing and development

-- Insert sample members
INSERT INTO members (name, password, avatar, color, is_admin) VALUES
('quang', 'password123', '👩‍💼', 'blue-500', true),
('loi', 'password123', '👨‍🔧', 'green-500', false),
('huy', 'password123', '👨‍🎨', 'orange-500', false),
('phong', 'password123', '👩‍🏫', 'purple-500', false)
ON CONFLICT (name) DO NOTHING;

-- Insert sample items
INSERT INTO items (name, quantity, min_quantity, unit) VALUES
('Toilet Paper', 12, 6, 'rolls'),
('Dish Soap', 2, 1, 'bottles'),
('Laundry Detergent', 1, 1, 'bottles'),
('Trash Bags', 50, 10, 'bags'),
('Paper Towels', 8, 4, 'rolls'),
('Milk', 1, 1, 'gallons'),
('Bread', 2, 1, 'loaves'),
('Coffee', 0.5, 0.25, 'lbs'),
('Eggs', 12, 6, 'dozen'),
('Bananas', 6, 3, 'pieces')
ON CONFLICT (name) DO NOTHING;

-- Insert sample tasks (using the inserted member IDs)
INSERT INTO tasks (name, description, assigned_to, schedule, priority, duration, completed, due_date, weight) VALUES
(
    'Take out trash',
    'Empty all trash bins and replace liners',
    (SELECT id FROM members WHERE name = 'quang'),
    'Every Tuesday and Friday',
    'medium',
    15,
    false,
    CURRENT_DATE + INTERVAL '1 day',
    2
),
(
    'Clean kitchen',
    'Deep clean kitchen including appliances and floors',
    (SELECT id FROM members WHERE name = 'loi'),
    'Every Saturday',
    'high',
    60,
    false,
    CURRENT_DATE + INTERVAL '2 days',
    5
),
(
    'Grocery shopping',
    'Weekly grocery run for household items',
    (SELECT id FROM members WHERE name = 'huy'),
    'Every Sunday',
    'high',
    90,
    false,
    CURRENT_DATE + INTERVAL '3 days',
    4
),
(
    'Vacuum living room',
    'Vacuum carpets and clean hard floors',
    (SELECT id FROM members WHERE name = 'phong'),
    'Every Wednesday',
    'low',
    20,
    true,
    CURRENT_DATE - INTERVAL '1 day',
    1
),
(
    'Wash dishes',
    'Daily dishwashing after meals',
    (SELECT id FROM members WHERE name = 'loi'),
    'After every meal',
    'medium',
    15,
    false,
    CURRENT_DATE,
    3
),
(
    'Mow lawn',
    'Mow the front and back yard',
    (SELECT id FROM members WHERE name = 'quang'),
    'Every other Saturday',
    'medium',
    45,
    false,
    CURRENT_DATE + INTERVAL '7 days',
    3
),
(
    'Clean bathrooms',
    'Clean all bathrooms including showers and toilets',
    (SELECT id FROM members WHERE name = 'huy'),
    'Every Thursday',
    'high',
    45,
    false,
    CURRENT_DATE + INTERVAL '1 day',
    4
),
(
    'Organize pantry',
    'Sort and organize pantry items, check expiration dates',
    (SELECT id FROM members WHERE name = 'phong'),
    'Monthly',
    'low',
    30,
    false,
    CURRENT_DATE + INTERVAL '14 days',
    2
);
