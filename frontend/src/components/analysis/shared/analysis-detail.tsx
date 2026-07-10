"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ModuleBadge, ModuleIcon } from "@/components/analysis/shared/module-badge";
import {
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronRight, Download, Copy, ExternalLink,
  Lightbulb, Scale, Search, FileText, Brain, ListChecks,
  TrendingUp, TrendingDown, Minus, HelpCircle, Quote,
  Link2, Flag, Eye, MessageSquare, Camera, Film, Newspaper
} from "lucide-react";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface AnalysisDetailProps {
  module: string;
  analysis: any;
  report?: any;
  agentResults?: any[];
  evidence?: any[];
  frames?: any[];
  audio?: any;
  onRefresh?: () => void;
  onDelete?: () => void;
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
export default function AnalysisDetail({
  module,
  analysis,
  report,
  agentResults = [],
  evidence = [],
  frames = [],
  audio,
  onRefresh,
  onDelete,
}: AnalysisDetailProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    executive_summary: true,
    why_verdict: true,
    evidence_summary: true,
    claims: false,
    sources: false,
    manipulation: false,
    reasoning: false,
    timeline: false,
    recommendations: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const trustScore = analysis.trust_score || analysis.authenticity_score || 0;
  const confidence = analysis.confidence || 0;
  const verdict = analysis.verdict || analysis.authenticity_level || "unknown";
  const riskLevel = analysis.risk_level || "medium";
  const executiveSummary = analysis.executive_summary || report?.report_data?.executive_summary || "";
  const reportData = report?.report_data || {};
  const claims = reportData.claims || analysis.claims || [];
  const sources = reportData.sources || analysis.sources || [];
  const recommendations = reportData.recommendations || analysis.recommendations || [];
  const reasoning = reportData.ai_explanation || reportData.ai_reasoning?.reasoning || analysis.ai_explanation || "";
  const manipulationIndicators = reportData.deepfake_findings?.manipulation_indicators || reportData.misinformation_indicators || analysis.manipulation_indicators || [];
  const biasAnalysis = reportData.bias_analysis || analysis.bias_analysis || {};

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return "bg-emerald-50 border-emerald-200";
    if (score >= 50) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getVerdictIcon = (v: string) => {
    switch (v) {
      case "verified": case "likely_true": return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "suspicious": case "likely_false": return <XCircle className="w-6 h-6 text-red-600" />;
      case "mixed": return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  const getVerdictLabel = (v: string) => {
    switch (v) {
      case "verified": return "Verified Authentic";
      case "likely_true": return "Likely Authentic";
      case "mixed": return "Needs Verification";
      case "suspicious": return "Suspicious";
      case "likely_false": return "Likely Manipulated";
      default: return v.replace(/_/g, " ");
    }
  };

  const getRiskColor = (r: string) => {
    switch (r) {
      case "minimal": case "low": return "success";
      case "medium": return "warning";
      default: return "danger";
    }
  };

  const SectionHeader = ({ id, title, icon: Icon, defaultOpen = false }: { id: string; title: string; icon: any; defaultOpen?: boolean }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-surface/50 transition-colors"
      aria-expanded={expandedSections[id]}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text">{title}</h3>
      </div>
      {expandedSections[id] ? <ChevronDown className="w-5 h-5 text-muted" /> : <ChevronRight className="w-5 h-5 text-muted" />}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* ════════════════════════════════════
          SECTION 1: EXECUTIVE SUMMARY
          ════════════════════════════════════ */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className={`p-6 border-b border-border ${getScoreBg(trustScore)}`}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <ModuleBadge module={module} size="md" />
                <Badge variant={getRiskColor(riskLevel)} className="text-sm px-3 py-1">
                  {riskLevel.toUpperCase()} RISK
                </Badge>
              </div>

              <div className="flex items-center gap-3 mb-4">
                {getVerdictIcon(verdict)}
                <div>
                  <h2 className="text-2xl font-bold text-text capitalize">
                    {getVerdictLabel(verdict)}
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Analysis completed in {Math.round((analysis.processing_time_ms || 0) / 1000)}s
                    {analysis.completed_at && ` · ${new Date(analysis.completed_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>

              {executiveSummary && (
                <div className="mt-4 p-4 rounded-xl bg-white/60 border border-border/50">
                  <p className="text-sm text-text-secondary leading-relaxed">{executiveSummary}</p>
                </div>
              )}
            </div>

            {/* Score Circle */}
            <div className="flex-shrink-0 text-center">
              <div className={`w-28 h-28 rounded-full border-4 flex items-center justify-center ${getScoreColor(trustScore)} ${getScoreBg(trustScore)}`}>
                <div>
                  <p className={`text-3xl font-bold ${getScoreColor(trustScore)}`}>{Math.round(trustScore)}</p>
                  <p className="text-[10px] text-muted font-medium">TRUST</p>
                </div>
              </div>
              <p className={`text-sm font-semibold mt-2 ${getScoreColor(confidence * 100)}`}>
                {Math.round(confidence * 100)}% confident
              </p>
            </div>
          </div>
        </div>

        {/* Score Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          <ScoreCard label="Trust Score" value={`${Math.round(trustScore)}%`} color={getScoreColor(trustScore)} />
          <ScoreCard label="Confidence" value={`${Math.round(confidence * 100)}%`} color={getScoreColor(confidence * 100)} />
          <ScoreCard label="Risk Level" value={riskLevel.toUpperCase()} color={riskLevel === "low" || riskLevel === "minimal" ? "text-emerald-600" : riskLevel === "medium" ? "text-amber-600" : "text-red-600"} />
          <ScoreCard label="Processing" value={`${Math.round((analysis.processing_time_ms || 0) / 1000)}s`} color="text-text" />
        </div>
      </Card>

      {/* ════════════════════════════════════
          SECTION 2: WHY THIS VERDICT
          ════════════════════════════════════ */}
      <Card className="border-border shadow-sm">
        <SectionHeader id="why_verdict" title="Why did VisionX reach this verdict?" icon={Lightbulb} />
        {expandedSections.why_verdict && (
          <CardContent className="px-4 pb-6 pt-0">
            <div className="space-y-3">
              {/* Trust Score Explanation */}
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="flex items-start gap-3">
                  <Scale className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-text mb-1">Trust Score: {Math.round(trustScore)}%</p>
                    <p className="text-sm text-muted">
                      {trustScore >= 70
                        ? "The content passed multiple verification checks with high confidence. Evidence from trusted sources supports the claims made."
                        : trustScore >= 50
                        ? "The content shows mixed signals. Some evidence supports authenticity while other indicators raise concerns."
                        : "Multiple verification checks found significant issues. The content shows strong indicators of manipulation or falsehood."
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Reasons */}
              {manipulationIndicators.length > 0 && manipulationIndicators.map((indicator: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{indicator}</p>
                </div>
              ))}

              {/* Evidence Counts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-emerald-700">{evidence.filter((e: any) => e.supports_claim !== false).length}</p>
                  <p className="text-xs text-emerald-600">Supporting Evidence</p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-center">
                  <TrendingDown className="w-5 h-5 text-red-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-red-700">{evidence.filter((e: any) => e.supports_claim === false).length}</p>
                  <p className="text-xs text-red-600">Contradicting Evidence</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <Minus className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-700">{claims.length}</p>
                  <p className="text-xs text-amber-600">Claims Analyzed</p>
                </div>
              </div>

              {/* Bias Info */}
              {biasAnalysis.explanation && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Bias Assessment:</strong> {biasAnalysis.explanation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* ════════════════════════════════════
          SECTION 3: EVIDENCE SUMMARY
          ════════════════════════════════════ */}
      <Card className="border-border shadow-sm">
        <SectionHeader id="evidence_summary" title="Evidence Summary" icon={Search} />
        {expandedSections.evidence_summary && (
          <CardContent className="px-4 pb-6 pt-0">
            {evidence.length === 0 ? (
              <div className="p-6 text-center text-muted">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No evidence items collected</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-emerald-700 flex items-center gap-2 px-1">
                  <CheckCircle2 className="w-4 h-4" /> Supporting Evidence
                </h4>
                {evidence.filter((e: any) => e.supports_claim !== false).slice(0, 5).map((item: any, i: number) => (
                  <EvidenceCard key={i} item={item} type="supporting" />
                ))}

                {evidence.some((e: any) => e.supports_claim === false) && (
                  <>
                    <h4 className="text-sm font-semibold text-red-700 flex items-center gap-2 px-1 mt-4">
                      <XCircle className="w-4 h-4" /> Contradicting Evidence
                    </h4>
                    {evidence.filter((e: any) => e.supports_claim === false).slice(0, 5).map((item: any, i: number) => (
                      <EvidenceCard key={i} item={item} type="contradicting" />
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ════════════════════════════════════
          SECTION 4: CLAIM-BY-CLAIM
          ════════════════════════════════════ */}
      {claims.length > 0 && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="claims" title={`Claim-by-Claim Verification (${claims.length})`} icon={ListChecks} />
          {expandedSections.claims && (
            <CardContent className="px-4 pb-6 pt-0 space-y-3">
              {claims.map((claim: any, i: number) => (
                <ClaimCard key={i} claim={claim} index={i} />
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 5: SOURCE CREDIBILITY
          ════════════════════════════════════ */}
      {sources.length > 0 && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="sources" title={`Source Credibility Analysis (${sources.length})`} icon={Link2} />
          {expandedSections.sources && (
            <CardContent className="px-4 pb-6 pt-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-muted pb-2 pr-4">Source</th>
                      <th className="text-left font-medium text-muted pb-2 pr-4">Type</th>
                      <th className="text-left font-medium text-muted pb-2 pr-4">Credibility</th>
                      <th className="text-left font-medium text-muted pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sources.slice(0, 10).map((source: any, i: number) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-surface flex items-center justify-center">
                              <Link2 className="w-3 h-3 text-muted" />
                            </div>
                            <span className="font-medium text-text truncate max-w-[200px]">
                              {source.title || source.publisher || source.domain || source.url || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted capitalize">{source.evidence_type || source.source_type || "web"}</td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <Progress value={(source.credibility_score || source.credibility || 0.5) * 100} max={100} className="w-16 h-1.5" />
                            <span className="text-xs font-medium">{Math.round((source.credibility_score || source.credibility || 0.5) * 100)}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted text-xs">
                          {source.publication_date ? new Date(source.publication_date).toLocaleDateString() : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 6: MANIPULATION INDICATORS
          ════════════════════════════════════ */}
      {manipulationIndicators.length > 0 && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="manipulation" title="Manipulation Indicators" icon={Flag} />
          {expandedSections.manipulation && (
            <CardContent className="px-4 pb-6 pt-0 space-y-2">
              {manipulationIndicators.map((indicator: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-100">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{indicator}</p>
                    <p className="text-xs text-red-500 mt-0.5">Confidence: High</p>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 7: AI REASONING
          ════════════════════════════════════ */}
      {reasoning && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="reasoning" title="AI Reasoning" icon={Brain} />
          {expandedSections.reasoning && (
            <CardContent className="px-4 pb-6 pt-0">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Brain className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text mb-2">How VisionX Analyzed This Content</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{reasoning}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 8: TIMELINE
          ════════════════════════════════════ */}
      {agentResults.length > 0 && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="timeline" title="Processing Timeline" icon={Clock} />
          {expandedSections.timeline && (
            <CardContent className="px-4 pb-6 pt-0">
              <div className="space-y-1">
                {agentResults.map((agent: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface/50 transition-colors">
                    <div className="flex-shrink-0 w-8 flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${agent.status === "completed" ? "bg-emerald-500" : agent.status === "failed" ? "bg-red-500" : "bg-amber-400 animate-pulse"}`} />
                      {i < agentResults.length - 1 && <div className="w-0.5 h-6 bg-border mt-1" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text capitalize">{agent.agent_name?.replace(/_/g, " ")}</p>
                      {agent.findings && agent.findings.length > 0 && (
                        <p className="text-xs text-muted truncate">{agent.findings[0]}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant={agent.status === "completed" ? "success" : agent.status === "failed" ? "danger" : "warning"} className="text-[10px]">
                        {agent.status}
                      </Badge>
                      <p className="text-xs text-muted mt-0.5">{agent.processing_time_ms || agent.duration_ms || 0}ms</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 9: RECOMMENDATIONS
          ════════════════════════════════════ */}
      {recommendations.length > 0 && (
        <Card className="border-border shadow-sm">
          <SectionHeader id="recommendations" title="Recommendations" icon={Eye} />
          {expandedSections.recommendations && (
            <CardContent className="px-4 pb-6 pt-0 space-y-2">
              {recommendations.map((rec: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-700">{rec}</p>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════
          SECTION 10: REPORT ACTIONS
          ════════════════════════════════════ */}
      {report && (
        <Card className="border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-text">Download Report</span>
              </div>
              <div className="flex gap-2">
                {report.pdf_url && (
                  <Button size="sm" onClick={() => window.open(report.pdf_url, "_blank")} className="gap-2">
                    <Download className="w-4 h-4" /> PDF
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(report.report_data || report, null, 2));
                }} className="gap-2">
                  <Copy className="w-4 h-4" /> JSON
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Sub-Components
// ─────────────────────────────────────────

function ScoreCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-4 bg-white text-center">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function EvidenceCard({ item, type }: { item: any; type: "supporting" | "contradicting" }) {
  const isSupporting = type === "supporting";
  return (
    <div className={`p-3 rounded-xl border ${isSupporting ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSupporting ? "bg-emerald-100" : "bg-red-100"}`}>
          {isSupporting
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            : <XCircle className="w-4 h-4 text-red-600" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text">{item.claim || item.key || "Evidence"}</p>
          {item.excerpt && <p className="text-xs text-muted mt-0.5">{item.excerpt.slice(0, 200)}</p>}
          <div className="flex items-center gap-3 mt-1.5">
            {item.source && <span className="text-xs text-muted">Source: {item.source}</span>}
            {item.credibility && (
              <span className="text-xs font-medium" style={{ color: item.credibility >= 0.7 ? "#059669" : item.credibility >= 0.4 ? "#D97706" : "#DC2626" }}>
                {Math.round(item.credibility * 100)}% credible
              </span>
            )}
            {item.url && (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Source
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClaimCard({ claim, index }: { claim: any; index: number }) {
  const status = claim.status || "unverified";
  const confidence = claim.confidence || 0;
  const isVerified = status === "verified";
  const isFalse = status === "false" || status === "questionable";

  return (
    <div className="p-4 rounded-xl border border-border bg-surface">
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isVerified ? "bg-emerald-100" : isFalse ? "bg-red-100" : "bg-amber-100"
        }`}>
          {isVerified
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            : isFalse
            ? <XCircle className="w-4 h-4 text-red-600" />
            : <HelpCircle className="w-4 h-4 text-amber-600" />
          }
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted">Claim #{index + 1}</span>
            <Badge variant={isVerified ? "success" : isFalse ? "danger" : "warning"} className="text-[10px]">
              {status}
            </Badge>
            <span className="text-xs font-medium ml-auto" style={{ color: confidence >= 70 ? "#059669" : confidence >= 40 ? "#D97706" : "#DC2626" }}>
              {Math.round(confidence)}% confidence
            </span>
          </div>
          <p className="text-sm font-medium text-text">
            {claim.claim || claim.text || "Claim text not available"}
          </p>
          {claim.reasoning && (
            <p className="text-xs text-muted mt-1">{claim.reasoning}</p>
          )}
        </div>
      </div>
    </div>
  );
}