"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import {
  Upload,
  Loader2,
  FileText,
  Link as LinkIcon,
  ImageIcon,
  FileImage,
  Search,
  X,
  CloudUpload,
} from "lucide-react";

interface ImageUploadFormProps {
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
  endpoint?: string;
  successPath?: string;
  module?: string;
}

export default function ImageUploadForm({
  onComplete,
  onError,
  successPath,
  module,
}: ImageUploadFormProps) {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [mode, setMode] = useState<"file" | "text" | "url">("file");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");

  const handleFileSelect = (selectedFile?: File | null) => {
    if (!selectedFile) return;
    setFile(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let analysisId = "";

      if (mode === "file" && file) {
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

        const result = await apiClient.startAnalysis({
          module: module || "image",
          input_type: mode,
          input_content: inputContent,
          title: inputContent.slice(0, 100),
        });
        analysisId = result.analysis_id;
      }

      onComplete?.({ analysis_id: analysisId });
      router.push(
        `${successPath || "/analysis"}${analysisId ? `/${analysisId}` : ""}`
      );
    } catch (err: any) {
      const message = err.message || "Analysis failed";
      onError?.(message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="p-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted">Checking authentication...</p>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return (
      <Card className="border-border bg-surface">
        <CardContent className="p-12 text-center">
          <p className="mb-4 text-danger">Please log in to analyze content.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border bg-surface">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="border-b border-border px-5 py-5 sm:px-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-text">
                  Upload content
                </h3>
                <p className="mt-1 text-sm text-muted">
                  Add evidence for authenticity and trust analysis.
                </p>
              </div>

              <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted sm:flex">
                <X className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <ModeInfo
                active={mode === "file"}
                icon={<ImageIcon className="h-5 w-5" />}
                title="Images / PDF"
                description="PNG, JPG, WEBP, PDF"
                onClick={() => setMode("file")}
              />

              <ModeInfo
                active={mode === "text"}
                icon={<FileText className="h-5 w-5" />}
                title="Text"
                description="Paste suspicious content"
                onClick={() => setMode("text")}
              />

              <ModeInfo
                active={mode === "url"}
                icon={<LinkIcon className="h-5 w-5" />}
                title="URL"
                description="Analyze online source"
                onClick={() => setMode("url")}
              />
            </div>
          </div>

          <div className="px-5 py-6 sm:px-7">
            {mode === "file" && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,.tiff,.pdf"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    handleFileSelect(e.dataTransfer.files?.[0]);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-primary/60 bg-background hover:bg-primary/5"
                  }`}
                >
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface text-primary">
                    <CloudUpload className="h-10 w-10" />
                  </div>

                  <h4 className="text-lg font-bold text-text">
                    Drag & drop to upload
                  </h4>

                  <p className="mt-1 text-sm text-muted">
                    or{" "}
                    <span className="font-medium text-primary">
                      browse from device
                    </span>
                  </p>

                  {file && (
                    <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileImage className="h-4 w-4" />
                      </div>

                      <div className="text-left">
                        <p className="max-w-[220px] truncate text-sm font-medium text-text">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted">
                          {(file.size / 1024).toFixed(1)} KB selected
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-muted">
                  Supported formats: JPG, PNG, WEBP, TIFF, PDF. Maximum upload
                  size depends on backend configuration.
                </p>
              </div>
            )}

            {mode === "text" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Paste text content
                </label>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste suspicious text, claim, caption, OCR content, or description..."
                  rows={9}
                  className="w-full resize-none rounded-2xl border border-border bg-background px-4 py-4 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
                />

                <p className="mt-3 text-xs text-muted">
                  VisionX will treat this as text evidence for analysis.
                </p>
              </div>
            )}

            {mode === "url" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-text">
                  Enter URL
                </label>

                <div className="relative">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/source-or-image"
                    className="w-full rounded-2xl border border-border bg-background px-4 py-4 pr-12 text-sm text-text outline-none transition-colors placeholder:text-muted focus:border-primary"
                  />

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted">
                    <Search className="h-5 w-5" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-muted">
                  Paste an image URL, news URL, or public source link for
                  verification.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <p className="text-xs text-muted">
              Please verify that you have permission to analyze the uploaded
              content.
            </p>

            <Button
              type="submit"
              className="min-w-[160px]"
              loading={loading}
              disabled={loading || (mode === "file" && !file)}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Start Analysis
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ModeInfo({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors ${
        active
          ? "border-primary bg-primary/10"
          : "border-border bg-background hover:border-primary/60"
      }`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
          active ? "bg-primary text-white" : "bg-surface text-primary"
        }`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </button>
  );
}