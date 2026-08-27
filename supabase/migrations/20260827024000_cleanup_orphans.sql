DELETE FROM conversations WHERE id NOT IN (SELECT conversation_id FROM conversation_members);
