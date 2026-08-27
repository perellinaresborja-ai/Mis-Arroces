CREATE OR REPLACE FUNCTION get_unread_conversations_count()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(DISTINCT m.conversation_id) INTO v_count
  FROM messages m
  JOIN conversation_members cm ON m.conversation_id = cm.conversation_id
  WHERE cm.user_id = auth.uid()
    AND m.sender_id != auth.uid()
    AND m.created_at > cm.last_read_at;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
