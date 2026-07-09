"use client";

import React from "react";

export function NavbarSkeleton() {
  return (
    <nav className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo skeleton */}
          <div className="flex items-center gap-2.5">
            <div className="skeleton w-8 h-8 rounded-lg" />
            <div className="skeleton w-24 h-6 rounded" />
          </div>

          {/* Desktop nav skeleton */}
          <div className="hidden md:flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton w-16 h-4 rounded" />
            ))}
          </div>

          {/* Auth section skeleton */}
          <div className="hidden md:block">
            <div className="skeleton w-20 h-9 rounded-lg" />
          </div>
        </div>
      </div>
    </nav>
  );
}