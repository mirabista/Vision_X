"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useAnalysisDetail } from "@/hooks/use-unified-data";
import AnalysisDetail from "@/components/analysis/shared/analysis-detail";
import {
  Loader2, RefreshCw, FileText
} from "lucide-react";

export default function DocumentAnalysisPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error, refresh, setPolling } = useAnalysisDetail("document", id as string, !authLoading);

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
              <p className="text-muted">Loading document analysis...</p>
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
  const evidence = Array.isArray(data.evidence) ? data.evidence : Object.values(data.evidence || {}).flat();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text">
                  Document Analysis {id?.toString().slice(0, 8)}...
                </h1>
                <p className="text-sm text-muted">
                  {analysis.original_filename || analysis.title || "Document Analysis"}
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
          module="document"
          analysis={analysis}
          report={report}
          agentResults={data.agent_results || []}
          evidence={evidence}
          onRefresh={refresh}
        />
      </div>

      <Footer />
    </div>
  );
}
