"use client";

import { Suspense, useState, FormEvent } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const apiKey = searchParams.get("key");
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);

  if (!apiKey) {
    const handleSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!key.trim()) return;
      setError(false);
      router.replace(`${pathname}?key=${encodeURIComponent(key.trim())}`);
    };

    return (
      <div className="min-h-screen flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-text mb-6 text-center">
            Product Analytics
          </h1>
          {error && (
            <p className="text-error text-sm mb-3 text-center">
              Invalid key
            </p>
          )}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Access key"
            className="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            className="w-full mt-3 px-4 py-2 bg-primary text-primary-contrast rounded-lg font-medium hover:bg-primary-dark transition-colors"
          >
            Enter
          </button>
        </form>
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
