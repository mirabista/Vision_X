"use client";

import React from "react";

interface AgentCardProps {
  name: string;
  description: string;
  icon: string;
  status: "waiting" | "running" | "completed" | "warning" | "failed";
  confidence?: number;
  durationMs?: number;
  summary?: string;
  latestLog?: string;
  details?: Record<string, any>;
  order: number;
}

const STATUS_COLORS: Record<string, string> = {
  waiting: "border-white/10 bg-white/5",
  running: "border-primary/50 bg-primary/10",
  completed: "border-green-500/50 bg-green-500/10",
  warning: "border-yellow-500/50 bg-yellow-500/10",
  failed: "border-red-500/50 bg-red-500/10",
};

const STATUS_LABELS: Record<string, string> = {
  waiting: "Waiting",
  running: "Running",
  completed: "Completed",
  warning: "Warning",
  failed: "Failed",
};

export default function AgentCard({
  name,
  description,
  icon,
  status,
  confidence,
  durationMs,
  summary,
  latestLog,
  details,
  order,
}: AgentCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.waiting;

  return (
    <div
      className={`rounded-xl border ${statusColor} p-4 transition-all duration-500 ${
        status === "running" ? "animate-pulse" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">{icon}</div>
          <div>
            <h4 className="font-semibold text-white">{name}</h4>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "completed"
              ? "bg-green-500/20 text-green-400"
              : status === "running"
              ? "bg-primary/20 text-primary"
              : status === "failed"
              ? "bg-red-500/20 text-red-400"
              : "bg-gray-500/20 text-gray-400"
          }`}
        >
          {STATUS_LABELS[status] || status}
        </span>
      </div>

      {status === "completed" && (
        <div className="mt-3 flex items-center gap-4 text-sm">
          {confidence !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Confidence:</span>
              <span className="text-green-400 font-medium">{(confidence * 100).toFixed(0)}%</span>
            </div>
          )}
          {durationMs !== undefined && (
            <div className="flex items-center gap-1">
              <span className="text-gray-400">Duration:</span>
              <span className="text-white font-medium">{(durationMs / 1000).toFixed(1)}s</span>
            </div>
          )}
        </div>
      )}

      {summary && (
        <p className="mt-2 text-sm text-gray-300 border-l-2 border-primary/50 pl-3">
          {summary}
        </p>
      )}

      {latestLog && (
        <p className="mt-1 text-xs text-gray-500 font-mono">
          [{new Date().toLocaleTimeString()}] {latestLog}
        </p>
      )}

      {details && Object.keys(details).length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline"
          >
            {expanded ? "Hide" : "Show"} Details
          </button>
          {expanded && (
            <pre className="mt-2 text-xs bg-black/30 p-3 rounded-lg overflow-auto max-h-64 text-gray-300">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}