-- Production schema alignment for News Verification module

-- 1. Add missing columns to news_analyses
ALTER TABLE IF EXISTS public.news_analyses 
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC,
  ADD COLUMN IF NOT EXISTS authenticity_score NUMERIC,
  ADD COLUMN IF NOT EXISTS authenticity_level TEXT,
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS processing_time_ms NUMERIC,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ADD COLUMN IF NOT EXISTS current_agent TEXT,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Update news_reports to remove FK constraint and add proper fields
ALTER TABLE IF EXISTS public.news_reports 
  DROP CONSTRAINT IF EXISTS news_reports_analysis_id_fkey;

ALTER TABLE IF EXISTS public.news_reports 
  ADD COLUMN IF NOT EXISTS report_json JSONB,
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS recommendations TEXT[],
  ADD COLUMN IF NOT EXISTS confidence NUMERIC,
  ADD COLUMN IF NOT EXISTS risk_level TEXT,
  ADD COLUMN IF NOT EXISTS verdict TEXT,
  ADD COLUMN IF NOT EXISTS pdf_path TEXT,
  ADD COLUMN IF NOT EXISTS pdf_url TEXT,
  ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Update news_agent_results with proper schema
ALTER TABLE IF EXISTS public.news_agent_results 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS execution_time_ms NUMERIC,
  ADD COLUMN IF NOT EXISTS input JSONB,
  ADD COLUMN IF NOT EXISTS output JSONB,
  ADD COLUMN IF NOT EXISTS findings JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS error TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Update news_evidence with proper schema
ALTER TABLE IF EXISTS public.news_evidence 
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ADD COLUMN IF NOT EXISTS claim TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS credibility NUMERIC,
  ADD COLUMN IF NOT EXISTS supports_claim BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_analyses_user_id ON public.news_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_news_analyses_status ON public.news_analyses(status);
CREATE INDEX IF NOT EXISTS idx_news_analyses_created_at ON public.news_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_analyses_verdict ON public.news_analyses(verdict);
CREATE INDEX IF NOT EXISTS idx_news_reports_user_id ON public.news_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_news_reports_analysis_id ON public.news_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_agent_results_analysis_id ON public.news_agent_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_evidence_analysis_id ON public.news_evidence(analysis_id);

-- 6. Enable RLS
ALTER TABLE IF EXISTS public.news_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.news_evidence ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies
DROP POLICY IF EXISTS "Users can view own news analyses" ON public.news_analyses;
CREATE POLICY "Users can view own news analyses" ON public.news_analyses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own news analyses" ON public.news_analyses;
CREATE POLICY "Users can insert own news analyses" ON public.news_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own news analyses" ON public.news_analyses;
CREATE POLICY "Users can update own news analyses" ON public.news_analyses
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own news analyses" ON public.news_analyses;
CREATE POLICY "Users can delete own news analyses" ON public.news_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- News reports policies
DROP POLICY IF EXISTS "Users can view own news reports" ON public.news_reports;
CREATE POLICY "Users can view own news reports" ON public.news_reports
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own news reports" ON public.news_reports;
CREATE POLICY "Users can insert own news reports" ON public.news_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- News agent results policies
DROP POLICY IF EXISTS "Users can view agent results for own analyses" ON public.news_agent_results;
CREATE POLICY "Users can view agent results for own analyses" ON public.news_agent_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.news_analyses 
      WHERE news_analyses.id = news_agent_results.analysis_id AND news_analyses.user_id = auth.uid()
    )
  );

-- News evidence policies
DROP POLICY IF EXISTS "Users can view evidence for own analyses" ON public.news_evidence;
CREATE POLICY "Users can view evidence for own analyses" ON public.news_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.news_analyses 
      WHERE news_analyses.id = news_evidence.analysis_id AND news_analyses.user_id = auth.uid()
    )
  );