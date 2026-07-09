"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Lock, AlertTriangle, ArrowRight } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 lg:py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text tracking-tight mb-4">Terms of Service</h1>
          <p className="text-lg text-muted leading-relaxed">
            Last updated: December 2024. Please read these terms carefully before using VisionX.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Acceptance of Terms</h2>
              <p className="text-sm text-muted leading-relaxed">
                By accessing or using VisionX, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Description of Service</h2>
              <p className="text-sm text-muted leading-relaxed">
                VisionX provides AI-powered digital media verification and forensic analysis services. Our platform analyzes uploaded media files to detect manipulations, deepfakes, and other authenticity concerns.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">User Responsibilities</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                You are responsible for:
              </p>
              <ul className="space-y-2">
                {["Maintaining the confidentiality of your account credentials", "All activities that occur under your account", "Ensuring you have the right to analyze any media you upload", "Using the service in compliance with applicable laws and regulations"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Intellectual Property</h2>
              <p className="text-sm text-muted leading-relaxed">
                VisionX and its original content, features, and functionality are owned by VisionX Inc. and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Limitation of Liability</h2>
              <div className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-text mb-1">Important Notice</h3>
                    <p className="text-xs text-muted leading-relaxed">
                      VisionX provides analysis tools for informational purposes. Results should be verified by qualified professionals before being used in legal proceedings or critical decision-making.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Privacy and Data Protection</h2>
              <p className="text-sm text-muted leading-relaxed">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using VisionX, you agree to our data practices as described in our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Termination</h2>
              <p className="text-sm text-muted leading-relaxed">
                We reserve the right to suspend or terminate your access to VisionX at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-text mb-4">Contact Information</h2>
              <p className="text-sm text-muted leading-relaxed mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-surface border border-border rounded-lg p-5">
                <p className="text-sm text-text mb-2">Email: legal@visionx.ai</p>
                <p className="text-sm text-text mb-4">Address: VisionX Inc., 123 Security Street, San Francisco, CA 94105</p>
                <Link href="/contact">
                  <Button size="sm" className="gap-2">
                    Contact Us <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}