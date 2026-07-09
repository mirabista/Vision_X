"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Upload, Loader2, FileText, Link } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ImageUploadFormProps {
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
  endpoint?: string;
  successPath?: string;
  module?: string;
}

export default function ImageUploadForm({ onComplete, onError, successPath, module }: ImageUploadFormProps) {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"file" | "text" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let analysisId = "";

      if (mode === "file" && file) {
        // Use apiClient.uploadAndAnalyze instead of raw fetch to /api/upload
        const result = await apiClient.uploadAndAnalyze(
          module || "image",
          file,
          file.name
        );
        analysisId = result.analysis_id;
      } else {
        const inputContent = text || url;
        if (!inputContent) {
          throw new Error("Please provide text or URL to analyze.");
        }

        // Use apiClient.startAnalysis instead of raw fetch to /api/analyze
        const result = await apiClient.startAnalysis({
          module: module || "image",
          input_type: mode,
          input_content: inputContent,
          title: inputContent.slice(0, 100),
        });
        analysisId = result.analysis_id;
      }

      onComplete?.({ analysis_id: analysisId });
      router.push(`${successPath || "/analysis"}${analysisId ? `/${analysisId}` : ""}`);
    } catch (err: any) {
      const message = err.message || "Analysis failed";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Checking authentication...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-danger mb-4">Please log in to analyze content.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Tabs */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "file"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Upload className="w-4 h-4" />
              File
            </button>
            <button
              type="button"
              onClick={() => setMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "text"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === "url"
                  ? "bg-primary text-white"
                  : "bg-background text-muted hover:text-text"
              }`}
            >
              <Link className="w-4 h-4" />
              URL
            </button>
          </div>

          {mode === "file" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Upload Image or PDF
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="input"
              />
              {file && (
                <p className="mt-2 text-xs text-muted">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
              <p className="mt-2 text-xs text-muted">
                Supported formats: JPG, PNG, WEBP, TIFF, PDF (max 50MB)
              </p>
            </div>
          )}

          {mode === "text" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Paste Text Content
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste image URL, base64 data, or description..."
                rows={6}
                className="input"
              />
            </div>
          )}

          {mode === "url" && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Enter Image URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
                Start Image Analysis
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}