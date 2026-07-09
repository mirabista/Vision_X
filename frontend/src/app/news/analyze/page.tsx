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
  ExternalLink, Copy, RefreshCw
} from "lucide-react";

export default function NewsAnalyzePage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const analysisId = params.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadAnalysis();
    
    // Poll for updates
    const interval = setInterval(() => {
      if (polling) {
        loadAnalysis();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, analysisId, polling]);

  const loadAnalysis = async () => {
    try {
      const result = await apiClient.getNewsAnalysis(analysisId);
      if (result.success) {
        setData(result);
        setLoading(false);
        // Stop polling if completed
        if (result.analysis?.status === "completed" || result.analysis?.status === "failed") {
          setPolling(false);
        }
      }
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
              <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
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
  const claims = data.claims || [];
  const report = data.report;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-amber-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      case "processing":
        return <Badge variant="warning">Processing</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const getAuthenticityColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "minimal":
        return <Badge variant="success">Minimal Risk</Badge>;
      case "low":
        return <Badge variant="success">Low Risk</Badge>;
      case "medium":
        return <Badge variant="warning">Medium Risk</Badge>;
      case "high":
        return <Badge variant="danger">High Risk</Badge>;
      case "critical":
        return <Badge variant="danger">Critical Risk</Badge>;
      default:
        return <Badge variant="default">{risk}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">
                  News Analysis {analysisId.slice(0, 8)}...
                </h1>
                <p className="text-sm text-muted">
                  {analysis.title || analysis.input_content.slice(0, 100)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(analysis.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={polling}
              >
                <RefreshCw className={`w-4 h-4 ${polling ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {analysis.status === "completed" && (
          <div className="space-y-6">
            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">Authenticity Score</p>
                    <p className={`text-4xl font-bold ${getAuthenticityColor(analysis.authenticity_score || 0)}`}>
                      {analysis.authenticity_score || 0}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">Risk Level</p>
                    <div className="mt-2">
                      {getRiskBadge(analysis.risk_level || "medium")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">Verdict</p>
                    <p className="text-sm font-medium text-text mt-2">
{analysis.authenticity_level?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Pending"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verdict */}
            {analysis.verdict && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Verdict
                  </h3>
                  <p className="text-text-secondary">{analysis.verdict}</p>
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

            {/* Agent Results */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-text mb-4">Analysis Pipeline</h3>
                <div className="space-y-3">
                  {agentResults.map((agent: any) => (
                    <div key={agent.agent} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                      <div className="mt-0.5">
                        {getStatusIcon(agent.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-text capitalize">
                            {agent.agent.replace(/_/g, ' ')}
                          </h4>
                          <span className="text-xs text-muted">
                            {agent.processing_time_ms?.toFixed(0)}ms
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

            {/* Sources */}
            {sources.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Sources Found</h3>
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
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                              {source.domain}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {source.snippet && (
                            <p className="text-xs text-muted mt-1">{source.snippet}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {report && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-text mb-4">Report</h3>
                  <div className="flex gap-3">
                    {report.pdf_url && (
                      <Button
                        onClick={() => window.open(report.pdf_url, "_blank")}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Report
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => {
                        const reportData = JSON.stringify(report, null, 2);
                        navigator.clipboard.writeText(reportData);
                        alert("Report JSON copied to clipboard!");
                      }}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
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
                <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text mb-2">Analysis in Progress</h3>
                <p className="text-muted mb-6">Our AI agents are verifying this content...</p>
                <Progress value={50} className="max-w-md mx-auto" />
                <p className="text-xs text-muted mt-4">
                  This usually takes 30-60 seconds
                </p>
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
                <p className="text-muted mb-4">{analysis.error_message || "An error occurred during analysis"}</p>
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
                  <a
                    href={analysis.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                  >
                    {analysis.source_url}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              <div>
                <p className="text-sm text-muted">Content Preview</p>
                <p className="text-text text-sm bg-surface p-3 rounded-lg">
                  {analysis.input_content.slice(0, 500)}
                  {analysis.input_content.length > 500 && "..."}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted">Created At</p>
                <p className="text-text text-sm">
                  {new Date(analysis.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}