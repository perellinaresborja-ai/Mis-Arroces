-- 1. NO PLACEHOLDERS: Drop previous placeholder functions
DROP FUNCTION IF EXISTS enforce_new_request_limits() CASCADE;

-- 2. REJECT COOLDOWN REAL & MESSAGE RATE LIMITS
-- Make sure rejected_at exists
ALTER TABLE conversation_members ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

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
    -- If >= 7 days, we allow the message insert. The UI/App should update status to REQUEST.
  END IF;

  -- LIMIT 1 MESSAGE DURING REQUEST
  IF v_conv_status = 'REQUEST' THEN
    SELECT count(*) INTO v_message_count FROM messages WHERE conversation_id = NEW.conversation_id AND sender_id = NEW.sender_id;
    IF v_message_count >= 1 THEN
      RAISE EXCEPTION 'Cannot send more than 1 message while request is pending';
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

-- 3. UPLOAD RATE LIMIT (10 / 10 min)
CREATE OR REPLACE FUNCTION enforce_upload_limits()
RETURNS TRIGGER AS $$
DECLARE
  v_upload_count INT;
BEGIN
  SELECT count(*) INTO v_upload_count
  FROM messages 
  WHERE sender_id = NEW.sender_id 
    AND type IN ('IMAGE', 'VIDEO') 
    AND created_at > now() - interval '10 minutes';

  IF NEW.type IN ('IMAGE', 'VIDEO') AND v_upload_count >= 10 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 10 media uploads per 10 minutes';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_upload_limits ON messages;
CREATE TRIGGER trg_enforce_upload_limits
BEFORE INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION enforce_upload_limits();

-- 4. RPC GET OR CREATE CONVERSATION WITH REQUEST RATE LIMIT
CREATE OR REPLACE FUNCTION get_or_create_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
  v_participant_hash TEXT;
  v_initiator_id UUID;
  v_request_count INT;
  v_target_status TEXT;
  v_rejected_at TIMESTAMPTZ;
  v_mutual_follow BOOLEAN;
BEGIN
  v_initiator_id := auth.uid();
  
  IF v_initiator_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_initiator_id = target_user_id THEN
    RAISE EXCEPTION 'Cannot message yourself';
  END IF;

  v_participant_hash := least(v_initiator_id, target_user_id)::text || '_' || greatest(v_initiator_id, target_user_id)::text;

  -- Check if exists
  SELECT id INTO v_conv_id FROM conversations WHERE participant_hash = v_participant_hash;

  IF v_conv_id IS NOT NULL THEN
    -- Check if REJECTED and manage cooldown
    SELECT status, rejected_at INTO v_target_status, v_rejected_at 
    FROM conversation_members 
    WHERE conversation_id = v_conv_id AND user_id = target_user_id;

    IF v_target_status = 'REJECTED' THEN
      IF v_rejected_at IS NOT NULL AND now() < v_rejected_at + interval '7 days' THEN
        RAISE EXCEPTION 'Conversation is in cooldown period';
      ELSE
        -- Cooldown expired, reactivate as REQUEST
        UPDATE conversation_members 
        SET status = 'REQUEST', rejected_at = NULL, last_read_at = now()
        WHERE conversation_id = v_conv_id AND user_id = target_user_id;
        
        -- Sender is always ACTIVE
        UPDATE conversation_members
        SET status = 'ACTIVE'
        WHERE conversation_id = v_conv_id AND user_id = v_initiator_id;
      END IF;
    END IF;

    RETURN v_conv_id;
  END IF;

  -- If it DOES NOT exist, we are creating a NEW conversation. Check Rate Limit (5 / hour)
  SELECT count(*) INTO v_request_count
  FROM conversation_members cm_me
  JOIN conversation_members cm_them ON cm_me.conversation_id = cm_them.conversation_id
  JOIN conversations c ON c.id = cm_me.conversation_id
  WHERE cm_me.user_id = v_initiator_id
    AND cm_them.user_id != v_initiator_id
    AND cm_them.status = 'REQUEST'
    AND c.created_at > now() - interval '1 hour';

  IF v_request_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded: max 5 new conversation requests per hour';
  END IF;

  -- Create conversation
  INSERT INTO conversations (participant_hash) VALUES (v_participant_hash) RETURNING id INTO v_conv_id;

  -- Check mutual follow to determine initial status
  SELECT EXISTS (
    SELECT 1 FROM follows f1
    JOIN follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    WHERE f1.follower_id = v_initiator_id AND f1.following_id = target_user_id
  ) INTO v_mutual_follow;

  IF v_mutual_follow THEN
    INSERT INTO conversation_members (conversation_id, user_id, status) VALUES 
      (v_conv_id, v_initiator_id, 'ACTIVE'),
      (v_conv_id, target_user_id, 'ACTIVE');
  ELSE
    INSERT INTO conversation_members (conversation_id, user_id, status) VALUES 
      (v_conv_id, v_initiator_id, 'ACTIVE'),
      (v_conv_id, target_user_id, 'REQUEST');
  END IF;

  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
