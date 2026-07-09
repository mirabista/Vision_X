"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { Upload, FileText } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-1">History</h1>
          <p className="text-sm text-muted">
            View your analysis history and reports
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/history/uploads">
            <div className="card p-8 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Upload History</h3>
              <p className="text-sm text-muted mb-4">
                View and manage your uploaded files and analysis history
              </p>
              <Button variant="secondary" className="w-full">View Uploads</Button>
            </div>
          </Link>

          <Link href="/history/reports">
            <div className="card p-8 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-text mb-2">Report History</h3>
              <p className="text-sm text-muted mb-4">
                View and download your generated forensic reports
              </p>
              <Button variant="secondary" className="w-full">View Reports</Button>
            </div>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}