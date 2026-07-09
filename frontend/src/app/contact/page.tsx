"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    company: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const validateForm = () => {
    const nextErrors = {
      name: formData.name.trim() ? "" : "Name is required",
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ? ""
        : "Enter a valid email address",
      subject: formData.subject.trim() ? "" : "Subject is required",
      message: formData.message.trim() ? "" : "Message is required",
    };

    setFieldErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setSuccess(true);
      setFieldErrors({ name: "", email: "", subject: "", message: "" });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        company: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left Side */}
          <section className="relative hidden min-h-[620px] overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-dark p-8 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0">
              <div className="absolute -left-12 top-10 h-44 w-44 animate-pulse rounded-full bg-white/10 blur-2xl" />
              <div className="absolute bottom-10 right-4 h-40 w-40 animate-pulse rounded-full bg-primary/25 blur-2xl" />
              <div className="absolute left-1/3 top-1/2 h-28 w-28 animate-pulse rounded-full bg-white/10 blur-xl" />
              <div className="absolute right-1/4 top-20 h-20 w-20 rounded-full bg-primary/20 blur-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.22),transparent_45%)]" />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="relative z-10">
              <div className="mb-10 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/85">
                VisionX support
              </div>

              <h1 className="max-w-sm text-4xl font-semibold leading-tight tracking-tight">
                Let&apos;s build digital trust together
              </h1>

              <p className="mt-4 max-w-sm text-sm leading-6 text-white/80">
                Have questions, feedback, or collaboration ideas? Reach out to
                the VisionX team and we&apos;ll review your message as soon as
                possible.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3">
              <InfoBox active number="1" text="Send your message" />
              <InfoBox number="2" text="Team reviews it" />
              <InfoBox number="3" text="We follow up soon" />
            </div>
          </section>

          {/* Right Side */}
          <section className="flex min-h-[620px] items-center justify-center px-5 py-8 sm:px-8 lg:px-10">
            <div className="w-full max-w-md">
              <div className="mb-7 text-center">
                <h1 className="text-2xl font-bold text-text">
                  Contact VisionX
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted">
                  Send us a message about verification, reports, platform
                  support, or partnership ideas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="error" title="Error">
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" title="Message Sent">
                    Message saved locally for now. Backend integration will be
                    added later.
                  </Alert>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    error={fieldErrors.name}
                    placeholder="John Doe"
                    required
                    disabled={loading}
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    error={fieldErrors.email}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>

                <Input
                  label="Subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  error={fieldErrors.subject}
                  placeholder="How can we help?"
                  required
                  disabled={loading}
                />

                {/* Honeypot field */}
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className="hidden"
                  aria-hidden="true"
                />

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                    Message
                  </label>

                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    required
                    disabled={loading}
                    className={`input min-h-36 resize-none ${
                      fieldErrors.message
                        ? "border-danger focus:border-danger focus:ring-danger/20"
                        : ""
                    }`}
                  />

                  {fieldErrors.message && (
                    <p className="mt-1.5 text-xs text-danger">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoBox({
  number,
  text,
  active = false,
}: {
  number: string;
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`min-h-[86px] rounded-xl border p-3 ${
        active
          ? "border-white bg-white text-primary-dark"
          : "border-white/20 bg-black/20 text-white"
      }`}
    >
      <div
        className={`mb-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
          active ? "bg-primary text-white" : "bg-white/20 text-white"
        }`}
      >
        {number}
      </div>

      <p
        className={`text-xs leading-5 ${
          active ? "text-primary-dark" : "text-white/85"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
