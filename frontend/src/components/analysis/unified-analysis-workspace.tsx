"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
<<<<<<< HEAD
import { useAnalysisDetail } from "@/hooks/use-unified-data";
import AnalysisDetail from "@/components/analysis/shared/analysis-detail";
import { ModuleIcon } from "@/components/analysis/shared/module-badge";
import { Loader2, RefreshCw } from "lucide-react";
=======
import { apiClient } from "@/lib/api-client";
import {
  ShieldCheck, Newspaper, FileText, Download, Loader2,
  CheckCircle2, AlertTriangle, XCircle, Clock,
  ExternalLink, Copy, RefreshCw, Image, Video
} from "lucide-react";
>>>>>>> 1d3e6e3a998ce23ccb370911fd21097c3004c822

export default function UnifiedAnalysisWorkspace({ analysisId, module: moduleProp }: { analysisId: string; module?: string }) {
  const { user } = useAuth();
  const router = useRouter();
<<<<<<< HEAD
  const module = moduleProp || "image";
  const { data, loading, error, refresh, setPolling } = useAnalysisDetail(module, analysisId);
=======
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [polling, setPolling] = useState(true);
  const [module, setModule] = useState<string>(moduleProp || "image");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadAnalysis();
    
    const interval = setInterval(() => {
      if (polling) {
        loadAnalysis();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, analysisId, polling]);

  const loadAnalysis = async () => {
    try {
      const result: any = module === "news"
        ? await apiClient.getNewsAnalysis(analysisId)
        : await apiClient.getAnalysisJob(analysisId);
      const analysis = result.analysis || result.job || result;
      const inferredModule = analysis.module_type || analysis.module || moduleProp || "image";
      setModule(inferredModule);

      // If analysis has a report_id, redirect to report page
      if (analysis.report_id) {
        setPolling(false);
        router.push(`/reports/${analysis.report_id}`);
        return;
      }

      setData({ analysis });
      setLoading(false);

      const isCompleted = analysis.status === "completed" || analysis.status === "failed";
      if (isCompleted) setPolling(false);
    } catch (err: any) {
      setError(err.message || "Failed to load analysis");
      setLoading(false);
      setPolling(false);
    }
  };
>>>>>>> 1d3e6e3a998ce23ccb370911fd21097c3004c822

  const handleRefresh = () => {
    setPolling(true);
    refresh();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to view analysis.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted">Loading analysis...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert variant="error" title="Error">
            {error || "Analysis not found"}
          </Alert>
        </div>
      </div>
    );
  }

  const analysis = data.analysis || data;
  const report = data.report;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
<<<<<<< HEAD
                <ModuleIcon module={module} className="w-6 h-6 text-white" />
=======
                {module === "news" ? <Newspaper className="w-6 h-6 text-white" /> : module === "video" ? <Video className="w-6 h-6 text-white" /> : <Image className="w-6 h-6 text-white" />}
>>>>>>> 1d3e6e3a998ce23ccb370911fd21097c3004c822
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {module === "news" ? "News" : module === "video" ? "Video" : "Image"} Analysis {analysisId.slice(0, 8)}...
                </h1>
                <p className="text-sm text-muted">
                  {analysis.title || analysis.input_content?.slice(0, 100) || "Analysis"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={analysis.status === "completed" ? "success" : analysis.status === "failed" ? "danger" : "warning"}>
                {analysis.status}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Evidence-Centered Analysis Detail */}
        <AnalysisDetail
          module={module}
          analysis={analysis}
          report={report}
          agentResults={data.agent_results || []}
          evidence={data.evidence || []}
          frames={data.frames || []}
          audio={data.audio}
          onRefresh={refresh}
        />
      </div>

      <Footer />
    </div>
  );
}