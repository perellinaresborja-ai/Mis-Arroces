-- Make media_assets.owner_id nullable to support user account deletion without breaking recipes
ALTER TABLE public.media_assets DROP CONSTRAINT media_assets_owner_id_fkey;
ALTER TABLE public.media_assets ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE public.media_assets ADD CONSTRAINT media_assets_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
