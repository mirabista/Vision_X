"use client";

import dynamic from "next/dynamic";

// Dynamically import the unified analyze page
const UnifiedAnalyzePage = dynamic(() => import("@/components/analysis/unified-analyze-page"), {
  loading: () => <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-muted">Loading...</p>
    </div>
  </div>,
  ssr: false,
});

export default function AnalyzePage() { 
  return <UnifiedAnalyzePage />;
}