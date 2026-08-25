-- 00019_fix_vessels_and_heats.sql

-- 1. Insert and Keep Vessel Types
INSERT INTO vessel_types (name) VALUES
('Paella'),
('Caldero'),
('Cazuela de Barro')
ON CONFLICT (name) DO NOTHING;

-- 2. Unlink deleted vessels from recipes
UPDATE recipe_vessels 
SET vessel_type_id = NULL 
WHERE vessel_type_id IN (
    SELECT id FROM vessel_types 
    WHERE name NOT IN ('Paella', 'Caldero', 'Cazuela de Barro')
);

-- 3. Delete other vessel types
DELETE FROM vessel_types 
WHERE name NOT IN ('Paella', 'Caldero', 'Cazuela de Barro');


-- 4. Insert and Keep Heat Sources
INSERT INTO heat_sources (name) VALUES
('Paellero'),
('Vitrocerámica'),
('Horno')
ON CONFLICT (name) DO NOTHING;

-- 5. Unlink deleted heat sources from recipes
UPDATE recipes 
SET heat_source_id = NULL 
WHERE heat_source_id IN (
    SELECT id FROM heat_sources 
    WHERE name NOT IN ('Paellero', 'Vitrocerámica', 'Horno')
);

-- 6. Delete other heat sources
DELETE FROM heat_sources 
WHERE name NOT IN ('Paellero', 'Vitrocerámica', 'Horno');
