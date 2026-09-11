-- Configure strict server-side limits and allowed MIME types on Supabase Storage buckets

-- 1. recipe_media (recipes, posts, cooking sessions, avatars, stories)
-- Allowed: JPEG, PNG, WebP, GIF, HEIC/HEIF, MP4, WebM, QuickTime
-- Size limit: 50MB (52428800 bytes)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
WHERE id = 'recipe_media';

-- 2. message_media (chat attachments: images, videos, audio voice notes)
-- Allowed: JPEG, PNG, WebP, GIF, HEIC/HEIF, MP4, WebM, QuickTime, Audio (webm, mpeg, mp4/m4a, ogg, wav)
-- Size limit: 50MB (52428800 bytes)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'audio/webm',
      'audio/mpeg',
      'audio/mp4',
      'audio/x-m4a',
      'audio/ogg',
      'audio/wav'
    ]
WHERE id = 'message_media';

-- 3. story_media (dedicated private story assets)
-- Allowed: JPEG, PNG, WebP, GIF, HEIC/HEIF, MP4, WebM, QuickTime
-- Size limit: 50MB (52428800 bytes)
UPDATE storage.buckets
SET file_size_limit = 52428800,
    allowed_mime_types = ARRAY[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
WHERE id = 'story_media';
