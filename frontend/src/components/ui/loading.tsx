"use client";

import React from "react";

export function Spinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizes[size]} ${className}`}>
      <svg className="animate-spin text-primary" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  );
}

export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

export function LoadingCard() {
  return (
    <div className="bg-background border border-border rounded-lg p-6">
      <LoadingSkeleton className="h-4 w-3/4 mb-4" />
      <LoadingSkeleton className="h-4 w-1/2 mb-4" />
      <LoadingSkeleton className="h-4 w-5/6" />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-muted">Loading...</p>
      </div>
    </div>
  );
}