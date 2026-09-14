/**
 * VisionX Unified API Client
 * Single consistent API layer for all modules (Image, News, Video)
 * Routes to correct backend endpoint based on module type.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class UnifiedAPIClient {
  private token: string | null = null;

  setToken(token: string) { this.token = token; }
  clearToken() { this.token = null; }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (options.headers) Object.assign(headers, options.headers as Record<string, string>);

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // ==================== MODULE-ROUTED ENDPOINTS ====================
  private modulePath(module: string): string {
    switch (module) {
      case "image": return "/api/v1/analysis";
      case "news": return "/api/v1/news";
      case "video": return "/api/video";
      case "document": return "/api/document";
      default: return "/api/v1/analysis";
    }
  }

  // ==================== ANALYSIS ====================
  async startAnalysis(module: string, data: { input_type?: string; input_content: string; title?: string; source_url?: string }) {
    if (module === "news") {
      const formData = new FormData();
      formData.append("input_type", data.input_type || "article");
      formData.append("input_content", data.input_content);
      if (data.title) formData.append("title", data.title);
      if (data.source_url) formData.append("source_url", data.source_url);
      const headers: Record<string, string> = {};
      if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
      const response = await fetch(`${API_BASE_URL}/api/v1/news/analyze`, { method: "POST", body: formData, headers });
      if (!response.ok) throw new Error((await response.json()).detail || "Analysis failed");
      return response.json();
    }
    if (module === "video") {
      return this.request<{ success: boolean; analysis_id: string; status: string }>(
        `${this.modulePath(module)}/upload`,
        { method: "POST", body: JSON.stringify(data) }
      );
    }
    return this.request<{ success: boolean; analysis_id: string; module: string; status: string }>(
      `${this.modulePath(module)}/analyze`,
      { method: "POST", body: JSON.stringify({ module, ...data }) }
    );
  }

  // The image module's backend routes are all plural ("/analyses"); news and
  // video use singular ("/analysis"). The video list route is "/history".
  private analysisListPath(module: string): string {
    switch (module) {
      case "image": return `${this.modulePath(module)}/analyses`;
      case "video": case "document": return `${this.modulePath(module)}/history`;
      default: return `${this.modulePath(module)}/analysis`;
    }
  }

  private analysisDetailPath(module: string, id: string): string {
    const segment = module === "image" ? "analyses" : "analysis";
    return `${this.modulePath(module)}/${segment}/${id}`;
  }

  async getAnalysis(module: string, id: string) {
    return this.request<any>(this.analysisDetailPath(module, id));
  }

  async listAnalyses(module: string = "all", params?: { limit?: number; offset?: number; status?: string }) {
    if (module === "all") {
      // Fetch from all modules and combine
      const [image, news, video, document_] = await Promise.all([
        this.request<{ success: boolean; analyses: any[]; count: number }>(`/api/v1/analysis/analyses?${new URLSearchParams({ ...(params as any), module: "image" }).toString()}`).catch(() => ({ analyses: [], count: 0 })),
        this.request<{ success: boolean; analyses: any[]; count: number }>(`/api/v1/news/analysis?${new URLSearchParams(params as any).toString()}`).catch(() => ({ analyses: [], count: 0 })),
        this.request<{ success: boolean; analyses: any[]; count: number }>(`/api/video/history?${new URLSearchParams(params as any).toString()}`).catch(() => ({ analyses: [], count: 0 })),
        this.request<{ success: boolean; analyses: any[]; count: number }>(`/api/document/history?${new URLSearchParams(params as any).toString()}`).catch(() => ({ analyses: [], count: 0 })),
      ]);
      const combined = [
        ...(image.analyses || []).map((a: any) => ({ ...a, module: "image" })),
        ...(news.analyses || []).map((a: any) => ({ ...a, module: "news" })),
        ...(video.analyses || []).map((a: any) => ({ ...a, module: "video" })),
        ...(document_.analyses || []).map((a: any) => ({ ...a, module: "document" })),
      ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return { analyses: combined.slice(0, params?.limit || 50), count: combined.length };
    }
    // The image module's list endpoint is the shared/generic analysis_jobs
    // table (also used internally by other modules), so it needs an explicit
    // module filter or it returns every module's rows.
    const queryParams = module === "image" ? { ...(params as any), module: "image" } : (params as any);
    return this.request<{ success: boolean; analyses: any[]; count: number }>(
      `${this.analysisListPath(module)}?${new URLSearchParams(queryParams).toString()}`
    );
  }

  async deleteAnalysis(module: string, id: string) {
    return this.request<{ success: boolean; message: string }>(this.analysisDetailPath(module, id), { method: "DELETE" });
  }

  // ==================== REPORTS ====================
  async listReports(module: string = "all", params?: { limit?: number; offset?: number }) {
    if (module === "all") {
      const [image, news, video, document_] = await Promise.all([
        this.request<{ success: boolean; reports: any[]; count: number }>(`/api/v1/reports/?${new URLSearchParams(params as any).toString()}`).catch(() => ({ reports: [], count: 0 })),
        this.request<{ success: boolean; reports: any[]; count: number }>(`/api/v1/news/reports?${new URLSearchParams(params as any).toString()}`).catch(() => ({ reports: [], count: 0 })),
        this.request<{ success: boolean; reports: any[]; count: number }>(`/api/video/reports?${new URLSearchParams(params as any).toString()}`).catch(() => ({ reports: [], count: 0 })),
        this.request<{ success: boolean; reports: any[]; count: number }>(`/api/document/reports?${new URLSearchParams(params as any).toString()}`).catch(() => ({ reports: [], count: 0 })),
      ]);
      const combined = [
        ...(image.reports || []).map((r: any) => ({ ...r, module: "image" })),
        ...(news.reports || []).map((r: any) => ({ ...r, module: "news" })),
        ...(video.reports || []).map((r: any) => ({ ...r, module: "video" })),
        ...(document_.reports || []).map((r: any) => ({ ...r, module: "document" })),
      ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      return { reports: combined.slice(0, params?.limit || 50), count: combined.length };
    }
    return this.request<{ success: boolean; reports: any[]; count: number }>(
      module === "video" || module === "document"
        ? `${this.modulePath(module)}/reports`
        : `/api/v1/reports/?${new URLSearchParams(params as any).toString()}`
    );
  }

  async getReport(module: string, id: string) {
    if (module === "video" || module === "document") return this.request<any>(`${this.modulePath(module)}/report/${id}`);
    return this.request<any>(`/api/v1/reports/${id}`);
  }

  // ==================== DASHBOARD ====================
  async getDashboardStats() {
    const [image, news, video, document_] = await Promise.all([
      this.request<{ success: boolean; stats: any }>("/api/v1/dashboard/").catch(() => ({ stats: {} })),
      this.request<{ success: boolean; stats: any }>("/api/v1/news/dashboard").catch(() => ({ stats: {} })),
      this.request<{ success: boolean; stats: any }>("/api/video/dashboard").catch(() => ({ stats: {} })),
      this.request<{ success: boolean; stats: any }>("/api/document/dashboard").catch(() => ({ stats: {} })),
    ]);

    const i = image.stats || {};
    const n = news.stats || {};
    const v = video.stats || {};
    const d = document_.stats || {};

    return {
      total_analyses: (i.total_analyses || 0) + (n.total_analyses || 0) + (v.total_analyses || 0) + (d.total_analyses || 0),
      completed_analyses: (i.completed_analyses || 0) + (n.completed_analyses || 0) + (v.completed_analyses || 0) + (d.completed_analyses || 0),
      processing_analyses: (i.processing_analyses || 0) + (n.processing_analyses || 0) + (v.processing_analyses || 0) + (d.processing_analyses || 0),
      failed_analyses: (i.failed_analyses || 0) + (n.failed_analyses || 0) + (v.failed_analyses || 0) + (d.failed_analyses || 0),
      total_reports: (i.total_reports || 0) + (n.total_reports || 0) + (v.total_reports || 0) + (d.total_reports || 0),
      average_trust_score: 0, // computed below
      average_confidence: 0,
      module_breakdown: {
        image: { total: i.total_analyses || 0, completed: i.completed_analyses || 0, failed: i.failed_analyses || 0, reports: i.total_reports || 0 },
        news: { total: n.total_analyses || 0, completed: n.completed_analyses || 0, failed: n.failed_analyses || 0, reports: n.total_reports || 0 },
        video: { total: v.total_analyses || 0, completed: v.completed_analyses || 0, failed: v.failed_analyses || 0, reports: v.total_reports || 0 },
        document: { total: d.total_analyses || 0, completed: d.completed_analyses || 0, failed: d.failed_analyses || 0, reports: d.total_reports || 0 },
      },
    };
  }
}

export const unifiedApi = new UnifiedAPIClient();