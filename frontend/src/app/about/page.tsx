"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-surface">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-text mb-6">
            About VisionX
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            AI-powered digital forensics platform dedicated to verifying digital content authenticity
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text mb-6">Our Mission</h2>
          <p className="text-lg text-muted mb-6">
            VisionX was built to address the growing challenge of digital content manipulation. 
            In an era where AI-generated content and sophisticated editing tools are increasingly accessible, 
            the ability to verify the authenticity of digital media has become critical.
          </p>
          <p className="text-lg text-muted">
            Our platform combines multiple forensic analysis techniques with advanced AI to provide 
            comprehensive, explainable authenticity reports. We believe in transparency and evidence-based 
            analysis, which is why every VisionX report includes detailed findings, confidence levels, and 
            actionable recommendations.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-text mb-12 text-center">Our Values</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background border border-border rounded-lg p-8">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Accuracy</h3>
              <p className="text-muted">
                We employ multiple analysis techniques and AI models to ensure the most accurate results possible.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-8">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Transparency</h3>
              <p className="text-muted">
                Every report includes detailed explanations of findings, methodology, and confidence levels.
              </p>
            </div>

            <div className="bg-background border border-border rounded-lg p-8">
              <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-text mb-3">Privacy</h3>
              <p className="text-muted">
                Your data is encrypted and never shared. All analyses are performed with strict confidentiality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text mb-4">Ready to verify content authenticity?</h2>
          <p className="text-xl text-muted mb-8">
            Join thousands of users who trust VisionX for digital forensics
          </p>
          <Link href="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}