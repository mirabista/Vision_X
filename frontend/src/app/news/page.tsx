"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Link, FileText, Image, Upload, Loader2,
  Newspaper, ShieldCheck, History
} from "lucide-react";

type InputMode = "url" | "article" | "screenshot" | "headline";

export default function NewsVerificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<InputMode>("url");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to verify news.</p>
          </div>
        </div>
      </div>
    );
  }

  const [url, setUrl] = useState("");
  const [article, setArticle] = useState("");
  const [headline, setHeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);

    try {
      let input_content = "";
      if (mode === "url") {
        if (!url) throw new Error("Please enter a URL");
        input_content = url;
      } else if (mode === "article") {
        if (!article) throw new Error("Please paste the article text");
        input_content = article;
      } else if (mode === "headline") {
        if (!headline) throw new Error("Please enter a headline");
        input_content = headline;
      } else if (mode === "screenshot") {
        if (!file) throw new Error("Please upload a screenshot");
        input_content = "Screenshot analysis";
      }

      const data = await apiClient.analyzeNews({
        input_type: mode,
        input_content,
        title: title || undefined,
        source_url: mode === "url" ? url : undefined,
        file: file || undefined,
      });

      setResult(data);

      // Redirect to analysis page
      if (data.analysis_id) {
        setTimeout(() => {
          router.push(`/news/analyze/${data.analysis_id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-text">News Verification</h1>
              <p className="text-sm text-muted flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Verify news credibility with AI-powered analysis
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <QuickAction
            icon={<Newspaper className="w-5 h-5" />}
            label="Verify News"
            href="/news"
            active={true}
            color="emerald"
          />
          <QuickAction
            icon={<History className="w-5 h-5" />}
            label="History"
            href="/news/history"
            color="blue"
          />
          <QuickAction
            icon={<FileText className="w-5 h-5" />}
            label="Reports"
            href="/news/reports"
            color="sky"
          />
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
              <TabButton active={mode === "url"} onClick={() => setMode("url")} icon={<Link className="w-4 h-4" />}>
                News URL
              </TabButton>
              <TabButton active={mode === "article"} onClick={() => setMode("article")} icon={<FileText className="w-4 h-4" />}>
                Article Text
              </TabButton>
              <TabButton active={mode === "headline"} onClick={() => setMode("headline")} icon={<Newspaper className="w-4 h-4" />}>
                Headline
              </TabButton>
              <TabButton active={mode === "screenshot"} onClick={() => setMode("screenshot")} icon={<Image className="w-4 h-4" />}>
                Screenshot
              </TabButton>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error" title="Error">{error}</Alert>}

              {/* Title Field */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give this analysis a title..."
                  className="input"
                />
              </div>

              {mode === "url" && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    News Article URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/news/article"
                    className="input"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    Paste the URL of the news article you want to verify
                  </p>
                </div>
              )}

              {mode === "article" && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Article Text
                  </label>
                  <textarea
                    value={article}
                    onChange={(e) => setArticle(e.target.value)}
                    placeholder="Paste the full article text here..."
                    rows={12}
                    className="input"
                  />
                </div>
              )}

              {mode === "headline" && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    News Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Enter the news headline to verify..."
                    className="input"
                  />
                  <p className="mt-1.5 text-xs text-muted">
                    Enter the headline you want to fact-check
                  </p>
                </div>
              )}

              {mode === "screenshot" && (
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">
                    Upload Screenshot
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="input"
                  />
                  {file && (
                    <p className="mt-1.5 text-xs text-muted">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-muted">
                    Upload a screenshot of a news article or social media post
                  </p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                loading={loading}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify News
                  </>
                )}
              </Button>
            </form>

            {result && (
              <div className="mt-8 space-y-6">
                <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                  <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Analysis Started
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted">Analysis ID</p>
                      <p className="text-lg font-semibold text-text font-mono">
                        {result.analysis_id?.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Status</p>
                      <p className="text-lg font-semibold text-text capitalize">
                        {result.status}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted mt-4">
                    Redirecting to analysis workspace...
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Source Verification"
            description="Checks domain reputation, HTTPS, and publisher credibility"
          />
          <InfoCard
            icon={<Newspaper className="w-5 h-5" />}
            title="Cross-Reference"
            description="Compares claims against trusted news sources"
          />
          <InfoCard
            icon={<FileText className="w-5 h-5" />}
            title="Fact-Checking"
            description="Verifies claims against fact-checking databases"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-emerald-600 text-white"
          : "bg-background text-muted hover:text-text border border-border"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function QuickAction({
  icon,
  label,
  href,
  active,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: active
      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
    sky: "bg-sky-50 text-sky-700 hover:bg-sky-100",
  };

  return (
    <a
      href={href}
      className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
        colorMap[color] || colorMap.emerald
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-white border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      <p className="text-xs text-muted">{description}</p>
    </div>
  );
}