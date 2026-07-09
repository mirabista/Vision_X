"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, FileText, Code, BookMarked, HelpCircle,
  Newspaper, GitBranch, ArrowRight, ExternalLink, Shield
} from "lucide-react";

function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return { ref, controls };
}

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, controls } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const docs = [
  { icon: <BookOpen className="w-5 h-5" />, title: "Getting Started Guide", desc: "Learn the basics of VisionX and set up your first analysis in minutes.", badge: "Popular" },
  { icon: <Code className="w-5 h-5" />, title: "API Reference", desc: "Complete API documentation with endpoints, authentication, and examples.", badge: null },
  { icon: <FileText className="w-5 h-5" />, title: "Integration Guide", desc: "Integrate VisionX into your existing workflows and applications.", badge: null },
  { icon: <Shield className="w-5 h-5" />, title: "Best Practices", desc: "Security guidelines and recommended workflows for enterprise deployments.", badge: "New" },
];

const guides = [
  { title: "How to Verify Image Authenticity", time: "5 min read" },
  { title: "Understanding AI Confidence Scores", time: "3 min read" },
  { title: "Generating Court-Admissible Reports", time: "7 min read" },
  { title: "Setting Up Team Access Controls", time: "4 min read" },
];

const blogPosts = [
  { title: "The Rise of AI-Generated Images", date: "Dec 15, 2024", category: "Insights" },
  { title: "Digital Forensics in Modern Journalism", date: "Dec 10, 2024", category: "Case Study" },
  { title: "Understanding Error Level Analysis", date: "Dec 5, 2024", category: "Technical" },
];

const releases = [
  { version: "v2.4.0", date: "Dec 2024", changes: "Enhanced deepfake detection, improved OCR accuracy" },
  { version: "v2.3.0", date: "Nov 2024", changes: "New API endpoints, batch processing support" },
  { version: "v2.2.0", date: "Oct 2024", changes: "PDF report templates, custom branding" },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <Badge variant="info" className="mb-4 px-3 py-1">Resources</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-text tracking-tight mb-4">
              Resources & Documentation
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              Everything you need to get started with VisionX, from quick start guides to comprehensive API documentation.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-8">Documentation</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {docs.map((doc, i) => (
              <ScrollReveal key={doc.title} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-background border border-border rounded-lg p-5 hover:border-primary/20 hover:shadow-sm transition-all h-full"
                >
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary mb-3">
                    {doc.icon}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-text">{doc.title}</h3>
                    {doc.badge && <Badge variant="info" className="text-[10px] px-1.5">{doc.badge}</Badge>}
                  </div>
                  <p className="text-xs text-muted leading-relaxed mb-3">{doc.desc}</p>
                  <Link href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors">
                    Read more <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* API Overview */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">API Overview</h2>
            <p className="text-muted mb-8">Simple REST API for integrating VisionX into your applications.</p>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { method: "POST", endpoint: "/api/v1/analyze", desc: "Submit media for analysis" },
              { method: "GET", endpoint: "/api/v1/reports/{id}", desc: "Retrieve analysis results" },
              { method: "GET", endpoint: "/api/v1/history", desc: "List past analyses" },
            ].map((api, i) => (
              <ScrollReveal key={api.endpoint} delay={i * 0.05}>
                <div className="bg-surface border border-border rounded-lg p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={api.method === "POST" ? "success" : "info"} className="text-[10px]">{api.method}</Badge>
                    <code className="text-xs text-text font-mono">{api.endpoint}</code>
                  </div>
                  <p className="text-xs text-muted mb-3">{api.desc}</p>
                  <Link href="#" className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-dark transition-colors">
                    View docs <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-8">Guides</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-3">
            {guides.map((guide, i) => (
              <ScrollReveal key={guide.title} delay={i * 0.05}>
                <Link href="#" className="block bg-background border border-border rounded-lg p-5 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-text mb-1">{guide.title}</h3>
                      <p className="text-xs text-muted">{guide.time}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted flex-shrink-0 mt-1" />
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-8">Blog</h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-3 gap-4">
            {blogPosts.map((post, i) => (
              <ScrollReveal key={post.title} delay={i * 0.05}>
                <Link href="#" className="block bg-surface border border-border rounded-lg p-5 hover:border-primary/20 hover:shadow-sm transition-all">
                  <Badge variant="info" className="text-[10px] mb-3">{post.category}</Badge>
                  <h3 className="text-sm font-semibold text-text mb-2">{post.title}</h3>
                  <p className="text-xs text-muted">{post.date}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Release Notes */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-8">Release Notes</h2>
          </ScrollReveal>
          <div className="space-y-3">
            {releases.map((release, i) => (
              <ScrollReveal key={release.version} delay={i * 0.05}>
                <div className="bg-background border border-border rounded-lg p-5 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="default" className="text-[10px]">{release.version}</Badge>
                    <span className="text-xs text-muted">{release.date}</span>
                  </div>
                  <p className="text-sm text-text">{release.changes}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
              Need Help?
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Our support team is here to help you get the most out of VisionX.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  Contact Support
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="secondary">
                  Explore Features
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}