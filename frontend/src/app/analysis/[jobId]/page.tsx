"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Shield, AlertTriangle, BarChart3, Activity, Download, Eye,
  Camera, Scan, Image, ExternalLink, ChevronDown, ChevronRight, Code
} from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [evidence, setEvidence] = useState<any>(null);
  const [error, setError] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (jobId) {
      loadAnalysis();
    }
  }, [jobId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      const result = await apiClient.getAnalysis(jobId);
      setAnalysis(result.analysis);
      setReport(result.report);
      setEvidence(result.evidence);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  // Use report data if available, fall back to analysis_jobs fields
  const reportData = report?.report_data || {};
  const execSummary = reportData.executive_summary || {};
  
  // Primary: report.trust_score, Fallback: analysis_jobs.overall_confidence
  const trustScore = report?.trust_score ?? analysis?.overall_confidence ?? 0;
  // Primary: report.verdict, Fallback: analysis_jobs.overall_verdict
  const verdict = report?.verdict ?? analysis?.overall_verdict ?? "unknown";
  // Primary: report.risk_level, Fallback: analysis_jobs.risk_level
  const riskLevel = report?.risk_level ?? analysis?.risk_level ?? "medium";

  // Extract nested data from report_data
  const metadata = reportData.metadata_analysis || {};
  const ela = reportData.ela_analysis || {};
  const gemini = reportData.gemini_analysis || {};
  const recommendations = reportData.recommendations || [];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "success";
      case "processing": return "warning";
      case "failed": return "danger";
      default: return "default";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "minimal": return "text-success";
      case "low": return "text-info";
      case "medium": return "text-warning";
      case "high": return "text-danger";
      case "critical": return "text-danger";
      default: return "text-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted">Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-danger">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm">{error || "Analysis not found"}</span>
              </div>
              <Button onClick={() => router.push("/dashboard")} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text mb-1">Image Analysis Report</h1>
              <p className="text-sm text-muted">Analysis ID: {jobId}</p>
            </div>
            <Badge variant={getStatusVariant(analysis.status)} className="text-sm px-3 py-1.5">
              {analysis.status}
            </Badge>
          </div>
        </div>

        {/* Results Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Trust Score</p>
                  <p className={`text-2xl font-bold ${trustScore >= 80 ? "text-success" : trustScore >= 60 ? "text-info" : trustScore >= 40 ? "text-warning" : "text-danger"}`}>
                    {Math.round(trustScore * 100)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Risk Level</p>
                  <p className={`text-2xl font-bold ${getRiskColor(riskLevel)}`}>
                    {riskLevel.toUpperCase()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Confidence</p>
                  <p className="text-2xl font-bold text-text">
                    {Math.round(trustScore * 100)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted mb-1">Verdict</p>
                  <p className="text-2xl font-bold text-text capitalize">
                    {verdict.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center text-primary">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Metadata Analysis
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "metadata" ? null : "metadata")}
              >
                {expandedSection === "metadata" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandedSection === "metadata" && (
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted">Format</p>
                  <p className="text-sm font-medium text-text">{metadata.format || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Dimensions</p>
                  <p className="text-sm font-medium text-text">
                    {metadata.width && metadata.height ? `${metadata.width}x${metadata.height}` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">File Size</p>
                  <p className="text-sm font-medium text-text">
                    {metadata.size_bytes ? `${(metadata.size_bytes / 1024).toFixed(1)} KB` : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted">GPS Location</p>
                  <p className="text-sm font-medium text-text">{metadata.has_gps ? "Present" : "Not found"}</p>
                </div>
              </div>
              {metadata.suspicious_flags && metadata.suspicious_flags.length > 0 && (
                <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-sm font-medium text-warning mb-1">Suspicious Flags</p>
                  {metadata.suspicious_flags.map((flag: string, i: number) => (
                    <p key={i} className="text-xs text-muted">• {flag}</p>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* ELA Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-primary" />
                Error Level Analysis (ELA)
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "ela" ? null : "ela")}
              >
                {expandedSection === "ela" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandedSection === "ela" && (
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted">Average ELA</p>
                  <p className="text-lg font-bold text-text">{ela.avg_ela?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Maximum ELA</p>
                  <p className="text-lg font-bold text-text">{ela.max_ela?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Compression Inconsistency</p>
                  <p className="text-lg font-bold text-text">{ela.compression_inconsistency ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted mb-2">Finding</p>
                <p className="text-sm text-text">{ela.finding || "ELA analysis completed"}</p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Gemini AI Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="w-5 h-5 text-primary" />
                AI Vision Analysis
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSection(expandedSection === "gemini" ? null : "gemini")}
              >
                {expandedSection === "gemini" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </Button>
            </CardTitle>
          </CardHeader>
          {expandedSection === "gemini" && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted">Authenticity Assessment</p>
                  <p className="text-lg font-bold text-text capitalize">{gemini.authenticity_assessment || "unknown"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-2">Explanation</p>
                  <p className="text-sm text-text">{gemini.explanation || execSummary.explanation || "No explanation available"}</p>
                </div>
                {recommendations.length > 0 && (
                  <div>
                    <p className="text-sm text-muted mb-2">Recommendations</p>
                    {recommendations.map((rec: string, i: number) => (
                      <p key={i} className="text-sm text-text">• {rec}</p>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => router.push("/dashboard")} variant="secondary">
            Back to Dashboard
          </Button>
          {report?.pdf_path && (
            <Button onClick={() => window.open(report.pdf_path, "_blank")} variant="secondary">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}