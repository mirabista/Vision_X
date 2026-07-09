"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ScanSearch,
  Brain,
  BarChart3,
  FileCheck2,
  SearchCheck,
  Activity,
  LayoutDashboard,
  LockKeyhole,
  BellRing,
  ArrowRight,
  CheckCircle2,
  Workflow,
  FileText,
  BadgeAlert,
  Globe2,
  Building2,
  Users,
  Sparkles,
  Eye,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 top-16 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-primary-dark/20 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
              <Sparkles className="h-4 w-4 text-primary" />
              VisionX platform capabilities
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl lg:text-7xl">
              Trust digital
              <span className="block text-primary">evidence faster.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-base leading-7 text-muted sm:text-lg">
              VisionX combines AI-powered analysis, explainable scoring, and
              evidence-focused workflows to help users detect suspicious
              content, verify authenticity, and make confident decisions.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Link href="/about">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Showcase Row */}
          <div className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-border bg-surface p-6 sm:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-[0.18em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Core platform
              </div>

              <h2 className="max-w-xl text-3xl font-bold tracking-tight text-text sm:text-5xl">
                Designed for clarity, not just detection.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                VisionX is more than a simple AI detector. It is a digital trust
                platform that analyzes evidence, generates trust scores,
                provides explainable outputs, and supports better decisions
                across public safety, citizen services, governance, and fraud
                prevention.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/analyze">
                  <Button>Start Analysis</Button>
                </Link>
                <Link href="/contact">
                  <Button variant="secondary">Talk to Us</Button>
                </Link>
              </div>

              <div className="mt-8 rounded-2xl border border-border bg-background p-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BadgeAlert className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-text">
                      Built for high-trust environments
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Useful where fake screenshots, manipulated images, or
                      suspicious digital submissions can create real-world harm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-border bg-surface p-4 sm:p-6">
              <div className="grid h-full gap-4">
                <div className="rounded-2xl border border-border bg-background p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-muted">
                      Average output style
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      Explainable
                    </span>
                  </div>

                  <div className="text-4xl font-bold text-text">Trust Score</div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Each analysis is translated into a confidence-based trust
                    score with evidence-backed reasoning.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    value="AI"
                    label="Generated content detection"
                  />
                  <MetricCard
                    value="Edit"
                    label="Manipulation and tampering signals"
                  />
                  <MetricCard
                    value="PDF"
                    label="Report and evidence workflow"
                  />
                  <MetricCard
                    value="API"
                    label="Platform-ready integration"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo / trust strip */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-y border-border py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-semibold text-muted">
            <span>Smart Governance</span>
            <span>Public Safety</span>
            <span>Digital Forensics</span>
            <span>Fraud Prevention</span>
            <span>Citizen Services</span>
            <span>Media Verification</span>
          </div>
        </div>
      </section>

      {/* Main features intro */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <SectionTag>Platform features</SectionTag>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-5xl">
              Feature-rich, decision-focused, and built for trust.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted">
              VisionX brings together multiple verification capabilities into a
              single workflow so users can upload, analyze, interpret, and act
              with more confidence.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FeatureCard
              icon={<ScanSearch className="h-5 w-5" />}
              title="Authenticity Analysis"
              text="Analyze content for forensic inconsistencies, suspicious patterns, and authenticity signals."
            />
            <FeatureCard
              icon={<Brain className="h-5 w-5" />}
              title="AI-Generated Detection"
              text="Estimate whether submitted content may be created or heavily influenced by generative AI."
            />
            <FeatureCard
              icon={<SearchCheck className="h-5 w-5" />}
              title="Manipulation Detection"
              text="Identify possible signs of editing, tampering, or misleading visual modification."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Trust Scoring"
              text="Receive a confidence-based trust score that supports review and decision-making."
            />
            <FeatureCard
              icon={<FileCheck2 className="h-5 w-5" />}
              title="Explainable Output"
              text="See more than a simple label with findings, confidence, and contextual evidence."
            />
            <FeatureCard
              icon={<LayoutDashboard className="h-5 w-5" />}
              title="Dashboard & Monitoring"
              text="Track analyses, risk levels, reports, and suspicious incidents from one workspace."
            />
            <FeatureCard
              icon={<FileText className="h-5 w-5" />}
              title="Reports & History"
              text="Access generated reports and maintain a usable audit trail of submitted analyses."
            />
            <FeatureCard
              icon={<Workflow className="h-5 w-5" />}
              title="API Integration"
              text="Deploy VisionX as an API or embed the trust engine into broader digital systems."
            />
          </div>
        </div>
      </section>

      {/* Feature architecture / philosophy */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-surface p-6 sm:p-10 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <SectionTag>Why it works</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-5xl">
                Strategically built
                <span className="block text-primary">for digital trust.</span>
              </h2>

              <p className="mt-5 text-base leading-7 text-muted">
                VisionX is built around a simple principle: digital verification
                should be understandable. That means technical analysis needs to
                be translated into something useful for real people and real
                decisions.
              </p>

              <div className="mt-8 space-y-4">
                <CheckLine text="Evidence-first output rather than blind labeling" />
                <CheckLine text="Clear confidence and trust indicators" />
                <CheckLine text="Decision support for review, escalation, or rejection" />
                <CheckLine text="Useful for both end users and institutions" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <SoftCard
                title="Digital Audits"
                icon={<Eye className="h-10 w-10" />}
                text="Surface suspicious patterns and weak points in digital submissions."
              />
              <SoftCard
                title="Decision Systems"
                icon={<Workflow className="h-10 w-10" />}
                text="Turn content analysis into practical next actions for teams and users."
              />
              <SoftCard
                title="Risk Visibility"
                icon={<BarChart3 className="h-10 w-10" />}
                text="Translate complex findings into a clear trust and risk overview."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Detailed modules */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionTag>Modules</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-5xl">
                Growth-focused digital trust modules.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted">
                VisionX organizes its capabilities into practical modules so the
                product can serve both individual analysis workflows and
                larger-scale institutional use cases.
              </p>
            </div>

            <div className="grid gap-4">
              <FeatureRow
                index="01"
                title="Image Verification"
                subtitle="Authenticity, manipulation, and AI-generation checks"
              />
              <FeatureRow
                index="02"
                title="Evidence Scoring"
                subtitle="Confidence-based trust score with explainable findings"
              />
              <FeatureRow
                index="03"
                title="Reports & History"
                subtitle="Structured review flow, records, and analysis archive"
              />
              <FeatureRow
                index="04"
                title="Incident Awareness"
                subtitle="Highlight high-risk or suspicious cases for attention"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use-case features */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-surface" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary-dark/15 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <SectionTag>Where features create impact</SectionTag>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-5xl">
              One platform, multiple real-world applications.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted">
              The same feature set can support different workflows depending on
              who is using the platform and what kind of trust problem they are
              trying to solve.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UseCaseCard
              icon={<Building2 className="h-5 w-5" />}
              title="Local Government"
              text="Verify suspicious civic content, complaints, notices, and local digital evidence."
            />
            <UseCaseCard
              icon={<Users className="h-5 w-5" />}
              title="Citizens"
              text="Check suspicious images or screenshots before trusting or sharing them."
            />
            <UseCaseCard
              icon={<Globe2 className="h-5 w-5" />}
              title="Media & Fact Checking"
              text="Strengthen verification workflows with explainable authenticity signals."
            />
            <UseCaseCard
              icon={<LockKeyhole className="h-5 w-5" />}
              title="Fraud Prevention"
              text="Reduce risk from fake proof, edited claims, and suspicious submissions."
            />
          </div>
        </div>
      </section>

      {/* Additional capabilities / roadmap style */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <RoadmapCard
              icon={<Activity className="h-5 w-5" />}
              title="What you can do now"
              items={[
                "Upload images for analysis",
                "Generate trust-oriented results",
                "Review analysis history and reports",
                "Monitor suspicious cases in the workspace",
              ]}
            />
            <RoadmapCard
              icon={<BellRing className="h-5 w-5" />}
              title="Operational strengths"
              items={[
                "Clear UX for analysts and users",
                "API-ready platform architecture",
                "Explainable analysis outcomes",
                "Supports digital evidence workflows",
              ]}
            />
            <RoadmapCard
              icon={<FileCheck2 className="h-5 w-5" />}
              title="Expanding direction"
              items={[
                "Document originality verification",
                "Broader source verification workflows",
                "Stronger public-sector integrations",
                "Larger-scale digital trust use cases",
              ]}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-border bg-surface p-8 text-center sm:p-12">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Ready to explore VisionX features in action?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
            Start analyzing suspicious content, reviewing trust scores, and
            building safer digital workflows with VisionX.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/analyze">
              <Button variant="secondary" size="lg">
                Try Analysis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary">
      {children}
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="text-2xl font-bold text-text">{value}</div>
      <p className="mt-2 text-sm leading-6 text-muted">{label}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 transition-transform duration-200 hover:-translate-y-1">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function CheckLine({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-4 w-4" />
      </div>
      <p className="text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function SoftCard({
  title,
  icon,
  text,
}: {
  title: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-5 text-primary/35">{icon}</div>
      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function FeatureRow({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid items-center gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-[90px_1fr]">
      <div className="text-sm font-medium text-muted">{index}</div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xl font-semibold text-text">{title}</h3>
        <p className="text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function UseCaseCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function RoadmapCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-text">{title}</h3>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
            <p className="text-sm leading-6 text-muted">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}