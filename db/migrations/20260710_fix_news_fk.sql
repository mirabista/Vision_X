-- Fix foreign key constraint for news_agent_results
-- Drop incorrect FK referencing analysis_jobs
-- Add correct FK referencing news_analyses

DO $$
BEGIN
  -- Drop the incorrect FK if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_agent_results_analysis' 
    AND table_name = 'news_agent_results'
  ) THEN
    ALTER TABLE public.news_agent_results 
      DROP CONSTRAINT fk_news_agent_results_analysis;
  END IF;

  -- Add correct FK referencing news_analyses
  ALTER TABLE public.news_agent_results 
    ADD CONSTRAINT fk_news_agent_results_analysis 
    FOREIGN KEY (analysis_id) 
    REFERENCES public.news_analyses(id) 
    ON DELETE CASCADE;
END $$;

-- Also fix evidence table FK if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_evidence_analysis' 
    AND table_name = 'news_evidence'
  ) THEN
    ALTER TABLE public.news_evidence 
      DROP CONSTRAINT fk_news_evidence_analysis;
  END IF;

  ALTER TABLE public.news_evidence 
    ADD CONSTRAINT fk_news_evidence_analysis 
    FOREIGN KEY (analysis_id) 
    REFERENCES public.news_analyses(id) 
    ON DELETE CASCADE;
END $$;

-- Fix reports FK
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_news_reports_analysis' 
    AND table_name = 'news_reports'
  ) THEN
    ALTER TABLE public.news_reports 
      DROP CONSTRAINT fk_news_reports_analysis;
  END IF;

  ALTER TABLE public.news_reports 
    ADD CONSTRAINT fk_news_reports_analysis 
    FOREIGN KEY (analysis_id) 
    REFERENCES public.news_analyses(id) 
    ON DELETE CASCADE;
END $$;