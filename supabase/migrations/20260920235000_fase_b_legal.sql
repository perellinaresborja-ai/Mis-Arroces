-- 1. Add DSA columns to moderation_reports
ALTER TABLE public.moderation_reports 
ADD COLUMN IF NOT EXISTS is_dsa_report BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dsa_statement_good_faith BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dsa_submitter_email TEXT;

ALTER TABLE public.moderation_reports DROP CONSTRAINT IF EXISTS moderation_reports_target_type_check;
ALTER TABLE public.moderation_reports ADD CONSTRAINT moderation_reports_target_type_check CHECK (target_type IN ('POST', 'COMMENT', 'COMMENT_REPLY', 'RECIPE', 'STORY', 'USER', 'MESSAGE', 'URL'));

-- 2. Update legal_documents constraint to allow AGE_18
ALTER TABLE legal_documents DROP CONSTRAINT IF EXISTS legal_documents_document_type_check;
ALTER TABLE legal_documents ADD CONSTRAINT legal_documents_document_type_check CHECK (document_type IN ('TERMS', 'PRIVACY', 'AGE_18', 'COOKIES'));

-- 3. Deactivate old legal documents
UPDATE legal_documents SET is_active = false WHERE is_active = true;

-- 4. Insert new Phase B active documents
INSERT INTO legal_documents (document_type, version, is_active, url) 
VALUES 
  ('TERMS', '2.0', true, '/legal/terms'),
  ('PRIVACY', '2.0', true, '/legal/privacy'),
  ('AGE_18', '1.0', true, NULL)
ON CONFLICT (document_type, version) DO UPDATE SET is_active = true;
