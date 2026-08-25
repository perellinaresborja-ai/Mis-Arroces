INSERT INTO heat_sources (name) VALUES ('Leña'), ('Sarmiento') ON CONFLICT DO NOTHING;

UPDATE recipes 
SET heat_source_id = (SELECT id FROM heat_sources WHERE name = 'Leña' LIMIT 1)
WHERE heat_source_id = (SELECT id FROM heat_sources WHERE name = 'Leña y sarmiento' LIMIT 1);

DELETE FROM heat_sources WHERE name = 'Leña y sarmiento';
