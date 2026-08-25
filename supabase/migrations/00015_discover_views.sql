-- View for popular recipes (V1)
-- Joins recipes with counts of likes (via social_posts if applicable, wait, recipes don't have direct likes, they are saved/want_to_cook)
-- Let's check the schema for saves and want_to_cook and cooking_sessions

CREATE OR REPLACE VIEW popular_recipes_v1 WITH (security_invoker = true) AS
SELECT 
    r.*,
    COALESCE(s.save_count, 0) + COALESCE(w.want_count, 0) * 2 + COALESCE(cs.session_count, 0) * 5 AS popularity_score
FROM recipes r
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as save_count FROM saves GROUP BY recipe_id
) s ON s.recipe_id = r.id
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as want_count FROM want_to_cook GROUP BY recipe_id
) w ON w.recipe_id = r.id
LEFT JOIN (
    SELECT recipe_id, COUNT(*) as session_count FROM cooking_sessions WHERE recipe_id IS NOT NULL GROUP BY recipe_id
) cs ON cs.recipe_id = r.id
WHERE r.status = 'PUBLISHED';
