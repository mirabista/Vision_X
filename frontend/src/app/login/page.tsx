"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth, AuthResult } from "@/lib/auth-context";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result: AuthResult = await signIn(email, password);
      if (!result.success) {
        setError(result.error || "Login failed");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.message || "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text mb-2">Welcome back</h1>
              <p className="text-sm text-muted">Sign in to your VisionX account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error" title="Error">{error}</Alert>}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button type="submit" className="w-full" loading={isSubmitting}>
                Sign In
              </Button>

              <div className="text-center text-sm">
                <Link href="/forgot-password" className="text-primary hover:text-primary-dark">
                  Forgot password?
                </Link>
              </div>

              <div className="text-center text-sm text-muted">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary-dark font-medium">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}