-- Migration for Message Actions (Reply, Unsend)
ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL;
