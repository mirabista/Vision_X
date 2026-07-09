"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Upload, Loader2, Film } from "lucide-react";

interface VideoUploadFormProps {
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

export default function VideoUploadForm({ onComplete, onError }: VideoUploadFormProps) {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError?.("Please choose a video file to analyze.");
      return;
    }

    setLoading(true);
    try {
      const result = await apiClient.uploadAndAnalyze("video", file, title || file.name);
      const analysisId = result.analysis_id;
      onComplete?.({ analysis_id: analysisId });
      router.push(`/analyze/${analysisId}`);
    } catch (err: any) {
      onError?.(err.message || "Video analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
import {
  Upload,
  Clock,
  Video,
  Film,
  ShieldCheck,
  CloudUpload,
  X,
} from "lucide-react";

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white shadow-lg">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text">Video Verification</h3>
              <p className="text-sm text-muted">Upload a video file to detect deepfakes, tampering, and authenticity issues.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Upload Video File
            </label>
            <input
              type="file"
              accept=".mp4,.mov,.avi,.mkv,.webm,.m4v"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input"
            />
            {file && (
              <p className="mt-2 text-xs text-muted">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
            <p className="mt-2 text-xs text-muted">
              Supported formats: MP4, MOV, AVI, MKV, WEBM, M4V (max 50MB)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Optional Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: interview clip"
              className="input"
            />
          </div>

          {user && (
            <Alert variant="info" title="Processing time">
              Video analysis can take a few minutes depending on file length and system load.
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            loading={loading}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing video...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Start Video Analysis
              </>
            )}
          </Button>
        </form>
    <Card className="overflow-hidden border-border bg-surface">
      <CardContent className="p-0">
        <div className="border-b border-border px-5 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-text">Upload video</h3>
              <p className="mt-1 text-sm text-muted">
                Video authenticity verification module.
              </p>
            </div>

            <div className="hidden h-9 w-9 items-center justify-center rounded-full border border-border text-muted sm:flex">
              <X className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <VideoInfo
              icon={<Video className="h-5 w-5" />}
              title="Videos"
              description="MP4, WEBM, MOV"
            />

            <VideoInfo
              icon={<Film className="h-5 w-5" />}
              title="Frames"
              description="Deepfake frame checks"
            />

            <VideoInfo
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Trust report"
              description="Coming in future"
            />
          </div>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary/50 bg-background px-6 py-10 text-center">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface text-primary">
              <CloudUpload className="h-10 w-10" />
            </div>

            <h4 className="text-lg font-bold text-text">
              Video verification is coming soon
            </h4>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              This module will support video upload, frame-level authenticity
              checks, deepfake detection, and explainable video trust reports.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Coming Soon</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-xs text-muted">
            Current release focuses on image and document evidence analysis.
          </p>

          <Button type="button" disabled className="min-w-[160px]">
            <Upload className="h-4 w-4" />
            Upload Video
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoInfo({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>

      <div>
        <p className="text-sm font-semibold text-text">{title}</p>
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}