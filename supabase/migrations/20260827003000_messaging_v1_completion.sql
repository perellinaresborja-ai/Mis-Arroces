ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_type_check CHECK (type IN ('TEXT', 'IMAGE', 'VIDEO', 'LINK', 'RECIPE', 'SESSION', 'STORY'));

CREATE OR REPLACE FUNCTION check_message_request_limit() RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM conversation_members 
    WHERE conversation_id = NEW.conversation_id 
    AND user_id != NEW.sender_id 
    AND status = 'REQUEST'
  ) THEN
    IF EXISTS (
      SELECT 1 FROM messages 
      WHERE conversation_id = NEW.conversation_id 
      AND sender_id = NEW.sender_id
    ) THEN
      RAISE EXCEPTION 'Cannot send more than one message while request is pending.';
    END IF;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM conversation_members 
    WHERE conversation_id = NEW.conversation_id 
    AND status = 'REJECTED'
  ) THEN
    RAISE EXCEPTION 'Conversation rejected. Cooldown active.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS limit_request_messages ON messages;
CREATE TRIGGER limit_request_messages BEFORE INSERT ON messages FOR EACH ROW EXECUTE FUNCTION check_message_request_limit();
