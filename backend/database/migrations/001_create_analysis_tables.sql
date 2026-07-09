-- VisionX Database Migration: Create analysis tables
-- Creates tables for the multi-agent forensic analysis pipeline

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Analysis Jobs
CREATE TABLE analysis_jobs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL,
    module_type VARCHAR(32) NOT NULL DEFAULT 'image',
    input_type VARCHAR(32),
    input_content TEXT,
    source_url VARCHAR(2048),
    title VARCHAR(255),
    status VARCHAR(32) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    current_agent VARCHAR(128),
    current_stage VARCHAR(64),
    estimated_duration INTEGER DEFAULT 120,
    overall_confidence FLOAT,
    overall_verdict VARCHAR(64),
    risk_level VARCHAR(32) DEFAULT 'medium',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    extra_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX idx_jobs_status ON analysis_jobs(status);
CREATE INDEX idx_jobs_module_type ON analysis_jobs(module_type);
CREATE INDEX idx_jobs_created_at ON analysis_jobs(created_at);

-- Agent Results
CREATE TABLE agent_results (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    analysis_id VARCHAR(36) NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    agent_name VARCHAR(128) NOT NULL,
    agent_order INTEGER DEFAULT 0,
    agent_group INTEGER DEFAULT 1,
    handler VARCHAR(128),
    status VARCHAR(32) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 0.0,
    reasoning TEXT,
    summary TEXT,
    raw_output JSONB DEFAULT '{}',
    evidence JSONB DEFAULT '{}',
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    is_critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_agent_result_analysis ON agent_results(analysis_id);
CREATE INDEX idx_agent_result_name ON agent_results(agent_name);

-- Agent Logs
CREATE TABLE agent_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    analysis_id VARCHAR(36) NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    agent_name VARCHAR(128),
    level VARCHAR(16) DEFAULT 'info',
    message TEXT NOT NULL,
    correlation_id VARCHAR(36),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_log_analysis ON agent_logs(analysis_id);
CREATE INDEX idx_log_timestamp ON agent_logs(timestamp);

-- Evidence Items
CREATE TABLE evidence_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    analysis_id VARCHAR(36) NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    agent_name VARCHAR(128) NOT NULL,
    evidence_type VARCHAR(64) NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    reference_url VARCHAR(2048),
    confidence FLOAT DEFAULT 0.0,
    is_exculpatory BOOLEAN DEFAULT FALSE,
    is_inculpatory BOOLEAN DEFAULT FALSE,
    extra_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_evidence_analysis ON evidence_items(analysis_id);
CREATE INDEX idx_evidence_agent ON evidence_items(agent_name);

-- Uploads
CREATE TABLE uploads (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path VARCHAR(2048) NOT NULL,
    public_url VARCHAR(2048),
    mime_type VARCHAR(128),
    file_size BIGINT,
    status VARCHAR(32) DEFAULT 'completed',
    extra_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_uploads_user_id ON uploads(user_id);
CREATE INDEX idx_uploads_created_at ON uploads(created_at);

-- Reports (main reports table for user-facing reports)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL,
    analysis_id VARCHAR(36) NOT NULL REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    upload_id VARCHAR(36) REFERENCES uploads(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    trust_score INTEGER,
    authenticity_status VARCHAR(64) DEFAULT 'unknown',
    risk_level VARCHAR(32) DEFAULT 'medium',
    verdict VARCHAR(64),
    report_data JSONB DEFAULT '{}',
    pdf_url VARCHAR(2048),
    pdf_path VARCHAR(1024),
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE incidents (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL,
    analysis_id VARCHAR(36) REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    reason TEXT,
    severity VARCHAR(32) DEFAULT 'medium',
    trust_score INTEGER,
    status VARCHAR(32) DEFAULT 'open',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_analysis_id ON incidents(analysis_id);
CREATE INDEX idx_incidents_created_at ON incidents(created_at);
