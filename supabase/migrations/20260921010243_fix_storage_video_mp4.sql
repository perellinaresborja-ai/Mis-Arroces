-- Agregar 'video/mp4' a los MIME permitidos en el bucket recipe_media
UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'video/mp4')
WHERE id = 'recipe_media' AND NOT ('video/mp4' = ANY(allowed_mime_types));
