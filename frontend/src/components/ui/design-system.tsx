"use client";

import React from "react";

// ===========================================
// VisionX Design System
// Single source of truth for colors, typography, spacing
// ===========================================

export const colors = {
  primary: "#3b82f6", // blue-500
  primaryHover: "#2563eb", // blue-600
  success: "#22c55e", // green-500
  warning: "#f59e0b", // amber-500
  danger: "#ef4444", // red-500
  neutral: "#64748b", // slate-500
  background: "#0f172a", // slate-900
  surface: "#1e293b", // slate-800
  surfaceHover: "#334155", // slate-700
  border: "rgba(255,255,255,0.1)",
  textPrimary: "#f8fafc", // slate-50
  textSecondary: "#94a3b8", // slate-400
  textMuted: "#64748b", // slate-500
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: "text-3xl font-bold",
  h2: "text-xl font-semibold",
  h3: "text-lg font-semibold",
  h4: "text-base font-semibold",
  body: "text-sm",
  caption: "text-xs",
} as const;

// ===========================================
// Reusable Components
// ===========================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className={`${typography.h1} text-white`}>{title}</h1>
        {subtitle && <p className={`${typography.body} text-slate-400 mt-1`}>{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
}

export function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? "text-green-400" : "text-red-400"}`}>
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "danger";
}

export function StatusBadge({ status, variant = "default" }: StatusBadgeProps) {
  const variants = {
    default: "bg-slate-500/20 text-slate-400",
    success: "bg-green-500/20 text-green-400",
    warning: "bg-amber-500/20 text-amber-400",
    danger: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full ${variants[variant]}`}>
      {status}
    </span>
  );
}

interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function SectionCard({ title, children, className = "", actions }: SectionCardProps) {
  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className={`${typography.h4} text-white`}>{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-slate-500 text-4xl mb-4">📭</div>
      <h3 className={`${typography.h4} text-white mb-1`}>{title}</h3>
      {description && <p className={`${typography.body} text-slate-400 mb-4`}>{description}</p>}
      {action}
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className={`${typography.body} text-slate-400`}>{message}</p>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className={`${typography.h4} text-white mb-2`}>{title}</h3>
        <p className={`${typography.body} text-slate-400 mb-6`}>{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 text-sm">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm ${
              variant === "danger"
                ? "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                : "bg-primary text-white hover:bg-primary-hover"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}