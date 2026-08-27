CREATE POLICY "Users can insert message attachments for own messages" ON message_attachments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
  )
);

CREATE POLICY "Users can delete message attachments for own messages" ON message_attachments
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM messages
    WHERE messages.id = message_attachments.message_id
      AND messages.sender_id = auth.uid()
  )
);
