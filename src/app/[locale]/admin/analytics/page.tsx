"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const apiKey = searchParams.get("key");

  if (!apiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-secondary text-lg">Access denied</p>
      </div>
    );
  }

  return <AnalyticsDashboard apiKey={apiKey} />;
}

export default function AnalyticsPage() {
  return (
    <Suspense>
      <AnalyticsContent />
    </Suspense>
  );
}
