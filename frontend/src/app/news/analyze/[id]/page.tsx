"use client";

import React from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

const NewsAnalysisWorkspace = dynamic(() => import("@/components/analysis/unified-analysis-workspace"), {
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted">Loading...</p>
    </div>
  </div>,
  ssr: false,
});

export default function NewsAnalyzePage() {
  const params = useParams();
  const id = params.id as string;
  return <NewsAnalysisWorkspace analysisId={id} module="news" />;
}
