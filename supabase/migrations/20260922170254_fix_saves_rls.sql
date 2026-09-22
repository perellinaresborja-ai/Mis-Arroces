-- Enable SELECT and DELETE policies for saves
CREATE POLICY "Users can view their own saves" ON saves
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own saves" ON saves
FOR DELETE TO authenticated
USING (user_id = auth.uid());
