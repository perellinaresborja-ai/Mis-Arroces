CREATE OR REPLACE FUNCTION get_or_create_conversation(target_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_conv_id UUID;
  v_participant_hash TEXT;
  v_initiator_id UUID;
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
    -- If it exists, reactivate both users as ACTIVE unconditionally
    UPDATE conversation_members 
    SET status = 'ACTIVE', rejected_at = NULL, last_read_at = now()
    WHERE conversation_id = v_conv_id AND user_id IN (v_initiator_id, target_user_id);

    RETURN v_conv_id;
  END IF;

  -- Create new conversation
  INSERT INTO conversations (participant_hash) VALUES (v_participant_hash) RETURNING id INTO v_conv_id;

  -- Always insert both as ACTIVE (Free messaging)
  INSERT INTO conversation_members (conversation_id, user_id, status) VALUES 
    (v_conv_id, v_initiator_id, 'ACTIVE'),
    (v_conv_id, target_user_id, 'ACTIVE');

  RETURN v_conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
