"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Shield, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold text-text tracking-tight mb-4">404</h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-text mb-4">Page Not Found</h2>
          <p className="text-lg text-muted max-w-xl mx-auto mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/">
              <Button size="lg" className="gap-2">
                Go Home
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/analyze">
              <Button size="lg" variant="secondary" className="gap-2">
                <Search className="w-4 h-4" />
                Start Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}