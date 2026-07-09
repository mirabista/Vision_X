"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Server, FileText, ArrowRight } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 lg:py-20 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Legal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-text tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted leading-relaxed">
            Last updated: December 2024. This policy describes how VisionX collects, uses, and protects your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-3">On this page</h3>
                <nav className="space-y-2">
                  {["Data Collection", "Data Usage", "Data Security", "Your Rights", "Contact"].map((item) => (
                    <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, "-")}`} className="block text-xs text-muted hover:text-primary transition-colors">
                      {item}
                    </a>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              <div id="data-collection" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-text mb-4">Data Collection</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  We collect information you provide directly to us, such as account information, uploaded media files, and communication preferences. This includes:
                </p>
                <ul className="space-y-2 mb-4">
                  {["Account credentials and profile information", "Media files submitted for analysis", "Analysis results and reports", "Communication and support inquiries"].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div id="data-usage" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-text mb-4">Data Usage</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  We use the information we collect to provide, maintain, and improve our services. This includes processing your media files for analysis, generating reports, and communicating with you about our services.
                </p>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-text mb-1">We never share your data</h3>
                      <p className="text-xs text-muted leading-relaxed">Your uploaded media and analysis results are never shared with third parties without your explicit consent.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div id="data-security" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-text mb-4">Data Security</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  We implement industry-standard security measures to protect your data:
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { icon: <Lock className="w-4 h-4" />, title: "Encryption", desc: "AES-256 encryption at rest, TLS 1.3 in transit" },
                    { icon: <Server className="w-4 h-4" />, title: "Infrastructure", desc: "SOC 2 compliant, ISO 27001 certified" },
                    { icon: <Eye className="w-4 h-4" />, title: "Access Control", desc: "Role-based access, audit logging" },
                    { icon: <Shield className="w-4 h-4" />, title: "Compliance", desc: "GDPR, CCPA, and industry regulations" },
                  ].map((item) => (
                    <div key={item.title} className="bg-surface border border-border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
                          {item.icon}
                        </div>
                        <h3 className="text-sm font-semibold text-text">{item.title}</h3>
                      </div>
                      <p className="text-xs text-muted">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div id="your-rights" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-text mb-4">Your Rights</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  You have the right to access, correct, or delete your personal data. You can request data deletion at any time by contacting our support team or through your account settings.
                </p>
              </div>

              <div id="contact" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-text mb-4">Contact Us</h2>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-surface border border-border rounded-lg p-5">
                  <p className="text-sm text-text mb-2">Email: privacy@visionx.ai</p>
                  <p className="text-sm text-text mb-4">Address: VisionX Inc., 123 Security Street, San Francisco, CA 94105</p>
                  <Link href="/contact">
                    <Button size="sm" className="gap-2">
                      Contact Support <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}