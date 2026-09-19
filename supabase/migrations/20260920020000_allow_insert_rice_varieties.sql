-- Allow authenticated users to insert new rice varieties
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'rice_varieties' 
        AND policyname = 'Authenticated users can insert rice varieties'
    ) THEN
        CREATE POLICY "Authenticated users can insert rice varieties"
        ON public.rice_varieties
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
END $$;
