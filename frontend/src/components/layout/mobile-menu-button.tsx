"use client";

import React from "react";
import { Menu, X } from "lucide-react";

export function MobileMenuButton({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors"
      aria-label="Toggle mobile menu"
    >
      {isOpen ? (
        <X className="w-5 h-5 text-text" />
      ) : (
        <Menu className="w-5 h-5 text-text" />
      )}
    </button>
  );
}