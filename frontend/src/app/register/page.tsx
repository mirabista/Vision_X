"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth, AuthResult } from "@/lib/auth-context";

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { user, loading, signUp } = useAuth();
  const router = useRouter();

  const passwordRequirements = useMemo(() => {
    return {
      minLength: formData.password.length >= 8,
      hasUppercase: /[A-Z]/.test(formData.password),
      hasLowercase: /[a-z]/.test(formData.password),
      hasNumber: /\d/.test(formData.password),
    };
  }, [formData.password]);

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const validate = (): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.full_name.trim()) {
      errors.full_name = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const errors = validate();
  const isFormValid =
    formData.full_name.trim().length >= 2 &&
    !errors.email &&
    isPasswordValid &&
    formData.password === formData.confirmPassword;

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
      const result: AuthResult = await signUp(formData.email, formData.password, formData.full_name);
      
      if (!result.success) {
        setError(result.error || "We couldn't create your account. Please try again.");
        setIsSubmitting(false);
        return;
      }
      // Success: onAuthStateChange will update app state
    } catch (err: any) {
      setError("We couldn't create your account. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text mb-2">Create account</h1>
              <p className="text-sm text-muted">Start your journey with VisionX</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && typeof error === 'string' && (
                <Alert variant="error" title="Error">
                  {error}
                </Alert>
              )}

              <Input
                label="Full Name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                onBlur={() => setTouched(prev => ({ ...prev, full_name: true }))}
                placeholder="John Doe"
                required
                disabled={isSubmitting}
                error={touched.full_name ? errors.full_name : undefined}
              />

              <Input
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                error={touched.email ? errors.email : undefined}
              />

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                    placeholder="••••••••"
                    required
                    disabled={isSubmitting}
                    error={touched.password ? errors.password : undefined}
                  />
                </div>
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <PasswordRequirement met={passwordRequirements.minLength} text="8+ characters" />
                    <PasswordRequirement met={passwordRequirements.hasUppercase} text="One uppercase letter" />
                    <PasswordRequirement met={passwordRequirements.hasLowercase} text="One lowercase letter" />
                    <PasswordRequirement met={passwordRequirements.hasNumber} text="One number" />
                  </div>
                )}
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  placeholder="••••••••"
                  required
                  disabled={isSubmitting}
                  error={touched.confirmPassword ? errors.confirmPassword : undefined}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={isSubmitting}
                disabled={!isFormValid || isSubmitting}
              >
                Create Account
              </Button>

              <div className="text-center text-sm text-muted">
                Already have an account?{" "}
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

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? "text-success" : "text-muted"}`}>
      <div className={`w-3.5 h-3.5 rounded-full border-1.5 flex items-center justify-center flex-shrink-0 ${met ? "border-success bg-success/20" : "border-border"}`}>
        {met && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
      </div>
      <span>{text}</span>
    </div>
  );
}