"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Film, Download, ExternalLink, Loader2, FileText } from "lucide-react";

export default function VideoReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      const result = await apiClient.getVideoReports({ limit: 50 });
      if (result.success) {
        setReports(result.reports || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to view reports.</p>
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
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">Video Analysis Reports</h1>
              <p className="text-sm text-muted">
                {reports.length} total reports
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error" className="mb-6">
            {error}
          </Alert>
        )}

        {reports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No Reports Yet</h3>
              <p className="text-muted mb-6">Complete a video analysis to generate a report</p>
              <Link href="/analyze">
                <Button className="bg-gradient-to-r from-primary to-primary/80">
                  Analyze Your First Video
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text">
                          {report.report_data?.verdict_details?.verdict || `Report ${report.id?.slice(0, 8)}`}
                        </h3>
                        <Badge variant={(report.report_data?.verdict_details?.risk_level || report.risk_level) === "minimal" || (report.report_data?.verdict_details?.risk_level || report.risk_level) === "low" ? "success" : (report.report_data?.verdict_details?.risk_level || report.risk_level) === "medium" ? "warning" : "danger"}>
                          {report.report_data?.verdict_details?.risk_level || report.risk_level || "medium"} risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span>Trust Score: <span className="font-medium text-text">{Math.round(report.report_data?.verdict_details?.trust_score || 0)}%</span></span>
                        <span>•</span>
                        <span>{new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/news/video/${report.analysis_id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="w-4 h-4" />
                          View Analysis
                        </Button>
                      </Link>
                      {report.pdf_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(report.pdf_url, "_blank")}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}