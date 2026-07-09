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
      </CardContent>
    </Card>
  );
}