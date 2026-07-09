"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ScanSearch,
  FileCheck2,
  Brain,
  Activity,
  LockKeyhole,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Globe2,
  Building2,
  Users,
  ArrowRight,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-28 pb-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 left-10 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-10 top-24 h-80 w-80 animate-pulse rounded-full bg-primary-dark/25 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm text-muted">
              <ShieldCheck className="h-4 w-4 text-primary" />
              AI-powered digital trust platform
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
              Verifying digital content before it becomes a problem.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              VisionX helps people, organizations, and local governments analyze
              suspicious images, documents, and digital evidence with explainable
              AI-powered authenticity reports.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg">Start verifying</Button>
              </Link>

              <Link href="/features">
                <Button variant="secondary" size="lg">
                  Explore features
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <HeroStat label="Content checked" value="Images" />
            <HeroStat label="Output style" value="Explainable" />
            <HeroStat label="Result type" value="Trust Score" />
            <HeroStat label="Built for" value="Digital Safety" />
          </div>
        </div>
      </section>

      {/* White/Softer overview panel */}
      <section className="relative z-10 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-surface p-6 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTag>Why VisionX exists</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Digital content is easier to create, edit, and misuse than ever.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted">
                A single manipulated image, fake payment screenshot, forged
                notice, or AI-generated post can damage reputation, mislead
                citizens, waste public resources, or support fraud. VisionX was
                created to make digital verification faster, clearer, and more
                accessible.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <MiniCard
                icon={<AlertTriangle className="h-5 w-5" />}
                title="Misinformation"
                text="Flag suspicious visuals before they spread further."
              />
              <MiniCard
                icon={<FileCheck2 className="h-5 w-5" />}
                title="Fake Proof"
                text="Review screenshots, documents, and submitted evidence."
              />
              <MiniCard
                icon={<Brain className="h-5 w-5" />}
                title="AI Content"
                text="Estimate whether content may be AI-generated."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionTag>Our mission</SectionTag>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Build a trust layer for the digital world.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted">
              VisionX is not just a fake image detector. It is a digital trust
              system designed to support evidence verification, public safety,
              citizen services, journalism, governance, and fraud prevention.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <LargeCard
              icon={<ScanSearch className="h-6 w-6" />}
              title="Authenticity analysis"
              text="We analyze uploaded content for signs of AI generation, manipulation, visual inconsistency, and suspicious evidence patterns."
            />

            <LargeCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Trust scoring"
              text="Instead of only saying real or fake, VisionX provides a confidence-based trust score that supports better decision-making."
            />

            <LargeCard
              icon={<Brain className="h-6 w-6" />}
              title="Explainable results"
              text="Every result is designed to show why the system reached a conclusion, helping users understand the evidence."
            />

            <LargeCard
              icon={<LockKeyhole className="h-6 w-6" />}
              title="Privacy-first workflow"
              text="The system is built for serious digital evidence use cases where security, user ownership, and data privacy matter."
            />
          </div>
        </div>
      </section>

      {/* Dark capability section */}
      <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-surface" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-primary-dark/20 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <SectionTag>What we actually provide</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                More than an AI detector.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-muted">
                VisionX combines multiple signals into one verification
                experience. It helps users move from confusion to a clear next
                step: trust, review, escalate, or reject.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Capability text="AI-generated image detection" />
              <Capability text="Manipulation and edit-risk analysis" />
              <Capability text="Confidence-based authenticity scoring" />
              <Capability text="Explainable evidence summaries" />
              <Capability text="Report and history management" />
              <Capability text="API-ready digital trust engine" />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <SectionTag>How it works</SectionTag>

            <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              From suspicious content to explainable decision.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted">
              The workflow is simple enough for citizens and powerful enough for
              teams that need reliable digital evidence review.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-4">
            <WorkflowStep
              number="01"
              title="Upload"
              text="Submit an image, screenshot, or digital evidence file for analysis."
            />

            <WorkflowStep
              number="02"
              title="Analyze"
              text="VisionX checks authenticity signals, manipulation risk, and AI-generation traces."
            />

            <WorkflowStep
              number="03"
              title="Score"
              text="The system produces a trust score with confidence and risk classification."
            />

            <WorkflowStep
              number="04"
              title="Act"
              text="Users decide whether to trust, review, report, or reject the content."
            />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-surface p-6 sm:p-10 lg:p-14">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionTag>Who it helps</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Designed for real-world digital trust problems.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted">
                The same authenticity engine can support different sectors
                without changing the core technology.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <UseCase
                icon={<Building2 className="h-5 w-5" />}
                title="Local government"
                text="Verify viral civic content, fake notices, public complaints, and submitted evidence."
              />

              <UseCase
                icon={<Users className="h-5 w-5" />}
                title="Citizens"
                text="Check suspicious posts, screenshots, and forwarded media before sharing."
              />

              <UseCase
                icon={<Globe2 className="h-5 w-5" />}
                title="Media and fact-checkers"
                text="Support newsroom verification with structured authenticity reports."
              />

              <UseCase
                icon={<FileCheck2 className="h-5 w-5" />}
                title="Organizations"
                text="Review payment proof, documents, claims, and digital records before approval."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionTag>Our principles</SectionTag>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-text sm:text-4xl">
                Built around clarity, not blind automation.
              </h2>

              <p className="mt-5 text-base leading-7 text-muted">
                We believe AI should help people make better decisions, not
                replace human judgment in sensitive verification cases.
              </p>
            </div>

            <div className="grid gap-4">
              <Principle
                title="Evidence before conclusion"
                text="VisionX focuses on showing supporting signals instead of giving unexplained labels."
              />

              <Principle
                title="Decision support, not final judgment"
                text="The platform helps users identify risk and take the right next step."
              />

              <Principle
                title="Privacy and ownership"
                text="User data, uploaded files, reports, and histories should remain protected and user-scoped."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-border bg-surface p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Activity className="h-7 w-7" />
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-text sm:text-4xl">
            Ready to verify digital evidence?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted">
            Start using VisionX to analyze suspicious content, generate trust
            scores, and make safer decisions in a world of manipulated media.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="secondary" size="lg">
                Contact Us
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
    <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-primary">
      {children}
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-5 text-center">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-xl font-bold text-text">{value}</p>
    </div>
  );
}

function MiniCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function LargeCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function Capability({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-4">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-4 w-4" />
      </div>

      <p className="text-sm font-medium text-text">{text}</p>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </div>

      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function UseCase({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <h3 className="text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function Principle({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}