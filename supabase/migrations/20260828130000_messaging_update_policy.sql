-- Allow users to update their own conversation_members row (e.g. last_read_at, status)
CREATE POLICY "Users can update their own conversation member record" 
ON conversation_members 
FOR UPDATE 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());
