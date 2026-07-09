"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  ShieldCheck, Newspaper, FileText, Download, Loader2,
  CheckCircle2, AlertTriangle, XCircle, Clock,
  ExternalLink, Copy, RefreshCw, Image
} from "lucide-react";

export default function UnifiedAnalysisWorkspace({ analysisId, module: moduleProp }: { analysisId: string; module?: string }) {
  const { user } = useAuth();
  const router = useRouter();
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

  const handleRefresh = () => {
    setPolling(true);
    loadAnalysis();
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

  if (error || !data?.analysis) {
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

  const analysis = data.analysis;
  const agentResults = data.agent_results || [];
  const sources = data.sources || [];
  const report = data.report;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "failed": return <XCircle className="w-5 h-5 text-red-600" />;
      case "processing": return <Clock className="w-5 h-5 text-amber-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge variant="success">Completed</Badge>;
      case "failed": return <Badge variant="danger">Failed</Badge>;
      case "processing": return <Badge variant="warning">Processing</Badge>;
      default: return <Badge variant="default">Pending</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                {module === "news" ? <Newspaper className="w-6 h-6 text-white" /> : <Image className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">
                  {module === "news" ? "News" : "Image"} Analysis {analysisId.slice(0, 8)}...
                </h1>
                <p className="text-sm text-muted">
                  {analysis.title || analysis.input_content?.slice(0, 100) || "Analysis"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(analysis.status)}
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={polling}>
                <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {analysis.status === "completed" && (
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">
                      {module === "news" ? "Trust Score" : "Authenticity Score"}
                    </p>
                    <p className={`text-4xl font-bold ${getScoreColor(module === "news" ? (analysis.trust_score || 0) : (analysis.overall_confidence || 0) * 100)}`}>
                      {module === "news" 
                        ? `${Math.round(analysis.trust_score || 0)}%`
                        : `${Math.round((analysis.overall_confidence || 0) * 100)}%`
                      }
                    </p>
                    {module === "news" && analysis.confidence && (
                      <p className="text-xs text-muted mt-1">
                        Confidence: {Math.round(analysis.confidence * 100)}%
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">Risk Level</p>
                    <div className="mt-2">
                      <Badge variant={analysis.risk_level === "minimal" || analysis.risk_level === "low" ? "success" : analysis.risk_level === "medium" ? "warning" : "danger"}>
                        {analysis.risk_level || "medium"} risk
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">Verdict</p>
                    <p className="text-sm font-medium text-text mt-2 capitalize">
                      {module === "news" 
                        ? (analysis.verdict?.replace(/_/g, ' ') || "Pending")
                        : (analysis.overall_verdict?.replace(/_/g, ' ') || "Pending")
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verdict */}
            {(module === "news" ? analysis.verdict : analysis.overall_verdict) && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Verdict
                  </h3>
                  <p className="text-text-secondary">
                    {module === "news" ? analysis.verdict : analysis.verdict}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Executive Summary */}
            {analysis.executive_summary && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-3">Executive Summary</h3>
                  <p className="text-text-secondary whitespace-pre-wrap">{analysis.executive_summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Agent Pipeline */}
            {agentResults.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Analysis Pipeline</h3>
                  <div className="space-y-3">
                    {agentResults.map((agent: any) => (
                      <div key={agent.agent} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                        <div className="mt-0.5">{getStatusIcon(agent.status)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-text capitalize">
                              {agent.agent.replace(/_/g, ' ')}
                            </h4>
                            <span className="text-xs text-muted">
                              {agent.processing_time_ms ? Number(agent.processing_time_ms).toFixed(0) : 0}ms
                            </span>
                          </div>
                          {agent.findings && agent.findings.length > 0 && (
                            <ul className="text-xs text-text-secondary space-y-1 mt-1">
                              {agent.findings.slice(0, 3).map((finding: string, i: number) => (
                                <li key={i} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sources */}
            {sources.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Sources</h3>
                  <div className="space-y-3">
                    {sources.slice(0, 10).map((source: any) => (
                      <div key={source.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-text">{source.title || source.domain}</h4>
                            <Badge variant={source.source_type === "trusted" ? "success" : "default"}>
                              {source.source_type}
                            </Badge>
                          </div>
                          {source.url && (
                            <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                              {source.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {source.snippet && <p className="text-xs text-muted mt-1">{source.snippet}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Report Actions */}
            {report && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Report</h3>
                  <div className="flex gap-3">
                    {report.pdf_url && (
                      <Button onClick={() => window.open(report.pdf_url, "_blank")} className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download PDF Report
                      </Button>
                    )}
                    <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(JSON.stringify(report.report_data || report, null, 2)); alert("Report JSON copied!"); }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Processing State */}
        {analysis.status === "processing" && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text mb-2">Analysis in Progress</h3>
                <p className="text-muted mb-6">Our AI agents are verifying this content...</p>
                <Progress value={50} className="max-w-md mx-auto" />
                <p className="text-xs text-muted mt-4">This usually takes 30-60 seconds</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {analysis.status === "failed" && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text mb-2">Analysis Failed</h3>
                <p className="text-muted mb-4">{analysis.error_message || "An error occurred"}</p>
                <Button onClick={handleRefresh} variant="secondary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Input Details */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-text mb-4">Input Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted">Input Type</p>
                <p className="text-text font-medium capitalize">{analysis.input_type}</p>
              </div>
              {analysis.source_url && (
                <div>
                  <p className="text-sm text-muted">Source URL</p>
                  <a href={analysis.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                    {analysis.source_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-muted">Content Preview</p>
                <p className="text-text text-sm bg-surface p-3 rounded-lg">
                  {(analysis.input_content || analysis.filename || "No content").slice(0, 500)}
                  {(analysis.input_content?.length || 0) > 500 && "..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Created At</p>
                <p className="text-text text-sm">{new Date(analysis.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}