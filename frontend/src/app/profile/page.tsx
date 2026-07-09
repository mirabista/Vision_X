"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { User, Mail, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted">Please log in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const result = await apiClient.getCurrentUser();
      const userData = result.user;
      
      if (userData) {
        setProfile({
          full_name: userData.user_metadata?.full_name || "",
          username: userData.email?.split("@")[0] || "",
          bio: "",
          avatar_url: userData.user_metadata?.avatar_url || "",
        });
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      await apiClient.updateProfile({
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      });
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="skeleton h-8 w-48 rounded mb-8" />
          <div className="card p-6">
            <div className="skeleton h-64 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-1">Profile Settings</h1>
          <p className="text-sm text-muted">Manage your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <Alert variant="error" title="Error">{error}</Alert>}
              {success && <Alert variant="success" title="Success">{success}</Alert>}

              <div className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium text-text">{profile.full_name || "User"}</p>
                  <p className="text-sm text-muted flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <Input
                label="Full Name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="John Doe"
              />

              <Input
                label="Username"
                value={profile.username}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                placeholder="johndoe"
              />

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  className="input"
                />
              </div>

              <Input
                label="Avatar URL"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />

              <Button type="submit" className="w-full" loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}