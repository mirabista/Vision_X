"use client";

import React from "react";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, alt, name, size = "md", className = "" }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name || "User"}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary text-white flex items-center justify-center font-medium ${className}`}
    >
      {initials}
    </div>
  );
}