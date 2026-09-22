CREATE TABLE IF NOT EXISTS user_ingredient_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    canonical_ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
    raw_name TEXT,
    purchase_price NUMERIC NOT NULL,
    purchase_unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT has_target CHECK (canonical_ingredient_id IS NOT NULL OR raw_name IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_uip_canonical ON user_ingredient_prices (user_id, canonical_ingredient_id) WHERE canonical_ingredient_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_uip_raw ON user_ingredient_prices (user_id, raw_name) WHERE raw_name IS NOT NULL;

ALTER TABLE user_ingredient_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own ingredient prices" ON user_ingredient_prices
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

