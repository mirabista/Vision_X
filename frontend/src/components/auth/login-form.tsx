"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { apiClient } from "@/lib/api-client";

interface LoginFormProps {
  onSuccess?: (user: any) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await apiClient.login(email, password);
      
      // Token is managed by AuthContext/apiClient - no localStorage needed
      onSuccess?.(result.user);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input type="checkbox" className="rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB]" />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-[#2563EB] hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#2563EB] hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}