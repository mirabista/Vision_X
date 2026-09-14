-- Document Verification Module - Complete Schema
-- Follows the same pattern as the Video Analysis module (20260710_video_module_complete.sql)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main document analyses table
CREATE TABLE IF NOT EXISTS public.document_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    original_filename TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_size BIGINT,
    content_type TEXT,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued, processing, completed, failed
    progress INTEGER NOT NULL DEFAULT 0,
    trust_score NUMERIC,
    confidence NUMERIC,
    risk_level TEXT,
    verdict TEXT,
    document_type TEXT,
    executive_summary TEXT,
    error_message TEXT,
    processing_time_ms BIGINT,
    page_count INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document evidence table (structural flags, metadata findings, per-page forensics, OCR text)
CREATE TABLE IF NOT EXISTS public.document_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    evidence_type TEXT NOT NULL,  -- structural, metadata, page_forensics, ocr, reasoning, manager_decision
    key TEXT NOT NULL,
    value TEXT,
    confidence NUMERIC,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document reports table
CREATE TABLE IF NOT EXISTS public.document_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    user_id UUID NOT NULL,
    report_data JSONB,
    report_type TEXT DEFAULT 'json',
    executive_summary TEXT,
    pdf_path TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document agent results table
CREATE TABLE IF NOT EXISTS public.document_agent_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    agent_order INTEGER,
    status TEXT,
    confidence NUMERIC,
    findings JSONB,
    evidence JSONB,
    error_message TEXT,
    processing_time_ms NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign Keys
ALTER TABLE public.document_evidence
    ADD CONSTRAINT fk_document_evidence_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.document_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.document_reports
    ADD CONSTRAINT fk_document_reports_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.document_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.document_agent_results
    ADD CONSTRAINT fk_document_agent_results_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.document_analyses(id)
    ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_document_analyses_user_id ON public.document_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_document_analyses_status ON public.document_analyses(status);
CREATE INDEX IF NOT EXISTS idx_document_analyses_created_at ON public.document_analyses(created_at);

CREATE INDEX IF NOT EXISTS idx_document_evidence_analysis_id ON public.document_evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_document_evidence_type ON public.document_evidence(evidence_type);

CREATE INDEX IF NOT EXISTS idx_document_reports_analysis_id ON public.document_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_document_reports_user_id ON public.document_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_document_agent_results_analysis_id ON public.document_agent_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_document_agent_results_agent_name ON public.document_agent_results(agent_name);

-- Row Level Security
ALTER TABLE public.document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_agent_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_analyses
CREATE POLICY "Users can view own document analyses"
    ON public.document_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own document analyses"
    ON public.document_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own document analyses"
    ON public.document_analyses
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own document analyses"
    ON public.document_analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for document_evidence
CREATE POLICY "Users can view evidence of own document analyses"
    ON public.document_evidence
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.document_analyses WHERE document_analyses.id = document_evidence.analysis_id AND document_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert evidence for own document analyses"
    ON public.document_evidence
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.document_analyses WHERE document_analyses.id = document_evidence.analysis_id AND document_analyses.user_id = auth.uid()));

-- RLS Policies for document_reports
CREATE POLICY "Users can view reports of own document analyses"
    ON public.document_reports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert reports for own document analyses"
    ON public.document_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update reports of own document analyses"
    ON public.document_reports
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for document_agent_results
CREATE POLICY "Users can view agent results of own document analyses"
    ON public.document_agent_results
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.document_analyses WHERE document_analyses.id = document_agent_results.analysis_id AND document_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert agent results for own document analyses"
    ON public.document_agent_results
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.document_analyses WHERE document_analyses.id = document_agent_results.analysis_id AND document_analyses.user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.document_analyses TO authenticated;
GRANT ALL ON public.document_evidence TO authenticated;
GRANT ALL ON public.document_reports TO authenticated;
GRANT ALL ON public.document_agent_results TO authenticated;
