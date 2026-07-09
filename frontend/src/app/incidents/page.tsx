"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api-client";
import { Shield, Plus, AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface Incident {
  id: string;
  case_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

export default function IncidentsPage() {
  const { user, signOut } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadIncidents();
    }
  }, [user]);

  const loadIncidents = async () => {
    try {
      // Fetch from backend API
      const data = await apiClient.getIncidents({ limit: 100 });
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error("Failed to load incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (incidentId: string) => {
    if (!confirm("Are you sure you want to delete this incident?")) return;

    try {
      await apiClient.deleteIncident(incidentId);
      setIncidents(incidents.filter(i => i.id !== incidentId));
    } catch (error) {
      console.error("Failed to delete incident:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <Clock className="w-4 h-4" />;
      case "in_progress": return <AlertTriangle className="w-4 h-4" />;
      case "resolved": return <CheckCircle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "danger";
      case "high": return "warning";
      case "medium": return "info";
      default: return "default";
    }
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="skeleton h-6 w-3/4 rounded mb-4" />
                <div className="skeleton h-4 w-full rounded mb-2" />
                <div className="skeleton h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Incidents</h1>
            <p className="mt-2 text-sm text-muted">
              Manage your investigation cases
            </p>
          </div>
          <Link href="/incidents/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Incident
            </Button>
          </Link>
        </div>

        {/* Incidents List */}
        {incidents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Shield className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">No incidents yet</h3>
              <p className="text-sm text-muted mb-4">Security incidents will appear here when detected.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {incidents.map((incident) => (
              <Card key={incident.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(incident.status)}
                        <h3 className="font-semibold text-text">{incident.title}</h3>
                      </div>
                      <p className="text-sm text-muted mb-3">{incident.description}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant={getPriorityColor(incident.priority) as any}>
                          {incident.priority}
                        </Badge>
                        <span className="text-xs text-muted">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Link href={`/incidents/${incident.id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(incident.id)}
                        className="text-danger hover:text-danger"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}