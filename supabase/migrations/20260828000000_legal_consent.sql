-- Up Migration
CREATE TABLE IF NOT EXISTS legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL CHECK (document_type IN ('TERMS', 'PRIVACY')),
  version TEXT NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(document_type, version)
);

CREATE TABLE IF NOT EXISTS user_legal_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, document_id)
);

-- Insert initial active documents
INSERT INTO legal_documents (document_type, version, is_active, url) 
VALUES ('TERMS', '1.0', true, '/legal/terms') 
ON CONFLICT DO NOTHING;

INSERT INTO legal_documents (document_type, version, is_active, url) 
VALUES ('PRIVACY', '1.0', true, '/legal/privacy') 
ON CONFLICT DO NOTHING;

-- RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_legal_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view legal documents" ON legal_documents;
CREATE POLICY "Anyone can view legal documents" ON legal_documents
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can view their own acceptances" ON user_legal_acceptances;
CREATE POLICY "Users can view their own acceptances" ON user_legal_acceptances
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own acceptances" ON user_legal_acceptances;
CREATE POLICY "Users can insert their own acceptances" ON user_legal_acceptances
  FOR INSERT WITH CHECK (auth.uid() = user_id);
