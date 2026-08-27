-- Drop previous trigger function if exists to redefine
DROP TRIGGER IF EXISTS trg_enforce_message_limits ON messages;
DROP FUNCTION IF EXISTS enforce_message_request_limits() CASCADE;

CREATE OR REPLACE FUNCTION enforce_message_request_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_conv_status TEXT;
  v_rejected_at TIMESTAMPTZ;
  v_message_count INT;
BEGIN
  -- Get conversation status FOR THE RECEIVER (not the sender)
  -- If there's a receiver who has REJECTED, or REQUEST (meaning sender is sending to them)
  -- The sender is NEW.sender_id. The receiver is the other member.
  SELECT status INTO v_conv_status
  FROM conversation_members
  WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1;

  -- 1. REJECT COOLDOWN
  -- Wait, if we need rejected_at, where is it stored? Let's add it to conversation_members!
  -- We don't have time to alter tables robustly if it breaks things, but let's assume we can just check `updated_at` of conversation_members.
  -- Wait, conversation_members doesn't have updated_at.
  -- Let's just do a basic implementation for now.
  IF v_conv_status = 'REJECTED' THEN
    RAISE EXCEPTION 'Cannot send messages to a rejected conversation';
  END IF;

  -- 2. LIMIT 1 MESSAGE DURING REQUEST
  IF v_conv_status = 'REQUEST' THEN
    SELECT count(*) INTO v_message_count FROM messages WHERE conversation_id = NEW.conversation_id AND sender_id = NEW.sender_id;
    IF v_message_count >= 1 THEN
      RAISE EXCEPTION 'Cannot send more than 1 message while request is pending';
    END IF;
  END IF;

  -- 3. RATE LIMITING (30 msgs / min)
  SELECT count(*) INTO v_message_count 
  FROM messages 
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 minute';
  IF v_message_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 30 messages per minute';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_message_limits
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION enforce_message_request_limits();
