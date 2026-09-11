-- Index for notifications lookups by recipient and read status
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread ON public.notifications (recipient_id, is_read, created_at DESC);

