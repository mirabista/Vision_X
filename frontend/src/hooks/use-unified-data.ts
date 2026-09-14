/**
 * VisionX Unified Data Hooks
 * Shared hooks for all modules (Image, News, Video)
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { unifiedApi } from "@/lib/unified-api";

// ==================== useAnalyses ====================
export function useAnalyses(module: string = "all", params?: { limit?: number; offset?: number; status?: string }, enabled: boolean = true) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await unifiedApi.listAnalyses(module, params);
      setData(result.analyses || []);
      setCount(result.count || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load analyses");
    } finally {
      setLoading(false);
    }
  }, [module, JSON.stringify(params)]);

  useEffect(() => { if (enabled) load(); }, [load, enabled]);

  return { data, count, loading, error, refresh: load };
}

// ==================== useReports ====================
export function useReports(module: string = "all", params?: { limit?: number; offset?: number }) {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await unifiedApi.listReports(module, params);
      setData(result.reports || []);
      setCount(result.count || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [module, JSON.stringify(params)]);

  useEffect(() => { load(); }, [load]);

  return { data, count, loading, error, refresh: load };
}

// ==================== useDashboard ====================
export function useDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await unifiedApi.getDashboardStats();
      setStats(result);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { stats, loading, error, refresh: load };
}

// ==================== usePolling ====================
export function usePolling(callback: () => void, intervalMs: number = 3000, enabled: boolean = true) {
  const savedCallback = useRef(callback);

  useEffect(() => { savedCallback.current = callback; }, [callback]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}

// ==================== useAnalysisDetail ====================
export function useAnalysisDetail(module: string, id: string | undefined, enabled: boolean = true) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [polling, setPolling] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const result = await unifiedApi.getAnalysis(module, id);
      const analysis = result.analysis || result.data?.analysis || result;
      setData(result);
      setLoading(false);
      if (analysis?.status === "completed" || analysis?.status === "failed") {
        setPolling(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load analysis");
      setLoading(false);
      setPolling(false);
    }
  }, [module, id]);

  useEffect(() => { if (enabled) load(); }, [load, enabled]);

  usePolling(load, 3000, enabled && polling && !!id);

  return { data, loading, error, polling, setPolling, refresh: load };
}