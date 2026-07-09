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
import { Newspaper, Trash2, ExternalLink, Loader2 } from "lucide-react";

export default function NewsHistoryPage() {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      const result = await apiClient.getNewsAnalyses({ limit: 50 });
      if (result.success) {
        setAnalyses(result.analyses || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    try {
      await apiClient.deleteNewsAnalysis(id);
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to view history.</p>
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
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">News Verification History</h1>
              <p className="text-sm text-muted">
                {analyses.length} total analyses
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="error" title="Error" className="mb-6">
            {error}
          </Alert>
        )}

        {analyses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text mb-2">No History Yet</h3>
              <p className="text-muted mb-6">Start verifying news to see your history here</p>
              <Link href="/news">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                  Verify Your First News
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text">
                          {analysis.title || analysis.input_content.slice(0, 100)}
                        </h3>
                        <Badge variant={analysis.status === "completed" ? "success" : analysis.status === "failed" ? "danger" : "warning"}>
                          {analysis.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted">
                        <span className="capitalize">{analysis.input_type}</span>
                        <span>•</span>
                        <span>{new Date(analysis.created_at).toLocaleDateString()}</span>
                        {analysis.trust_score && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-text">
                              {Math.round(analysis.trust_score)}% trust
                            </span>
                          </>
                        )}
                        {analysis.confidence && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-text">
                              {Math.round(analysis.confidence * 100)}% confidence
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/news/analyze/${analysis.id}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <ExternalLink className="w-4 h-4" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(analysis.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
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