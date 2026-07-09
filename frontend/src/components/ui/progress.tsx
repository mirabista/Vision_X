"use client";

import React from "react";

interface ProgressProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Progress({ value, max = 100, size = "md", className = "" }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const heights = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const getColor = () => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 60) return "bg-primary";
    if (percentage >= 40) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[size]} ${className}`}>
      <div
        className={`${getColor()} h-full rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  className = ""
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return "#16A34A";
    if (percentage >= 60) return "#2563EB";
    if (percentage >= 40) return "#F59E0B";
    return "#DC2626";
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold text-text">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}