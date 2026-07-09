"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "./api-client";

export interface AgentProgress {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  processing_time_ms?: number;
}

export interface AnalysisJobStatus {
  id: string;
  status: string;
  progress: number;
  current_agent: string;
  current_step: string;
  trust_score: number;
  risk_level: string;
  estimated_remaining_seconds: number;
  thumbnail_url: string;
  image_url: string;
  completed_agents: AgentProgress[];
  agent_results: Record<string, any>;
  report_id: string | null;
  error_message: string | null;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

export function useAnalysisProgress(analysisId: string | null, module: "image" | "news" = "image") {
  const router = useRouter();
  const [status, setStatus] = useState<string>("PENDING");
  const [progress, setProgress] = useState<number>(0);
  const [agents, setAgents] = useState<AgentProgress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [jobData, setJobData] = useState<AnalysisJobStatus | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!analysisId) return;

    const poll = async () => {
      try {
        const data: any = module === "news"
          ? await apiClient.getNewsAnalysis(analysisId)
          : await apiClient.getAnalysis(analysisId);
        const job = data.analysis || data.job || data;
        const normalizedStatus = String(job.status || "pending").toLowerCase();

        setJobData(job);
        setStatus(normalizedStatus);
        setProgress(job.progress || 0);
        setError(job.error_message || null);

        if (job.completed_agents) {
          setAgents(job.completed_agents);
        }

        if (job.report_id) {
          setReportId(job.report_id);
        }

        // Terminal states
        if (normalizedStatus === "completed" && job.report_id) {
          stopPolling();
          setTimeout(() => {
            router.push(`/reports/${job.report_id}`);
          }, 500);
        } else if (normalizedStatus === "failed" || normalizedStatus === "cancelled") {
          stopPolling();
        }
      } catch (e: any) {
        console.error("Polling error:", e);
        if (e.message?.includes("404")) {
          stopPolling();
          setError("Analysis not found");
        }
      }
    };

    // Poll immediately, then every 1000ms
    poll();
    pollingRef.current = setInterval(poll, 1000);

    return () => {
      stopPolling();
    };
    }, [analysisId, module, router, stopPolling]);

  return { status, progress, agents, error, reportId, jobData };
}
