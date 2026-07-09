"use client";

import React from "react";

interface LiveEvidenceProps {
  agentName: string;
  agentOrder: number;
  evidence: Record<string, any>;
  timestamp?: string;
}

export default function LiveEvidenceCard({ agentName, agentOrder, evidence, timestamp }: LiveEvidenceProps) {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!evidence || Object.keys(evidence).length === 0) return null;

  const time = timestamp ? new Date(timestamp).toLocaleTimeString() : "";

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">
          {agentOrder}. {agentName}
        </h4>
        {time && <span className="text-xs text-gray-500">{time}</span>}
      </div>
      <div className="space-y-2">
        {Object.entries(evidence).map(([key, value]) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 uppercase tracking-wider">{key}</span>
            <EvidenceValue value={value} />
          </div>
        ))}
      </div>
    </div>
  );
}

function EvidenceValue({ value }: { value: any }) {
  if (value === null || value === undefined) return <span className="text-gray-600 text-xs">None</span>;

  if (typeof value === "boolean") {
    return (
      <span className={`text-sm font-medium ${value ? "text-green-400" : "text-red-400"}`}>{value.toString()}</span>
    );
  }

  if (typeof value === "number") {
    if (value <= 1 && value >= 0) {
      return (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${value * 100}%` }}
            />
          </div>
          <span className="text-sm text-primary font-medium">{(value * 100).toFixed(0)}%</span>
        </div>
      );
    }
    return <span className="text-sm text-white font-medium">{value.toLocaleString()}</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-600 text-xs">Empty</span>;
    return (
      <ul className="text-sm text-gray-300 list-disc list-inside">
        {value.slice(0, 5).map((item: any, i: number) => (
          <li key={i}>{typeof item === "object" ? JSON.stringify(item) : String(item)}</li>
        ))}
        {value.length > 5 && <li className="text-gray-500">...and {value.length - 5} more</li>}
      </ul>
    );
  }

  if (typeof value === "object") {
    return <pre className="text-xs bg-black/40 p-2 rounded text-gray-300 overflow-auto">{JSON.stringify(value, null, 2)}</pre>;
  }

  const str = String(value);
  if (str.length > 200) {
    return <p className="text-sm text-gray-300 line-clamp-3">{str.slice(0, 200)}...</p>;
  }
  return <p className="text-sm text-gray-300">{str}</p>;
}