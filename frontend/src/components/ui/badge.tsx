"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const variants = {
    default: "badge bg-background text-muted border-border",
    success: "badge-success",
    warning: "badge-warning",
    danger: "badge-danger",
    info: "badge-info",
  };

  return (
    <span
      className={`${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}