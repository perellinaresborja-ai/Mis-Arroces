BEGIN;

UPDATE public.recipe_ingredients SET canonical_ingredient_id = '55555555-5555-5555-5555-555555555555' WHERE id = 'b2e584a5-a78b-4fbe-9c2d-58b28ddce3bb';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000006' WHERE id = '2b2d53ae-dfad-4bd1-a05f-8bbf19bb35e1';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000014' WHERE id = 'cb5844c0-7dbb-45e6-9ec5-277ee8e2256e';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000020' WHERE id = 'fdd98cf8-c6ba-411e-a765-6ab426f40b74';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '33333333-3333-3333-3333-333333333333' WHERE id = '4f722b0c-9b39-4c38-a1e3-432043db3997';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '22222222-2222-2222-2222-222222222222' WHERE id = 'd629e1fa-b96d-4834-9a8a-484f430706dc';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000006' WHERE id = 'a8974643-1c7f-4c83-8819-c85653aa31f7';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000007' WHERE id = '397a9e31-cc72-483d-ac62-eee99f20fcdd';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000020' WHERE id = 'c8a6f3d3-e567-44fa-a863-11d85437c567';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = 'b0000000-0000-0000-0000-000000000014' WHERE id = 'bb210612-82bd-4209-bb3c-2d7936395145';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '11111111-1111-1111-1111-111111111111' WHERE id = '73699945-3800-4a62-8241-aa755717aff7';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '22222222-2222-2222-2222-222222222222' WHERE id = '1b010fc7-4862-4669-85e1-a5e02f718907';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '44444444-4444-4444-4444-444444444444' WHERE id = 'd87bfc68-9c2d-430b-94c2-105fa47a0682';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '55555555-5555-5555-5555-555555555555' WHERE id = '4aa12202-23ae-4dee-9b35-82e695864277';
UPDATE public.recipe_ingredients SET canonical_ingredient_id = '33333333-3333-3333-3333-333333333333' WHERE id = 'fd64c62b-62f6-4780-bb4a-52fe90950fdf';

COMMIT;
