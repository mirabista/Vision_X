/**
 * VisionX Hooks — All progress tracking via database polling.
 * No SSE. No EventBus. Single source of truth: the database.
 */

import { apiClient } from "./api-client";

export interface AnalysisStatus {
  id: string;
  status: string;
  trust_score?: number;
  risk_level?: string;
  confidence?: number;
  verdict?: string;
  created_at?: string;
  completed_at?: string;
  error_message?: string | null;
}

export async function fetchJobStatus(analysisId: string): Promise<AnalysisStatus> {
  const data: any = await apiClient.getAnalysis(analysisId);
  const analysis = data.analysis || {};
  return {
    id: analysis.id || analysisId,
    status: analysis.status || "PENDING",
    trust_score: analysis.trust_score,
    risk_level: analysis.risk_level,
    confidence: analysis.confidence,
    verdict: analysis.verdict,
    created_at: analysis.created_at,
    completed_at: analysis.completed_at,
    error_message: analysis.error_message || null,
  };
}
