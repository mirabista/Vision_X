-- Add trust_score and related columns to news_analyses
ALTER TABLE IF EXISTS public.news_analyses 
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC,
  ADD COLUMN IF NOT EXISTS authenticity_score NUMERIC,
  ADD COLUMN IF NOT EXISTS authenticity_level TEXT,
  ADD COLUMN IF NOT EXISTS executive_summary TEXT,
  ADD COLUMN IF NOT EXISTS processing_time_ms NUMERIC;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_analyses_user_id ON public.news_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_news_analyses_status ON public.news_analyses(status);
CREATE INDEX IF NOT EXISTS idx_news_analyses_created_at ON public.news_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_agent_results_analysis_id ON public.news_agent_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_evidence_analysis_id ON public.news_evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_news_reports_analysis_id ON public.news_reports(analysis_id);