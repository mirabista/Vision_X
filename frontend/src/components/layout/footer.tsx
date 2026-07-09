"use client";

import React from "react";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Solutions", href: "/solutions" },
    { label: "API", href: "/api-docs" },
    { label: "Documentation", href: "/resources" },
  ],
  resources: [
    { label: "Resources", href: "/resources" },
    { label: "Guides", href: "/resources" },
    { label: "Support", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-text tracking-tight">
                Vision<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              AI-powered digital media verification and forensic analysis platform for professionals.
            </p>
            <div className="flex items-center gap-2 mt-4">
              {["X", "Li", "Gh"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-border bg-background flex items-center justify-center text-xs text-muted hover:text-primary hover:border-primary transition-colors"
                  aria-label={social}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <p className="text-xs text-muted-light mb-1">Contact</p>
              <a href="mailto:hello@visionx.ai" className="text-sm text-primary hover:text-primary-dark transition-colors">
                hello@visionx.ai
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} VisionX. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-muted hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-muted hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}