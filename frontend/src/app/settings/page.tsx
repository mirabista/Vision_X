"use client";

import React from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { Shield, Bell, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to view settings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-1">Settings</h1>
          <p className="text-sm text-muted">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                  <p className="text-text">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">User ID</label>
                  <p className="text-text font-mono text-sm">{user?.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Account Created</label>
                  <p className="text-text">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Notification settings coming soon.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Theme customization coming soon.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Language settings coming soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}