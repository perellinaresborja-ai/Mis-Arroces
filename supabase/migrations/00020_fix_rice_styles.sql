-- 00020_fix_rice_styles.sql

-- 1. Insert and Keep Rice Styles
INSERT INTO rice_styles (name) VALUES
('Seco'),
('Caldoso'),
('Meloso'),
('Al Horno')
ON CONFLICT (name) DO NOTHING;

-- 2. Unlink deleted styles from recipes
UPDATE recipes 
SET style_id = NULL 
WHERE style_id IN (
    SELECT id FROM rice_styles 
    WHERE name NOT IN ('Seco', 'Caldoso', 'Meloso', 'Al Horno')
);

-- 3. Delete other styles
DELETE FROM rice_styles 
WHERE name NOT IN ('Seco', 'Caldoso', 'Meloso', 'Al Horno');
