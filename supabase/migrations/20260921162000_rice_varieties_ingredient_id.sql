ALTER TABLE public.rice_varieties 
ADD COLUMN ingredient_id uuid NULL REFERENCES public.ingredients(id) ON DELETE SET NULL;

UPDATE public.rice_varieties SET ingredient_id = 'b0000000-0000-0000-0000-000000000001' WHERE name = 'Bomba';
UPDATE public.rice_varieties SET ingredient_id = '0ed2dc48-3ae8-45e0-bb0e-adc8097c9b06' WHERE name = 'Albufera';
UPDATE public.rice_varieties SET ingredient_id = 'd9169425-1f50-441a-9bef-8871a4945d1a' WHERE name = 'Bahía';
UPDATE public.rice_varieties SET ingredient_id = 'c4698bf1-507f-47e9-8f37-4694085f8027' WHERE name = 'Marisma';

-- Las variedades J. Sendra, Carnaroli, Arborio y Dinamita quedan con ingredient_id = NULL por no existir en ingredients.
