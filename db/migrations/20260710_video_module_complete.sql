-- Video Analysis Module - Complete Schema
-- Follows Evidence-First architecture like News Verification

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Main video analyses table
CREATE TABLE IF NOT EXISTS public.video_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    input_type TEXT NOT NULL,  -- upload, url, youtube
    input_content TEXT NOT NULL,  -- video URL or file path
    source_url TEXT,
    title TEXT,
    status TEXT NOT NULL DEFAULT 'queued',  -- queued, processing, completed, failed
    progress INTEGER NOT NULL DEFAULT 0,
    trust_score NUMERIC,
    authenticity_score NUMERIC,
    authenticity_level TEXT,
    risk_level TEXT,
    verdict TEXT,
    confidence NUMERIC,
    metadata JSONB,
    executive_summary TEXT,
    error_message TEXT,
    processing_time_ms BIGINT,
    claim_count INTEGER,
    evidence_count INTEGER,
    frame_count INTEGER,
    audio_duration_seconds NUMERIC,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video frames table
CREATE TABLE IF NOT EXISTS public.video_frames (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    frame_number INTEGER NOT NULL,
    timestamp_seconds NUMERIC NOT NULL,
    frame_path TEXT,
    thumbnail_path TEXT,
    scene_change BOOLEAN DEFAULT FALSE,
    motion_score NUMERIC,
    ocr_text TEXT,
    objects_detected JSONB,
    faces_detected JSONB,
    deepfake_score NUMERIC,
    manipulation_indicators JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video evidence table
CREATE TABLE IF NOT EXISTS public.video_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    evidence_type TEXT NOT NULL,  -- frame, audio, ocr, deepfake, external
    key TEXT NOT NULL,
    value TEXT,
    reference_url TEXT,
    confidence NUMERIC,
    claim TEXT,
    source TEXT,
    url TEXT,
    excerpt TEXT,
    credibility NUMERIC,
    supports_claim BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video audio table
CREATE TABLE IF NOT EXISTS public.video_audio (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    audio_path TEXT,
    transcript TEXT,
    language_detected TEXT,
    confidence NUMERIC,
    speaker_segments JSONB,
    silence_periods JSONB,
    audio_manipulation_indicators JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video reports table
CREATE TABLE IF NOT EXISTS public.video_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    user_id UUID NOT NULL,
    report_data JSONB,
    report_type TEXT DEFAULT 'json',
    executive_summary TEXT,
    executive_summary_short TEXT,
    recommendations JSONB,
    claims JSONB,
    evidence JSONB,
    sources JSONB,
    frame_analysis JSONB,
    ocr_findings JSONB,
    audio_findings JSONB,
    deepfake_findings JSONB,
    bias_analysis JSONB,
    context_analysis JSONB,
    ai_explanation TEXT,
    processing_time_ms BIGINT,
    pdf_path TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video agent results table
CREATE TABLE IF NOT EXISTS public.video_agent_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL,
    agent_name TEXT NOT NULL,
    agent_order INTEGER,
    status TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms NUMERIC,
    confidence NUMERIC,
    reasoning TEXT,
    summary TEXT,
    raw_output JSONB,
    evidence JSONB,
    error_message TEXT,
    retry_count INTEGER,
    findings JSONB,
    processing_time_ms BIGINT,
    processed_output JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Foreign Keys
ALTER TABLE public.video_frames
    ADD CONSTRAINT fk_video_frames_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.video_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.video_evidence
    ADD CONSTRAINT fk_video_evidence_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.video_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.video_audio
    ADD CONSTRAINT fk_video_audio_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.video_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.video_reports
    ADD CONSTRAINT fk_video_reports_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.video_analyses(id)
    ON DELETE CASCADE;

ALTER TABLE public.video_agent_results
    ADD CONSTRAINT fk_video_agent_results_analysis
    FOREIGN KEY (analysis_id)
    REFERENCES public.video_analyses(id)
    ON DELETE CASCADE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_video_analyses_user_id ON public.video_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_video_analyses_status ON public.video_analyses(status);
CREATE INDEX IF NOT EXISTS idx_video_analyses_created_at ON public.video_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_video_analyses_module_type ON public.video_analyses(input_type);

CREATE INDEX IF NOT EXISTS idx_video_frames_analysis_id ON public.video_frames(analysis_id);
CREATE INDEX IF NOT EXISTS idx_video_frames_timestamp ON public.video_frames(timestamp_seconds);

CREATE INDEX IF NOT EXISTS idx_video_evidence_analysis_id ON public.video_evidence(analysis_id);
CREATE INDEX IF NOT EXISTS idx_video_evidence_type ON public.video_evidence(evidence_type);

CREATE INDEX IF NOT EXISTS idx_video_audio_analysis_id ON public.video_audio(analysis_id);

CREATE INDEX IF NOT EXISTS idx_video_reports_analysis_id ON public.video_reports(analysis_id);
CREATE INDEX IF NOT EXISTS idx_video_reports_user_id ON public.video_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_video_agent_results_analysis_id ON public.video_agent_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_video_agent_results_agent_name ON public.video_agent_results(agent_name);

-- Enable Row Level Security
ALTER TABLE public.video_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_audio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_agent_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for video_analyses
CREATE POLICY "Users can view own video analyses"
    ON public.video_analyses
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video analyses"
    ON public.video_analyses
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video analyses"
    ON public.video_analyses
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own video analyses"
    ON public.video_analyses
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for video_frames
CREATE POLICY "Users can view frames of own analyses"
    ON public.video_frames
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_frames.analysis_id AND video_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert frames for own analyses"
    ON public.video_frames
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_frames.analysis_id AND video_analyses.user_id = auth.uid()));

-- RLS Policies for video_evidence
CREATE POLICY "Users can view evidence of own analyses"
    ON public.video_evidence
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_evidence.analysis_id AND video_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert evidence for own analyses"
    ON public.video_evidence
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_evidence.analysis_id AND video_analyses.user_id = auth.uid()));

-- RLS Policies for video_audio
CREATE POLICY "Users can view audio of own analyses"
    ON public.video_audio
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_audio.analysis_id AND video_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert audio for own analyses"
    ON public.video_audio
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_audio.analysis_id AND video_analyses.user_id = auth.uid()));

-- RLS Policies for video_reports
CREATE POLICY "Users can view reports of own analyses"
    ON public.video_reports
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert reports for own analyses"
    ON public.video_reports
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update reports of own analyses"
    ON public.video_reports
    FOR UPDATE
    USING (auth.uid() = user_id);

-- RLS Policies for video_agent_results
CREATE POLICY "Users can view agent results of own analyses"
    ON public.video_agent_results
    FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_agent_results.analysis_id AND video_analyses.user_id = auth.uid()));

CREATE POLICY "Users can insert agent results for own analyses"
    ON public.video_agent_results
    FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM public.video_analyses WHERE video_analyses.id = video_agent_results.analysis_id AND video_analyses.user_id = auth.uid()));

-- Grant permissions
GRANT ALL ON public.video_analyses TO authenticated;
GRANT ALL ON public.video_frames TO authenticated;
GRANT ALL ON public.video_evidence TO authenticated;
GRANT ALL ON public.video_audio TO authenticated;
GRANT ALL ON public.video_reports TO authenticated;
GRANT ALL ON public.video_agent_results TO authenticated;