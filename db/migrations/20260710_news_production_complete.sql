-- ============================================================
-- VisionX News Verification Module - Complete Production Schema
-- Phase 2-4: Database Schema, Foreign Keys, Storage
-- ============================================================

-- 1. Ensure all required columns exist on news_analyses
ALTER TABLE public.news_analyses 
  ADD COLUMN IF NOT EXISTS trust_score DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS authenticity_score DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS authenticity_level TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS processing_time_ms BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS source_credibility DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bias_score DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS claim_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS evidence_count INTEGER DEFAULT 0;

-- 2. Ensure all required columns exist on news_reports
ALTER TABLE public.news_reports
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS recommendations JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS claims JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bias_analysis JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS context_analysis JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_explanation TEXT,
  ADD COLUMN IF NOT EXISTS processing_time_ms BIGINT DEFAULT 0;

-- 3. Ensure all required columns exist on news_agent_results
ALTER TABLE public.news_agent_results
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS findings JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS processing_time_ms BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS raw_output TEXT,
  ADD COLUMN IF NOT EXISTS processed_output JSONB DEFAULT '{}'::jsonb;

-- 4. Ensure all required columns exist on news_evidence
ALTER TABLE public.news_evidence
  ADD COLUMN IF NOT EXISTS claim TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS credibility DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS supports_claim BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS agent_name TEXT,
  ADD COLUMN IF NOT EXISTS evidence_type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS key TEXT,
  ADD COLUMN IF NOT EXISTS value TEXT,
  ADD COLUMN IF NOT EXISTS reference_url TEXT;

-- 5. Add foreign key constraints (if not exist)
-- Note: Supabase manages FKs differently, we use raw SQL via the migration tool
DO $$
BEGIN
  -- news_reports -> news_analyses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_reports_analysis' 
    AND table_name = 'news_reports'
  ) THEN
    ALTER TABLE public.news_reports 
      ADD CONSTRAINT fk_news_reports_analysis 
      FOREIGN KEY (analysis_id) 
      REFERENCES public.news_analyses(id) 
      ON DELETE CASCADE;
  END IF;

  -- news_agent_results -> news_analyses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_agent_results_analysis' 
    AND table_name = 'news_agent_results'
  ) THEN
    ALTER TABLE public.news_agent_results 
      ADD CONSTRAINT fk_news_agent_results_analysis 
      FOREIGN KEY (analysis_id) 
      REFERENCES public.news_analyses(id) 
      ON DELETE CASCADE;
  END IF;

  -- news_evidence -> news_analyses
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_evidence_analysis' 
    AND table_name = 'news_evidence'
  ) THEN
    ALTER TABLE public.news_evidence 
      ADD CONSTRAINT fk_news_evidence_analysis 
      FOREIGN KEY (analysis_id) 
      REFERENCES public.news_analyses(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_analyses_user_id ON public.news_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_news_analyses_status ON public.news_analyses(status);
CREATE INDEX IF NOT EXISTS idx_news_analyses_created_at ON public.news_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_analyses_user_status ON public.news_analyses(user_id, status);
CREATE INDEX IF NOT EXISTS idx_news_reports_analysis_id ON public.news_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_reports_user_id ON public.news_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_news_agent_results_analysis_id ON public.news_agent_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_evidence_analysis_id ON public.news_evidence(analysis_id);

-- 7. Row Level Security
ALTER TABLE public.news_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_evidence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate
DROP POLICY IF EXISTS "Users can view own news analyses" ON public.news_analyses;
DROP POLICY IF EXISTS "Users can insert own news analyses" ON public.news_analyses;
DROP POLICY IF EXISTS "Users can update own news analyses" ON public.news_analyses;
DROP POLICY IF EXISTS "Users can delete own news analyses" ON public.news_analyses;
DROP POLICY IF EXISTS "Service role full access news_analyses" ON public.news_analyses;

DROP POLICY IF EXISTS "Users can view own news reports" ON public.news_reports;
DROP POLICY IF EXISTS "Users can insert own news reports" ON public.news_reports;
DROP POLICY IF EXISTS "Users can update own news reports" ON public.news_reports;
DROP POLICY IF EXISTS "Users can delete own news reports" ON public.news_reports;
DROP POLICY IF EXISTS "Service role full access news_reports" ON public.news_reports;

DROP POLICY IF EXISTS "Users can view own agent results" ON public.news_agent_results;
DROP POLICY IF EXISTS "Service role full access news_agent_results" ON public.news_agent_results;

DROP POLICY IF EXISTS "Users can view own evidence" ON public.news_evidence;
DROP POLICY IF EXISTS "Service role full access news_evidence" ON public.news_evidence;

-- news_analyses policies
CREATE POLICY "Users can view own news analyses" 
  ON public.news_analyses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own news analyses" 
  ON public.news_analyses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news analyses" 
  ON public.news_analyses FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own news analyses" 
  ON public.news_analyses FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access news_analyses" 
  ON public.news_analyses FOR ALL 
  USING (auth.role() = 'service_role');

-- news_reports policies
CREATE POLICY "Users can view own news reports" 
  ON public.news_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own news reports" 
  ON public.news_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own news reports" 
  ON public.news_reports FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own news reports" 
  ON public.news_reports FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access news_reports" 
  ON public.news_reports FOR ALL 
  USING (auth.role() = 'service_role');

-- news_agent_results policies
CREATE POLICY "Users can view own agent results" 
  ON public.news_agent_results FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.news_analyses 
      WHERE news_analyses.id = news_agent_results.analysis_id 
      AND news_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access news_agent_results" 
  ON public.news_agent_results FOR ALL 
  USING (auth.role() = 'service_role');

-- news_evidence policies
CREATE POLICY "Users can view own evidence" 
  ON public.news_evidence FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.news_analyses 
      WHERE news_analyses.id = news_evidence.analysis_id 
      AND news_analyses.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role full access news_evidence" 
  ON public.news_evidence FOR ALL 
  USING (auth.role() = 'service_role');

-- 8. Ensure storage buckets exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES 
  ('visionx-news', 'visionx-news', true, false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']),
  ('visionx-reports', 'visionx-reports', true, false, 52428800, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policies
DROP POLICY IF EXISTS "Public Access visionx-news" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload visionx-news" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete visionx-news" ON storage.objects;
DROP POLICY IF EXISTS "Public Access visionx-reports" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload visionx-reports" ON storage.objects;
DROP POLICY IF EXISTS "Owner Delete visionx-reports" ON storage.objects;

-- visionx-news bucket policies
CREATE POLICY "Public Access visionx-news" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'visionx-news');

CREATE POLICY "Authenticated Upload visionx-news" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'visionx-news' AND auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Owner Delete visionx-news" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'visionx-news' AND (auth.uid() = owner OR auth.role() = 'service_role'));

-- visionx-reports bucket policies
CREATE POLICY "Public Access visionx-reports" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'visionx-reports');

CREATE POLICY "Authenticated Upload visionx-reports" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'visionx-reports' AND auth.role() IN ('authenticated', 'service_role'));

CREATE POLICY "Owner Delete visionx-reports" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'visionx-reports' AND (auth.uid() = owner OR auth.role() = 'service_role'));