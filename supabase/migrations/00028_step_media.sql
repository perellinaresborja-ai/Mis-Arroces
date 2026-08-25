ALTER TABLE recipe_steps ADD COLUMN media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;
