"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`input ${error ? "border-danger focus:border-danger focus:ring-danger/20" : ""} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}