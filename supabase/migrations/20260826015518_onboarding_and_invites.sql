-- Add onboarding and invite fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE;

-- Generate invite codes for existing profiles
UPDATE profiles SET invite_code = substr(md5(random()::text), 1, 8) WHERE invite_code IS NULL;

-- Make invite_code not null going forward? Wait, for new users it needs to be generated.
-- Let's create a trigger to auto-generate invite_code for new profiles if not provided.
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    -- generate an 8 char alphanumeric code
    NEW.invite_code := substr(md5(random()::text), 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ensure_invite_code ON profiles;
CREATE TRIGGER ensure_invite_code
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION generate_invite_code();

-- Create invite_referrals table
CREATE TABLE IF NOT EXISTS invite_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for invite_referrals
ALTER TABLE invite_referrals ENABLE ROW LEVEL SECURITY;

-- Anyone can read referrals (or just authenticated users)
CREATE POLICY "Referrals are viewable by authenticated users" 
ON invite_referrals FOR SELECT 
TO authenticated 
USING (true);

-- Only authenticated users can insert (themselves as invited)
CREATE POLICY "Users can insert their own referral" 
ON invite_referrals FOR INSERT 
TO authenticated 
WITH CHECK (invited_user_id = auth.uid());

-- Prevent updates/deletes to referrals
