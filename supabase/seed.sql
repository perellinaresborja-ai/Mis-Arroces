-- seed.sql
-- MIS ARROCES — BLOCK 0 SEED DATA

INSERT INTO rice_styles (name) VALUES
('Seco / Dry'),
('Meloso / Creamy'),
('Caldoso / Soupy'),
('Horno / Oven'),
('Other')
ON CONFLICT DO NOTHING;

INSERT INTO rice_varieties (name) VALUES
('Bomba'),
('Albufera'),
('J. Sendra'),
('Senia'),
('Bahía'),
('Balilla x Sollana'),
('Carnaroli'),
('Arborio')
ON CONFLICT DO NOTHING;

INSERT INTO heat_sources (name) VALUES
('Gas'),
('Wood / Leña'),
('Induction'),
('Ceramic / Vitrocerámica'),
('Oven / Horno'),
('Other')
ON CONFLICT DO NOTHING;

INSERT INTO vessel_types (name) VALUES
('Paella'),
('Casserole / Cazuela de barro'),
('Pot / Olla'),
('Caldero'),
('Oven tray / Llauna'),
('Other')
ON CONFLICT DO NOTHING;

INSERT INTO units (name, is_scalable) VALUES
('g', true),
('kg', true),
('ml', true),
('l', true),
('unit', true),
('tablespoon', true),
('teaspoon', true),
('handful', false)
ON CONFLICT DO NOTHING;
