"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function FeaturesPage() {
  const features = [
    {
      icon: "🔍",
      title: "Multi-Agent Analysis",
      description: "Multiple specialized AI agents analyze different aspects of your content including metadata, OCR, compression artifacts, and visual patterns.",
    },
    {
      icon: "📊",
      title: "Trust Score",
      description: "Receive a comprehensive trust score from 0-100 with detailed breakdown of authenticity indicators and risk factors.",
    },
    {
      icon: "📄",
      title: "Professional Reports",
      description: "Generate forensic-grade PDF reports suitable for professional use, including all findings, evidence, and recommendations.",
    },
    {
      icon: "📁",
      title: "Case Management",
      description: "Organize your analyses into incidents and cases for comprehensive tracking and documentation.",
    },
    {
      icon: "🤖",
      title: "AI Detection",
      description: "Advanced detection of AI-generated content, deepfakes, and image manipulation using state-of-the-art models.",
    },
    {
      icon: "🔐",
      title: "Secure & Private",
      description: "Your data is encrypted and secure. All uploads are processed with industry-standard security practices.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-6">
            Powerful Features for Digital Forensics
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Comprehensive AI-powered tools for image authenticity verification and forensic analysis
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background border border-border rounded-lg p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-text mb-3">{feature.title}</h3>
                <p className="text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start analyzing content with AI-powered forensics today
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}