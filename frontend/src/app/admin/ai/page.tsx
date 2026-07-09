"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingCard } from "@/components/ui/loading";
import { apiClient } from "@/lib/api-client";
import { Cpu, HardDrive, Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function AdminAIPage() {
  const [models, setModels] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [modelsData, healthData, metricsData] = await Promise.all([
        apiClient.getAIModels(),
        apiClient.getAIRuntimeHealth(),
        apiClient.getAIRuntimeMetrics(),
      ]);
      setModels(modelsData.models || []);
      setHealth(healthData.health || []);
      setMetrics(metricsData.instances || []);
    } catch (e) {
      console.error("Failed to load AI runtime data", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <LoadingCard key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">AI Runtime</h1>
          <p className="mt-2 text-sm text-muted">Monitor models, health, and performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Cpu className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted">Registered Models</p>
                  <p className="text-2xl font-bold text-text">{models.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted">Loaded Instances</p>
                  <p className="text-2xl font-bold text-text">{metrics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <HardDrive className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted">Health Entries</p>
                  <p className="text-2xl font-bold text-text">{health.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Registered Models */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registered Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted font-medium">Model</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Version</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Category</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Framework</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">Device</th>
                  </tr>
                </thead>
                <tbody>
                  {models.map((m, i) => (
                    <tr key={i} className="border-b border-border hover:bg-surface">
                      <td className="py-3 px-4 text-text font-medium">{m.name}</td>
                      <td className="py-3 px-4 text-muted">{m.version}</td>
                      <td className="py-3 px-4"><Badge>{m.category}</Badge></td>
                      <td className="py-3 px-4 text-muted">{m.framework}</td>
                      <td className="py-3 px-4"><Badge variant={m.device === "cuda" ? "success" : "default"}>{m.device}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Health */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Model Health</CardTitle>
          </CardHeader>
          <CardContent>
            {health.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No health data yet</p>
            ) : (
              <div className="space-y-4">
                {health.map((h, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      {h.status === "healthy" ? <CheckCircle2 className="w-5 h-5 text-success" /> : <AlertTriangle className="w-5 h-5 text-warning" />}
                      <div>
                        <p className="text-sm font-medium text-text">{h.model_id}</p>
                        <p className="text-xs text-muted">{h.device} | v{h.version}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted">
                      <p>Load: {h.load_time_ms?.toFixed(0)}ms</p>
                      <p>Last: {h.last_inference_ms?.toFixed(0)}ms</p>
                      <p>Failures: {h.failures || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loaded Instances */}
        <Card>
          <CardHeader>
            <CardTitle>Loaded Instances</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <p className="text-sm text-muted text-center py-4">No instances loaded</p>
            ) : (
              <div className="space-y-4">
                {metrics.map((m, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-text">{m.model_id}</p>
                      <p className="text-xs text-muted">v{m.version} | {m.device}</p>
                    </div>
                    <div className="text-right text-xs text-muted">
                      <p>Refs: {m.ref_count}</p>
                      <p>Loaded: {m.loaded_at?.slice(0, 19)?.replace("T", " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}