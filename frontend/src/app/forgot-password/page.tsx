"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      await apiClient.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-screen px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-text mb-2">Reset password</h1>
              <p className="text-muted">Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error" title="Error">{error}</Alert>}
              {success && (
                <Alert variant="success" title="Check your email">
                  We've sent a password reset link to your email address.
                </Alert>
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Send Reset Link
              </Button>

              <div className="text-center text-sm text-muted">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}