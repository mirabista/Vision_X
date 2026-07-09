"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Upload, Loader2, Link, FileText, Newspaper, Image } from "lucide-react";

interface NewsUploadFormProps {
  onComplete: (data: any) => void;
  onError: (error: string) => void;
}

export default function NewsUploadForm({ onComplete, onError }: NewsUploadFormProps) {
  const { user } = useAuth();
  const [mode, setMode] = useState<"url" | "article" | "screenshot" | "headline">("url");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [article, setArticle] = useState("");
  const [headline, setHeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      onComplete(data);
    } catch (err: any) {
      onError(err.message || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                mode === "url"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Link className="w-4 h-4" />
              News URL
            </button>
            <button
              type="button"
              onClick={() => setMode("article")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                mode === "article"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <FileText className="w-4 h-4" />
              Article Text
            </button>
            <button
              type="button"
              onClick={() => setMode("headline")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                mode === "headline"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              Headline
            </button>
            <button
              type="button"
              onClick={() => setMode("screenshot")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                mode === "screenshot"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Image className="w-4 h-4" />
              Screenshot
            </button>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
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
              <label className="block text-sm font-medium text-text-secondary mb-2">
                News Article URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/news/article"
                className="input"
              />
              <p className="mt-2 text-xs text-muted">
                Paste the URL of the news article you want to verify
              </p>
            </div>
          )}

          {mode === "article" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Article Text
              </label>
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="Paste the full article text here..."
                rows={10}
                className="input"
              />
            </div>
          )}

          {mode === "headline" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                News Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Enter the news headline to verify..."
                className="input"
              />
              <p className="mt-2 text-xs text-muted">
                Enter the headline you want to fact-check
              </p>
            </div>
          )}

          {mode === "screenshot" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Upload Screenshot
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="input"
              />
              {file && (
                <p className="mt-2 text-xs text-muted">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
              <p className="mt-2 text-xs text-muted">
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
                <Upload className="w-4 h-4" />
                Verify News
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}