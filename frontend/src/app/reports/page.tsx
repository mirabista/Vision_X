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
import {
  FileText, Download, Trash2, Eye, ExternalLink,
  Search, Clock, Image
} from "lucide-react";

interface ReportWithUpload {
  id: string;
  title: string;
  trust_score: number;
  authenticity_status: string;
  risk_level: string;
  pdf_url: string;
  created_at: string;
  upload: {
    original_filename: string;
    public_url: string;
    content_type: string;
    file_size: number;
  } | null;
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportWithUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    try {
      // Fetch from backend API
      const result = await apiClient.getReports({ limit: 100 });
      setReports(result.reports || []);
    } catch (error) {
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
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
  };

  const getStatusVariant = (status: string) => {
    const map: Record<string, "success" | "info" | "warning" | "danger"> = {
      likely_authentic: "success",
      mostly_authentic: "info",
      needs_verification: "warning",
      likely_manipulated: "danger",
    };
    return map[status] || "default";
  };

  const filteredReports = reports
    .filter(r => {
      if (!search) return true;
      const name = r.upload?.original_filename?.toLowerCase() || "";
      const title = r.title?.toLowerCase() || "";
      const q = search.toLowerCase();
      return name.includes(q) || title.includes(q);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "highest": return b.trust_score - a.trust_score;
        case "lowest": return a.trust_score - b.trust_score;
        default: return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <LoadingCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Reports</h1>
            <p className="mt-1 text-sm text-muted">{reports.length} total reports</p>
          </div>
          <Link href="/analyze">
            <Button>New Analysis</Button>
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports..."
              className="input pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="input"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Trust</option>
            <option value="lowest">Lowest Trust</option>
          </select>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No reports yet</h3>
              <p className="text-muted mb-4">Analyze your first image to generate a report.</p>
              <Link href="/analyze">
                <Button>Analyze Your First Image</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map(report => (
              <Card key={report.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-surface relative overflow-hidden rounded-t-xl">
                    {report.upload?.public_url ? (
                      <img
                        src={report.upload.public_url}
                        alt={report.upload.original_filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image className="w-12 h-12 text-muted" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant={getStatusVariant(report.authenticity_status)}>
                        {report.authenticity_status?.replace(/_/g, " ") || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-text mb-1 truncate">
                      {report.upload?.original_filename || report.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted mb-3">
                      <Clock className="w-3 h-3" />
                      {new Date(report.created_at).toLocaleDateString()}
                      <span className="mx-1">•</span>
                      {report.upload?.content_type || "N/A"}
                    </div>

                    {/* Trust Score Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted">Trust Score</span>
                        <span className={`font-bold ${
                          report.trust_score >= 70 ? "text-success" :
                          report.trust_score >= 40 ? "text-warning" : "text-danger"
                        }`}>
                          {report.trust_score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            report.trust_score >= 70 ? "bg-success" :
                            report.trust_score >= 40 ? "bg-warning" : "bg-danger"
                          }`}
                          style={{ width: `${report.trust_score}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/reports/${report.id}`} className="flex-1">
                        <Button size="sm" className="w-full gap-1">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                      {report.pdf_url && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(report.pdf_url, "_blank")}
                          className="gap-1"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      )}
                      {report.upload?.public_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(report.upload!.public_url, "_blank")}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(report.id)}
                        className="text-danger hover:text-danger"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
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