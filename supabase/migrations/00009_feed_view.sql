-- MIS ARROCES — BLOCK 6 FEED VIEW

CREATE OR REPLACE VIEW feed_items AS
SELECT 
    'post' AS entity_type,
    p.id AS entity_id,
    p.author_id AS user_id,
    p.created_at,
    p.visibility
FROM social_posts p

UNION ALL

SELECT 
    'recipe' AS entity_type,
    r.id AS entity_id,
    r.owner_id AS user_id,
    r.created_at,
    r.visibility
FROM recipes r
WHERE r.status = 'PUBLISHED'

UNION ALL

SELECT 
    'session' AS entity_type,
    s.id AS entity_id,
    s.user_id AS user_id,
    s.date::timestamptz AS created_at, -- Sessions use date, fallback to standard tz
    s.visibility
FROM cooking_sessions s;
