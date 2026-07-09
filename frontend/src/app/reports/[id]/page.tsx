"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import {
  Download, ArrowLeft, CheckCircle2, XCircle, AlertTriangle,
  Loader2, Shield, FileText, Camera, Scan, Activity, Eye,
  ChevronDown, ChevronRight, Clock, Image
} from "lucide-react";

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    let mounted = true;

    const load = async () => {
      try {
        // Load report metadata
        const reportData: any = await apiClient.getReport(reportId);
        if (!mounted) return;
        const r = reportData.report;
        setReport(r);

        // Load analysis data using analysis_id from report
        const analysisId = r.analysis_id || r.analysisId || reportId;
        try {
          const analysisData: any = await apiClient.getAnalysisJob(analysisId);
          if (!mounted) return;
          const a = analysisData.analysis || analysisData.job || analysisData;
          setAnalysis(a);

          // Extract evidence from analysis
          if (a.agent_results) {
            const ev: any[] = [];
            Object.entries(a.agent_results).forEach(([name, result]: [string, any]) => {
              if (result.evidence) {
                Object.values(result.evidence).forEach((e: any) => {
                  ev.push({ agent: name, ...e });
                });
              }
            });
            setEvidence(ev);
          }
        } catch {
          // Analysis data is optional - report may still have basic info
        }

        setLoading(false);
      } catch (e: any) {
        if (mounted) {
          setError(e.message || "Failed to load report");
          setLoading(false);
        }
      }
    };

    load();
    return () => { mounted = false; };
  }, [reportId]);

  const handleDownload = async (format: "pdf" | "json") => {
    try {
      const blob = await apiClient.downloadReport(reportId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `report_${reportId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || "Download failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted">Loading report...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <Alert variant="error" title="Error">
            {error || "Report not found"}
          </Alert>
          <Button variant="secondary" onClick={() => router.back()} className="mt-4">
            Go back
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Backend returns trust_score/verdict/risk_level on `report`, and overall_confidence/overall_verdict/risk_level on `analysis`
  // Dashboard now normalizes trust scores to percentage scale, so no extra multiplication needed
  const trustScore = report?.trust_score ?? analysis?.overall_confidence ?? 0;
  const riskLevel = report?.risk_level ?? analysis?.risk_level ?? "UNKNOWN";
  const verdict = report?.verdict ?? analysis?.overall_verdict ?? "Pending";
  // trust_score is already normalized to 0-100 by backend
  const confidence = Math.round(trustScore);
  const thumbnailUrl = analysis?.thumbnail_url ?? report?.thumbnail_url ?? report?.upload?.public_url ?? "";
  const imageUrl = analysis?.image_url ?? report?.image_url ?? report?.upload?.public_url ?? "";
  const filename = analysis?.filename ?? report?.filename ?? report?.upload?.original_filename ?? "";
  const agentResults = analysis?.agent_results ?? {};
  const agentNames = Object.keys(agentResults);

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-danger";
  };

  const getRiskBadge = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l === "minimal" || l === "low") return <Badge variant="success">Low Risk</Badge>;
    if (l === "medium") return <Badge variant="warning">Medium Risk</Badge>;
    return <Badge variant="danger">High Risk</Badge>;
  };

  const getVerdictIcon = (v: string) => {
    const vl = (v || "").toLowerCase();
    if (vl.includes("authentic") || vl.includes("pass")) return <CheckCircle2 className="w-6 h-6 text-success" />;
    if (vl.includes("manipulated") || vl.includes("fail") || vl.includes("suspicious")) return <XCircle className="w-6 h-6 text-danger" />;
    return <AlertTriangle className="w-6 h-6 text-warning" />;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-muted hover:text-text">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex gap-3">
            <Button onClick={() => handleDownload("pdf")} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> PDF
            </Button>
            <Button variant="secondary" onClick={() => handleDownload("json")} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> JSON
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Thumbnail */}
              {thumbnailUrl || imageUrl ? (
                <div className="w-48 flex-shrink-0">
                  <div className="w-48 h-48 rounded-xl overflow-hidden bg-surface mb-2">
                    <img src={thumbnailUrl || imageUrl} alt="Uploaded image" className="w-full h-full object-cover" />
                  </div>
                  {filename && <p className="text-xs text-muted text-center truncate">{filename}</p>}
                </div>
              ) : (
                <div className="w-48 h-48 rounded-xl bg-surface flex items-center justify-center flex-shrink-0">
                  <div className="text-center">
                    <Image className="w-12 h-12 text-muted mx-auto mb-2" />
                    <p className="text-xs text-muted">Image preview unavailable</p>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-text">Forensic Report</h1>
                    <p className="text-sm text-muted">Analysis ID: {report.analysis_id || reportId}</p>
                    <p className="text-xs text-muted">{report.created_at ? new Date(report.created_at).toLocaleString() : ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getVerdictIcon(verdict)}
                    <span className="text-lg font-semibold text-text">{verdict}</span>
                  </div>
                </div>

                {/* Score Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-surface rounded-lg p-4 text-center">
                    <p className="text-sm text-muted mb-1">Authenticity Score</p>
                    <p className={`text-3xl font-bold ${getScoreColor(trustScore)}`}>{trustScore}%</p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 text-center">
                    <p className="text-sm text-muted mb-1">Risk Level</p>
                    <div className="mt-1">{getRiskBadge(riskLevel)}</div>
                  </div>
                  <div className="bg-surface rounded-lg p-4 text-center">
                    <p className="text-sm text-muted mb-1">Confidence</p>
                    <p className={`text-3xl font-bold ${getScoreColor(confidence)}`}>{confidence}%</p>
                  </div>
                  <div className="bg-surface rounded-lg p-4 text-center">
                    <p className="text-sm text-muted mb-1">Status</p>
                    <Badge variant={analysis?.status === "completed" ? "success" : "default"}>
                      {analysis?.status || "Completed"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authenticity Score Breakdown */}
        {agentNames.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Authenticity Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentNames.map((name) => {
                  const result = agentResults[name];
                  const score = result?.confidence ? Math.round(result.confidence * 100) : 0;
                  return (
                    <div key={name} className="flex items-center gap-4">
                      <div className="w-40 flex-shrink-0">
                        <p className="text-sm font-medium text-text capitalize">{name.replace(/_/g, " ")}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(score)}`}
                            style={{ width: `${score}%`, backgroundColor: score >= 70 ? "#22c55e" : score >= 50 ? "#eab308" : "#ef4444" }}
                          />
                        </div>
                      </div>
                      <div className="w-16 text-right">
                        <p className={`text-sm font-bold ${getScoreColor(score)}`}>{score}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agent Findings */}
        {agentNames.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Agent Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agentNames.map((name) => {
                  const result = agentResults[name];
                  const isExpanded = expandedAgent === name;
                  const status = result?.status || "completed";
                  const summary = result?.summary || "";
                  const confidence = result?.confidence ? Math.round(result.confidence * 100) : 0;
                  const evidenceItems = result?.evidence ? Object.values(result.evidence) : [];

                  return (
                    <div key={name} className="border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedAgent(isExpanded ? null : name)}
                        className="w-full flex items-center gap-3 p-4 hover:bg-surface/50 transition-colors"
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          status === "completed" ? "bg-success/10 text-success" :
                          status === "failed" ? "bg-danger/10 text-danger" :
                          "bg-surface text-muted"
                        }`}>
                          {status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                           status === "failed" ? <XCircle className="w-5 h-5" /> :
                           <Clock className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-text capitalize">{name.replace(/_/g, " ")}</p>
                          {summary && <p className="text-xs text-muted truncate">{summary}</p>}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${getScoreColor(confidence)}`}>{confidence}%</p>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border">
                          {/* Summary */}
                          {summary && (
                            <div className="mt-3 p-3 bg-surface rounded-lg">
                              <p className="text-sm text-text-secondary">{summary}</p>
                            </div>
                          )}

                          {/* Evidence */}
                          {evidenceItems.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-muted uppercase tracking-wider">Evidence</p>
                              {evidenceItems.map((item: any, idx: number) => (
                                <div key={idx} className="p-3 bg-surface rounded-lg">
                                  <p className="text-sm font-medium text-text">{item.key || item.evidence_type || `Evidence ${idx + 1}`}</p>
                                  {item.content && <p className="text-xs text-muted mt-1">{typeof item.content === "string" ? item.content : JSON.stringify(item.content)}</p>}
                                  {item.confidence && <p className="text-xs text-muted mt-1">Confidence: {Math.round(item.confidence * 100)}%</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Raw Output */}
                          {result?.raw_output && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Raw Output</p>
                              <pre className="text-xs text-muted bg-surface p-3 rounded-lg overflow-auto max-h-40">
                                {typeof result.raw_output === "string" ? result.raw_output : JSON.stringify(result.raw_output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evidence Timeline */}
        {agentNames.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Evidence Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <p className="text-sm text-text">Upload</p>
                  <p className="text-xs text-muted ml-auto">{report.created_at ? new Date(report.created_at).toLocaleTimeString() : ""}</p>
                </div>
                {agentNames.map((name, idx) => {
                  const result = agentResults[name];
                  const status = result?.status === "completed" ? "success" : result?.status === "failed" ? "danger" : "muted";
                  return (
                    <div key={name} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                      <div className={`w-3 h-3 rounded-full bg-${status}`} style={{
                        backgroundColor: status === "success" ? "#22c55e" : status === "danger" ? "#ef4444" : "#6b7280"
                      }} />
                      <p className="text-sm text-text capitalize">{name.replace(/_/g, " ")}</p>
                      {result?.execution_time && (
                        <p className="text-xs text-muted ml-auto">{result.execution_time.toFixed(1)}s</p>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <p className="text-sm text-text">Report Generated</p>
                  <p className="text-xs text-muted ml-auto">{report.created_at ? new Date(report.created_at).toLocaleTimeString() : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Final Verdict */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Final Verdict
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              {getVerdictIcon(verdict)}
              <div>
                <p className="text-xl font-bold text-text">{verdict}</p>
                <p className="text-sm text-muted">Authenticity Score: {trustScore}% | Confidence: {confidence}%</p>
              </div>
            </div>
            {analysis?.summary && (
              <div className="p-4 bg-surface rounded-lg">
                <p className="text-sm text-text-secondary">{analysis.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-primary" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trustScore >= 70 ? (
                <>
                  <p className="text-sm text-text-secondary">✓ No significant manipulation detected.</p>
                  <p className="text-sm text-text-secondary">✓ Manual verification is optional.</p>
                </>
              ) : trustScore >= 50 ? (
                <>
                  <p className="text-sm text-text-secondary">⚠ Review highlighted evidence before making decisions.</p>
                  <p className="text-sm text-text-secondary">⚠ Compare with trusted copies if available.</p>
                  <p className="text-sm text-text-secondary">⚠ Verify metadata if available.</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-text-secondary">✗ Verify using the original file.</p>
                  <p className="text-sm text-text-secondary">✗ Request the source document.</p>
                  <p className="text-sm text-text-secondary">✗ Perform manual review.</p>
                  <p className="text-sm text-text-secondary">✗ Do not rely solely on this image.</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Report Metadata */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted">Analysis ID</p>
                <p className="text-text font-mono text-xs">{report.analysis_id || reportId}</p>
              </div>
              <div>
                <p className="text-muted">Report ID</p>
                <p className="text-text font-mono text-xs">{reportId}</p>
              </div>
              <div>
                <p className="text-muted">Created</p>
                <p className="text-text">{report.created_at ? new Date(report.created_at).toLocaleString() : "N/A"}</p>
              </div>
              <div>
                <p className="text-muted">Type</p>
                <p className="text-text capitalize">{report.report_type || "Image Analysis"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}