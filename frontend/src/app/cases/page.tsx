"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { Plus, FolderOpen } from "lucide-react";

export default function CasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    // Placeholder: in production, GET /api/cases
    setCases([]);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text">Cases</h1>
            <p className="mt-2 text-sm text-muted">Manage investigation cases</p>
          </div>
          <Button><Plus className="w-4 h-4 mr-2" /> New Case</Button>
        </div>
        {loading ? (
          <div className="text-center py-12 text-muted">Loading cases...</div>
        ) : cases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-muted mx-auto mb-4" />
              <p className="text-text font-medium">No cases yet</p>
              <p className="text-sm text-muted mt-2">Create a case to start organizing investigations.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c) => (
              <Card key={c.id}><CardContent className="p-6"><p className="font-medium text-text">{c.title}</p><p className="text-sm text-muted mt-2">{c.description}</p></CardContent></Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}