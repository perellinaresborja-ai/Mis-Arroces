-- Seed reference tables for Mis Arroces

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

INSERT INTO rice_styles (name) VALUES
('Seco'),
('Meloso'),
('Caldoso'),
('Al Horno')
ON CONFLICT (name) DO NOTHING;

INSERT INTO vessel_types (name) VALUES
('Paella'),
('Caldero'),
('Cazuela de Barro')
ON CONFLICT (name) DO NOTHING;

INSERT INTO heat_sources (name) VALUES
('Paellero'),
('Vitrocerámica'),
('Horno')
ON CONFLICT (name) DO NOTHING;
