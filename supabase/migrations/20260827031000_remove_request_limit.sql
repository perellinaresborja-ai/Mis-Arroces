CREATE OR REPLACE FUNCTION enforce_message_request_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_conv_status TEXT;
  v_rejected_at TIMESTAMPTZ;
  v_message_count INT;
BEGIN
  -- Get conversation status FOR THE RECEIVER
  SELECT status, rejected_at INTO v_conv_status, v_rejected_at
  FROM conversation_members
  WHERE conversation_id = NEW.conversation_id AND user_id != NEW.sender_id LIMIT 1;

  -- REJECT COOLDOWN
  IF v_conv_status = 'REJECTED' THEN
    IF v_rejected_at IS NOT NULL AND now() < v_rejected_at + interval '7 days' THEN
      RAISE EXCEPTION 'Cannot send messages to a rejected conversation during cooldown';
    END IF;
  END IF;

  -- RATE LIMITING (30 msgs / min)
  SELECT count(*) INTO v_message_count 
  FROM messages 
  WHERE sender_id = NEW.sender_id AND created_at > now() - interval '1 minute';
  
  IF v_message_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 30 messages per minute';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
