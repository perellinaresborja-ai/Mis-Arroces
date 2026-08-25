-- 00018_fix_rice_varieties.sql

-- 1. Insert the new ones and keep the correct ones
INSERT INTO rice_varieties (name) VALUES
('Albufera'),
('Arborio'),
('Bahía'),
('Bomba'),
('Carnaroli'),
('Dinamita'),
('J. Sendra'),
('Marisma')
ON CONFLICT (name) DO NOTHING;

-- 2. If any recipes use the old ones, un-reference them safely (set variety_id to null)
UPDATE recipes 
SET variety_id = NULL 
WHERE variety_id IN (
    SELECT id FROM rice_varieties 
    WHERE name NOT IN ('Albufera', 'Arborio', 'Bahía', 'Bomba', 'Carnaroli', 'Dinamita', 'J. Sendra', 'Marisma')
);

-- 3. Delete the wrong ones
DELETE FROM rice_varieties 
WHERE name NOT IN ('Albufera', 'Arborio', 'Bahía', 'Bomba', 'Carnaroli', 'Dinamita', 'J. Sendra', 'Marisma');
