"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import SplineViewer from "@/components/hero/spline-viewer";
import {
  Shield,
  Upload,
  FileText,
  BarChart3,
  Lock,
  Search,
  Image,
  Scan,
  FileCheck,
  BookOpen,
  Eye,
  Download,
  CheckCircle,
  ArrowRight,
  Play,
  ChevronDown,
  BadgeCheck,
  Activity,
  Cpu,
  Layers,
  User,
  Settings,
} from "lucide-react";

// ─── Hooks ────────────────────────────────────────────────
function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return { ref, controls };
}

function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, controls } = useScrollReveal();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, delay, ease: "easeOut" },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <ScrollReveal>
      <div className="mb-14 text-center">
        {eyebrow && (
          <span className="inline-block mb-3 text-xs font-semibold tracking-[0.14em] uppercase text-primary">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </ScrollReveal>
  );
}

// ─── Decorative background blob (pure CSS, no logic) ──────
function GradientBlob({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-primary/10 blur-3xl ${className}`}
    />
  );
}

// ─── Tiny mock-UI preview used inside bento feature cards ──
function MockPreview({ variant }: { variant: "bars" | "chat" | "grid" }) {
  if (variant === "chat") {
    return (
      <div className="rounded-lg border border-border/60 bg-background p-3 space-y-2">
        {[
          { name: "evidence_01.jpg", status: "Verified" },
          { name: "clip_reel.mp4", status: "Flagged" },
        ].map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-md bg-surface px-2.5 py-1.5"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-primary-50 flex items-center justify-center">
                <Image className="w-3 h-3 text-primary" />
              </div>
              <span className="text-[11px] text-text">{row.name}</span>
            </div>
            <Badge
              variant={row.status === "Verified" ? "success" : "warning"}
              className="text-[9px] px-1.5"
            >
              {row.status}
            </Badge>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="rounded-lg border border-border/60 bg-background p-3 grid grid-cols-3 gap-2">
        {["EXIF", "GPS", "Hash"].map((label) => (
          <div
            key={label}
            className="rounded-md bg-surface p-2 text-center border border-border/50"
          >
            <div className="text-[9px] text-muted-light mb-0.5">{label}</div>
            <div className="text-[11px] font-semibold text-text">✓</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted">Manipulation score</span>
        <span className="text-[11px] font-semibold text-danger">3.2%</span>
      </div>
      <Progress value={3} size="sm" />
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted">Confidence</span>
        <span className="text-[11px] font-semibold text-success">High</span>
      </div>
    </div>
  );
}

// ─── FAQ Accordion ────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-background">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface transition-colors"
      >
        <span className="text-sm font-medium text-text pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 text-sm text-muted leading-relaxed border-t border-border pt-3">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Dashboard Mockup ──────────────────────────────────────
function DashboardMockup() {
  const [scanActive, setScanActive] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanActive(true);
      setProgress(0);
      const progInterval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            clearInterval(progInterval);
            setTimeout(() => setScanActive(false), 1500);
            return 100;
          }
          return p + 2;
        });
      }, 60);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface/50">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger" />
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted">Analysis Active</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-2.5 pb-2 border-b border-border/50">
          {["Upload", "Analysis", "Report"].map((tab) => (
            <button
              key={tab}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                tab === "Analysis"
                  ? "bg-primary text-white"
                  : "text-muted hover:text-text hover:bg-surface"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">
          {/* Upload */}
          <div className="flex items-center gap-2.5 p-2.5 bg-surface rounded-lg border border-border/50">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Image className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text">
                  evidence_photo.jpg
                </span>
                <Badge
                  variant={scanActive ? "warning" : "success"}
                  className="text-[9px] px-1.5"
                >
                  {scanActive ? "Scanning" : "Complete"}
                </Badge>
              </div>
              <Progress value={progress} size="sm" className="mt-1.5" />
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center justify-between p-2.5 bg-success/5 rounded-lg border border-success/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted">Authenticity Score</div>
                <div className="text-base font-bold text-success">92.4%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted">AI Confidence</div>
              <div className="text-sm font-semibold text-text">High</div>
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-surface rounded-lg border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Scan className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted">ELA Analysis</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">Normal</span>
                <Badge variant="success" className="text-[9px]">
                  Pass
                </Badge>
              </div>
            </div>
            <div className="p-2.5 bg-surface rounded-lg border border-border/50">
              <div className="flex items-center gap-1.5 mb-1">
                <Cpu className="w-3 h-3 text-primary" />
                <span className="text-xs text-muted">AI Artifacts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text">None</span>
                <Badge variant="success" className="text-[9px]">
                  Clear
                </Badge>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            <div className="text-xs text-muted">Detection Timeline</div>
            {[
              { label: "Metadata Analysis", status: "Complete", time: "0.3s" },
              { label: "ELA Scan", status: "Complete", time: "0.8s" },
              {
                label: "Deepfake Detection",
                status: scanActive ? "Running" : "Complete",
                time: scanActive ? "..." : "1.2s",
              },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.status === "Complete"
                        ? "bg-success"
                        : "bg-primary animate-pulse"
                    }`}
                  />
                  <span className="text-xs text-text">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] ${item.status === "Complete" ? "text-success" : "text-primary"}`}
                  >
                    {item.status}
                  </span>
                  <span className="text-[10px] text-muted-light">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {scanActive && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Analysis Preview ───────────────────────────────────────
function AnalysisPreview() {
  const steps = [
    "Uploading...",
    "Reading Metadata...",
    "Running AI Models...",
    "Performing Error Level Analysis...",
    "Checking Compression...",
    "Detecting AI Artifacts...",
    "Generating Report...",
    "Completed",
  ];
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentStep((p) => (p >= steps.length - 1 ? 0 : p + 1)),
      1500,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-text">Analysis Pipeline</h4>
          <Badge
            variant={currentStep === steps.length - 1 ? "success" : "info"}
          >
            {currentStep === steps.length - 1 ? "Completed" : "Processing"}
          </Badge>
        </div>
        <div className="space-y-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                  i < currentStep
                    ? "bg-success/10 text-success"
                    : i === currentStep
                      ? "bg-primary/10 text-primary"
                      : "bg-surface text-muted-light"
                }`}
              >
                {i < currentStep ? (
                  <CheckCircle className="w-3 h-3" />
                ) : i === currentStep ? (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-light" />
                )}
              </div>
              <span
                className={`text-xs transition-colors ${
                  i === currentStep
                    ? "text-text font-medium"
                    : i < currentStep
                      ? "text-success"
                      : "text-muted-light"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-5">
        <h4 className="text-sm font-semibold text-text mb-3">
          Analysis Results
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Authenticity Score",
              value: "92%",
              color: "text-success",
            },
            { label: "AI Confidence", value: "96%", color: "text-primary" },
            { label: "Risk Level", value: "Low", color: "text-success" },
            { label: "Findings", value: "3 Issues", color: "text-text" },
          ].map((r) => (
            <div
              key={r.label}
              className="p-2.5 bg-surface rounded-lg border border-border/50"
            >
              <div className="text-xs text-muted mb-0.5">{r.label}</div>
              <div className={`text-base font-bold ${r.color}`}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] lg:min-h-screen flex items-center overflow-hidden">
        {/* =========================
      Spline Background
  ========================== */}
        <div className="absolute inset-0 -z-20">
          <SplineViewer title="VisionX Hero Background" />
        </div>

        {/* =========================
      Hero Content
  ========================== */}
        <div className="relative z-10 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl py-24 lg:py-32"
            >
              <Badge
                className="
    mb-8
    inline-flex
    items-center
    gap-2
    rounded-full
    border
    border-white/15
    bg-white/10
    px-4
    py-2
    text-sm
    font-medium
    text-white
    backdrop-blur-xl
    shadow-[0_8px_32px_rgba(0,0,0,0.25)]
    transition-all
    duration-300
    hover:bg-white/15
    hover:border-white/25
  "
              >
                AI-Powered Digital Forensics Platform
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                Authenticate Digital Media with{" "}
                <span className="text-primary">Advanced AI Forensics</span>
              </h1>

              <p className="text-lg text-muted leading-relaxed mb-8 max-w-xl">
                Detect manipulated images, deepfakes, AI-generated media, and
                misinformation using advanced AI models and forensic analysis.
                Generate professional verification reports within seconds.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/analyze">
                  <Button size="lg" className="gap-2">
                    <Upload className="w-5 h-5" />
                    Start Free Analysis
                  </Button>
                </Link>

                <Button size="lg" variant="secondary" className="gap-2">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted">Image Analysis</span>
                </div>

                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted">
                    News Media Verification
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted">
                    Video Deepfake Detection
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ ABOUT / PRINCIPLES ═══ */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <span className="inline-block mb-5 text-xs font-medium px-3 py-1 rounded-full bg-background border border-border text-muted">
              Principles
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text tracking-tight leading-snug mb-14 max-w-2xl">
              VisionX is built on a simple idea:{" "}
              <span className="text-muted font-medium">
                verification should feel certain,
              </span>{" "}
              not black-box. We focus on making the truth about media
              provable.
            </h2>
          </ScrollReveal>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <Cpu className="w-4 h-4" />,
                title: "Enterprise-Grade AI",
                desc: "Powered by state-of-the-art deep learning models trained on millions of verified samples. Our AI continuously learns and adapts to new manipulation techniques as they emerge.",
              },
              {
                icon: <Eye className="w-4 h-4" />,
                title: "Explainable Results",
                desc: "Every decision comes with visual evidence maps, confidence scores, and detailed reasoning. No black box — understand exactly why each verdict was reached.",
              },
              {
                icon: <Lock className="w-4 h-4" />,
                title: "Secure Evidence Processing",
                desc: "Enterprise-grade encryption for data in transit and at rest. SOC 2 compliant infrastructure with role-based access controls and audit logging.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="bg-background border border-border rounded-2xl p-6"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 flex items-center justify-center text-primary mb-8">
                 
                  {item.icon}
                </div>
                <h3 className="text-base font-semibold text-text mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CORE CAPABILITIES ═══ */}
      <section className="py-16 lg:py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Capabilities"
            title="Everything a forensic review needs"
            subtitle="Comprehensive forensic analysis tools powered by advanced AI models to detect and verify digital media authenticity."
          />

          {/* Bento row — headline capabilities with mini previews */}
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[
              {
                icon: <Image className="w-5 h-5" />,
                title: "Image Forensics",
                desc: "Pixel-level analysis detecting manipulations, splices, and cloning artifacts.",
                preview: "bars" as const,
              },
              {
                icon: <Scan className="w-5 h-5" />,
                title: "Deepfake Detection",
                desc: "AI-powered detection of facial manipulations and synthetic media.",
                preview: "chat" as const,
              },
              {
                icon: <FileText className="w-5 h-5" />,
                title: "Metadata Analysis",
                desc: "Extract and verify EXIF, XMP, and IPTC data for provenance checks.",
                preview: "grid" as const,
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="bg-background border border-border rounded-2xl p-5 hover:border-primary/25 hover:shadow-md transition-all flex flex-col"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-text mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {feature.desc}
                </p>
                <div className="mt-auto">
                  <MockPreview variant={feature.preview} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Compact grid — remaining capabilities */}
          <div className="bg-background border border-border rounded-2xl divide-y divide-border overflow-hidden">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 divide-border sm:divide-x">
              {[
                {
                  icon: <Cpu className="w-4 h-4" />,
                  title: "AI Generated Image Detection",
                  desc: "Identify content from DALL-E, Midjourney, Stable Diffusion and more.",
                },
                {
                  icon: <FileCheck className="w-4 h-4" />,
                  title: "Document Verification",
                  desc: "Verify PDFs, scans, and digital signatures.",
                },
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  title: "OCR Analysis",
                  desc: "Extract and verify text content from images and documents.",
                },
                {
                  icon: <Search className="w-4 h-4" />,
                  title: "Reverse Image Search",
                  desc: "Cross-reference images to find original sources.",
                },
                {
                  icon: <Eye className="w-4 h-4" />,
                  title: "Explainable AI",
                  desc: "Visual evidence maps showing exactly what was detected.",
                },
                {
                  icon: <Download className="w-4 h-4" />,
                  title: "PDF Report Generation",
                  desc: "Court-admissible reports with detailed forensic findings.",
                },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="p-5 flex gap-3 hover:bg-surface transition-colors"
                >
                  <div className="w-8 h-8 flex-shrink-0 bg-primary-50 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-text mb-0.5">
                      {feature.title}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Process"
            title="Get started in 4 easy steps"
            subtitle="From evidence upload to professional verification report."
          />

          <div className="grid lg:grid-cols-2 gap-10 items-center">
            {/* Screenshot frame */}
            <ScrollReveal className="order-2 lg:order-1">
              <div className="relative rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 lg:p-8">
                <DashboardMockup />
              </div>
            </ScrollReveal>

            {/* Numbered steps */}
            <div className="order-1 lg:order-2 space-y-4">
              {[
                {
                  icon: <Upload className="w-4 h-4" />,
                  step: "01",
                  title: "Upload Evidence",
                  desc: "Securely upload images, videos, or documents through our encrypted web interface or API.",
                },
                {
                  icon: <Cpu className="w-4 h-4" />,
                  step: "02",
                  title: "AI Processing",
                  desc: "Our multi-model AI engine analyzes the evidence using 10+ forensic techniques simultaneously.",
                },
                {
                  icon: <Scan className="w-4 h-4" />,
                  step: "03",
                  title: "Digital Forensic Analysis",
                  desc: "Deep forensic analysis including ELA, metadata, compression artifacts, and GAN detection.",
                },
                {
                  icon: <FileText className="w-4 h-4" />,
                  step: "04",
                  title: "Professional Report",
                  desc: "Generate a detailed, court-admissible PDF report with evidence maps and confidence scores.",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.35 }}
                  className="flex items-start gap-4 bg-background border border-border rounded-2xl p-4 hover:border-primary/25 transition-colors"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-primary-50 rounded-xl flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-primary">
                        {item.step}
                      </span>
                      <h3 className="text-sm font-semibold text-text">
                        {item.title}
                      </h3>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ANALYSIS PREVIEW ═══ */}
      <section className="relative py-16 lg:py-20 overflow-hidden bg-surface">
        <GradientBlob className="w-96 h-96 top-0 right-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeading
            eyebrow="Live Demo"
            title="See it in action"
            subtitle="Watch the VisionX analysis pipeline run in real time."
          />

          <div className="max-w-lg mx-auto">
            <ScrollReveal>
              <AnalysisPreview />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ DASHBOARD SHOWCASE ═══ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Platform"
            title="Enterprise dashboard"
            subtitle="Comprehensive interface designed for professional investigators and forensic analysts."
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <BarChart3 className="w-4 h-4" />,
                title: "Dashboard",
                desc: "Real-time overview of analysis metrics, recent cases, and system status.",
              },
              {
                icon: <Scan className="w-4 h-4" />,
                title: "Analysis Screen",
                desc: "Detailed analysis view with side-by-side comparisons and forensic overlays.",
              },
              {
                icon: <Activity className="w-4 h-4" />,
                title: "Investigation History",
                desc: "Searchable history of all investigations with advanced filtering and export.",
              },
              {
                icon: <FileText className="w-4 h-4" />,
                title: "Reports",
                desc: "Comprehensive report management with templates, branding, and batch export.",
              },
              {
                icon: <User className="w-4 h-4" />,
                title: "User Profile",
                desc: "Role-based access controls with audit trails and team management.",
              },
              {
                icon: <Settings className="w-4 h-4" />,
                title: "Settings & API",
                desc: "Configure analysis parameters, webhooks, API keys, and integrations.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="bg-background border border-border rounded-2xl p-5 hover:border-primary/25 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary mb-3">
                  {item.icon}
                </div>
                <div className="h-20 bg-gradient-to-br from-surface to-primary-50/40 rounded-xl border border-border/50 mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <Layers className="w-5 h-5 text-muted-light mx-auto mb-1" />
                    <div className="text-xs text-muted-light">
                      {item.title} UI
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-text mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-muted leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            subtitle="Everything you need to know about VisionX and digital media verification."
          />

          <div className="space-y-2">
            {[
              {
                q: "How does VisionX protect my privacy and data?",
                a: "All uploaded media is encrypted at rest using AES-256 and in transit using TLS 1.3. We never share your data with third parties, and you can request immediate deletion at any time. Our infrastructure is SOC 2 compliant with regular security audits.",
              },
              {
                q: "How accurate is the AI analysis?",
                a: "VisionX achieves 99.7% detection accuracy across our benchmark datasets. Our AI models are trained on millions of verified samples and are continuously updated to detect new manipulation techniques.",
              },
              {
                q: "What file types are supported?",
                a: "We support JPEG, PNG, GIF, BMP, TIFF, WebP, HEIC, PDF, MP4, MOV, AVI, and more. Maximum file size is 500MB for enterprise plans.",
              },
              {
                q: "How long does analysis take?",
                a: "Most analyses complete within 3 seconds. Complex cases with multiple forensic techniques may take up to 10 seconds.",
              },
              {
                q: "Can I generate professional reports?",
                a: "Yes, VisionX generates comprehensive PDF reports suitable for court proceedings, journalistic publications, and enterprise compliance documentation.",
              },
              {
                q: "Is my data secure during analysis?",
                a: "All data is processed in isolated, encrypted environments with strict access controls and audit logging. Evidence is handled with chain-of-custody protocols.",
              },
            ].map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <FAQItem question={faq.q} answer={faq.a} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 lg:py-20 bg-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-50 via-background to-background px-6 py-14 sm:px-12 text-center">
              <GradientBlob className="w-80 h-80 -bottom-24 -right-24" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
                  Start verifying digital media{" "}
                  <span className="text-gradient">with confidence</span>
                </h2>
                <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
                  Experience enterprise-grade AI forensic analysis designed to
                  help professionals detect manipulated media and generate
                  trusted verification reports in seconds.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/analyze">
                    <Button size="lg" className="gap-2">
                      Start Free Analysis
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="secondary">
                      Contact Us
                    </Button>
                  </Link>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    Free tier available
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-success" />
                    14-day enterprise trial
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}