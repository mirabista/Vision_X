"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Eye, Download, Trash2, FileText, Clock } from "lucide-react";

interface Report {
  id: string;
  trust_score: number;
  authenticity_status: string;
  risk_level: string;
  pdf_url: string;
  created_at: string;
  upload: {
    original_filename: string;
    public_url: string;
  } | null;
}

export default function ReportHistoryPage() {
  const { user, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadReports();
  }, [user]);

  const loadReports = async () => {
    try {
      if (!user) return;

      const data = await apiClient.getReports({ limit: 100 });
      setReports(data.reports || []);
    } catch (error: any) {
      console.error("Failed to load reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm("Delete this report?")) return;
    try {
      await apiClient.deleteReport(reportId);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (error: any) {
      console.error("Failed to delete report:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "success" | "info" | "warning" | "danger"> = {
      likely_authentic: "success",
      mostly_authentic: "info",
      needs_verification: "warning",
      likely_manipulated: "danger",
    };
    return <Badge variant={variants[status] || "default"}>{status.replace(/_/g, " ")}</Badge>;
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <LoadingCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Report History</h1>
          <p className="mt-2 text-sm text-muted">
            View and download your analysis reports
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-muted mb-4">No reports yet</p>
                <Link href="/analyze">
                  <Button>Create Your First Report</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">File</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Trust Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Risk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-muted uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {reports.map((report) => (
                      <tr key={report.id} className="hover:bg-surface">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {report.upload?.public_url ? (
                              <img
                                src={report.upload.public_url}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
                                <FileText className="w-5 h-5 text-muted" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-text">
                                {report.upload?.original_filename || `Report ${report.id.slice(0, 8)}`}
                              </p>
                              <p className="text-xs text-muted">{report.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${
                              report.trust_score >= 70 ? "text-success" :
                              report.trust_score >= 40 ? "text-warning" : "text-danger"
                            }`}>
                              {report.trust_score}%
                            </span>
                            <div className="w-16">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    report.trust_score >= 70 ? "bg-success" :
                                    report.trust_score >= 40 ? "bg-warning" : "bg-danger"
                                  }`}
                                  style={{ width: `${report.trust_score}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(report.authenticity_status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={
                            report.risk_level === "low" ? "success" :
                            report.risk_level === "medium" ? "warning" : "danger"
                          }>
                            {report.risk_level}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/reports/${report.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Eye className="w-3 h-3" />
                                View
                              </Button>
                            </Link>
                            {report.pdf_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(report.pdf_url, "_blank")}
                                className="gap-1"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(report.id)}
                              className="text-danger hover:text-danger"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}