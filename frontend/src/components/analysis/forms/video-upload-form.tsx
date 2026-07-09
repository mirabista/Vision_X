"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Clock } from "lucide-react";

export default function VideoUploadForm() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
          <Upload className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-bold text-text mb-3">Video Verification</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">
          Upload video files or provide video URLs to detect deepfakes, manipulated content, and verify authenticity.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Coming Soon</span>
        </div>
      </CardContent>
    </Card>
  );
}