"use client";

import React from "react";
import { useParams } from "next/navigation";
import AnalysisWorkspace from "@/components/analysis/unified-analysis-workspace";

export default function AnalyzeIdPage() {
  const params = useParams();
  const id = params.id as string;

  return <AnalysisWorkspace analysisId={id} />;
}