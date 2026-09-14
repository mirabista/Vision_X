"use client";

import { Image, Newspaper, Film, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const MODULE_CONFIG: Record<string, { label: string; icon: any; gradient: string; color: string }> = {
  image: { label: "Image", icon: Image, gradient: "from-blue-500 to-blue-600", color: "bg-blue-100 text-blue-700 border-blue-200" },
  news: { label: "News", icon: Newspaper, gradient: "from-emerald-500 to-teal-600", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  video: { label: "Video", icon: Film, gradient: "from-primary to-primary/80", color: "bg-primary/10 text-primary border-primary/20" },
  document: { label: "Document", icon: FileText, gradient: "from-orange-500 to-orange-600", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

export function ModuleBadge({ module, size = "sm" }: { module: string; size?: "sm" | "md" }) {
  const config = MODULE_CONFIG[module] || MODULE_CONFIG.image;
  const Icon = config.icon;
  return (
    <Badge className={`${config.color} ${size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"} rounded-lg flex items-center gap-1.5`}>
      <Icon className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      {config.label}
    </Badge>
  );
}

export function ModuleIcon({ module, className = "w-5 h-5" }: { module: string; className?: string }) {
  const config = MODULE_CONFIG[module] || MODULE_CONFIG.image;
  const Icon = config.icon;
  return <Icon className={className} />;
}

export function ModuleGradient(module: string): string {
  return MODULE_CONFIG[module]?.gradient || MODULE_CONFIG.image.gradient;
}