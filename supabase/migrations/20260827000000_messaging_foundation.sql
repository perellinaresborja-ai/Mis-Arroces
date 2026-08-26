-- MESSAGING / DMs V1 FOUNDATION

-- 1. CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_hash TEXT UNIQUE NOT NULL, -- e.g. least(uid1, uid2) || '_' || greatest(uid1, uid2)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CONVERSATION MEMBERS
CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REQUEST', 'REJECTED')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX idx_conversation_members_conv ON conversation_members(conversation_id);

-- 3. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('TEXT', 'IMAGE', 'RECIPE', 'SESSION', 'STORY')),
  body TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- 4. MESSAGE ATTACHMENTS
CREATE TABLE IF NOT EXISTS message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  size_bytes INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_media', 'message_media', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Upload policy: Users can upload if they are authenticated.
-- Note: Security is enforced server-side before registering the attachment.
CREATE POLICY "Users can upload message media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'message_media' AND auth.uid() = owner);

CREATE POLICY "Users can delete own message media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'message_media' AND auth.uid() = owner);

-- 6. RPC: GET OR CREATE CONVERSATION
CREATE OR REPLACE FUNCTION get_or_create_conversation(target_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_conv_id UUID;
  v_hash TEXT;
  v_uid UUID := auth.uid();
  v_is_blocked BOOLEAN;
  v_mutual BOOLEAN;
  v_target_status TEXT;
  v_my_status TEXT;
BEGIN
  IF v_uid IS NULL OR v_uid = target_user_id THEN
    RAISE EXCEPTION 'Invalid user';
  END IF;

  -- Check Block
  SELECT EXISTS (
    SELECT 1 FROM blocks 
    WHERE (blocker_id = v_uid AND blocked_id = target_user_id) 
       OR (blocker_id = target_user_id AND blocked_id = v_uid)
  ) INTO v_is_blocked;

  IF v_is_blocked THEN
    RAISE EXCEPTION 'Blocked';
  END IF;

  -- Generate Canonical Hash
  IF v_uid < target_user_id THEN
    v_hash := v_uid::text || '_' || target_user_id::text;
  ELSE
    v_hash := target_user_id::text || '_' || v_uid::text;
  END IF;

  -- Try finding existing
  SELECT id INTO v_conv_id FROM conversations WHERE participant_hash = v_hash;
  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Verify Mutual Follow
  SELECT EXISTS (
    SELECT 1 FROM follows WHERE follower_id = v_uid AND following_id = target_user_id AND status = 'ACCEPTED'
  ) AND EXISTS (
    SELECT 1 FROM follows WHERE follower_id = target_user_id AND following_id = v_uid AND status = 'ACCEPTED'
  ) INTO v_mutual;

  IF v_mutual THEN
    v_target_status := 'ACTIVE';
    v_my_status := 'ACTIVE';
  ELSE
    v_target_status := 'REQUEST';
    v_my_status := 'ACTIVE';
  END IF;

  -- Create Transactionally
  INSERT INTO conversations (participant_hash) VALUES (v_hash) RETURNING id INTO v_conv_id;

  INSERT INTO conversation_members (conversation_id, user_id, status) VALUES 
    (v_conv_id, v_uid, v_my_status),
    (v_conv_id, target_user_id, v_target_status);

  RETURN v_conv_id;
END;
$$;

-- 7. RLS POLICIES
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View conversation members" ON conversation_members FOR SELECT USING (
  user_id = auth.uid() OR conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
);

CREATE POLICY "View conversations" ON conversations FOR SELECT USING (
  id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
);

CREATE POLICY "View messages" ON messages FOR SELECT USING (
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid())
);

CREATE POLICY "Insert messages" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid() AND status = 'ACTIVE')
);

CREATE POLICY "Update own messages" ON messages FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY "View message attachments" ON message_attachments FOR SELECT USING (
  message_id IN (SELECT id FROM messages WHERE conversation_id IN (SELECT conversation_id FROM conversation_members WHERE user_id = auth.uid()))
);

-- 8. TRIGGERS
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_members;
