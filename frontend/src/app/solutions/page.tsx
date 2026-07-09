"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useAnimation } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper, Siren, Microscope, GraduationCap, Building2,
  Shield, Landmark, Users, ArrowRight, CheckCircle
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

const solutions = [
  {
    icon: <Newspaper className="w-6 h-6" />,
    title: "Journalists",
    description: "Verify user-generated content, social media images, and breaking news footage before publication.",
    useCases: ["Breaking news verification", "Social media content validation", "Source authentication", "Rapid fact-checking"],
  },
  {
    icon: <Siren className="w-6 h-6" />,
    title: "Law Enforcement",
    description: "Forensic-grade analysis for evidence verification, criminal investigations, and court proceedings.",
    useCases: ["Evidence authentication", "Digital forensics", "Court-admissible reports", "Chain of custody"],
  },
  {
    icon: <Microscope className="w-6 h-6" />,
    title: "Researchers",
    description: "Academic-grade tools for media analysis, dataset verification, and research publication support.",
    useCases: ["Dataset verification", "Academic research", "Peer review support", "Methodology validation"],
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Universities",
    description: "Educational tools for teaching digital forensics and supporting student research projects.",
    useCases: ["Digital forensics education", "Student research projects", "Academic integrity", "Workshop training"],
  },
  {
    icon: <Building2 className="w-6 h-6" />,
    title: "Media Organizations",
    description: "Enterprise-scale verification for newsrooms, broadcasters, and content platforms.",
    useCases: ["Newsroom integration", "Content moderation", "Brand protection", "Editorial workflows"],
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Cybersecurity Teams",
    description: "Advanced threat detection for identifying manipulated media in security incidents.",
    useCases: ["Threat intelligence", "Incident response", "Security analysis", "Attribution support"],
  },
  {
    icon: <Landmark className="w-6 h-6" />,
    title: "Government Agencies",
    description: "Secure, compliant verification for public sector digital media and communications.",
    useCases: ["Public communications", "Security verification", "Compliance reporting", "Secure analysis"],
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Enterprises",
    description: "Scalable verification platform for corporate security, compliance, and brand protection.",
    useCases: ["Brand protection", "Compliance monitoring", "Internal investigations", "Risk management"],
  },
];

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <Badge variant="info" className="mb-4 px-3 py-1">Solutions</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold text-text tracking-tight mb-4">
              Built for Every Professional
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
              From journalists to law enforcement, researchers to enterprises — VisionX provides
              tailored digital media verification solutions for every use case.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutions.map((solution, i) => (
              <ScrollReveal key={solution.title} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-background border border-border rounded-lg p-6 hover:border-primary/20 hover:shadow-sm transition-all h-full"
                >
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary mb-4">
                    {solution.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-text mb-2">{solution.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-4">{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.useCases.map((useCase) => (
                      <li key={useCase} className="flex items-start gap-2 text-xs text-muted">
                        <CheckCircle className="w-3.5 h-3.5 text-success mt-0.5 flex-shrink-0" />
                        {useCase}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-surface border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto mb-8 leading-relaxed">
              Join thousands of professionals who trust VisionX for digital media verification.
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
                  Contact Sales
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