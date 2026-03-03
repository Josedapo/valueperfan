"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import type { SearchEntry } from "../lib/types";
import AccountAvatar from "./AccountAvatar";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [showSuggest, setShowSuggest] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load search index on mount
  useEffect(() => {
    fetch("/api/search-index")
      .then((res) => res.json())
      .then((data: SearchEntry[]) => {
        const fuseInstance = new Fuse(data, {
          keys: ["name", "handle"],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 2,
        });
        setFuse(fuseInstance);
      });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (!fuse || value.length < 2) {
        setResults([]);
        setIsOpen(false);
        setShowSuggest(false);
        return;
      }

      const searchResults = fuse.search(value, { limit: 8 });
      const items = searchResults.map((r) => r.item);
      setResults(items);
      setIsOpen(true);
      setShowSuggest(items.length === 0 && value.length >= 3);
    },
    [fuse]
  );

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0 || showSuggest) setIsOpen(true);
          }}
          placeholder="Search by name or @handle..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-10 text-sm placeholder-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-surface shadow-lg">
          {results.length > 0 ? (
            <ul>
              {results.map((entry) => (
                <li key={`${entry.platform}-${entry.handle}`}>
                  <Link
                    href={`/account/${entry.platform}/${entry.slug}`}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-alt transition-colors"
                  >
                    <AccountAvatar
                      src={entry.avatarUrl}
                      name={entry.name}
                      size={32}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {entry.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        @{entry.handle}
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-text-muted bg-surface-alt rounded px-1.5 py-0.5 uppercase">
                      {entry.platform === "instagram" ? "IG" : "TK"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : showSuggest ? (
            <SuggestForm
              query={query}
              onClose={() => {
                setIsOpen(false);
                setShowSuggest(false);
              }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SuggestForm({
  query,
  onClose,
}: {
  query: string;
  onClose: () => void;
}) {
  const [platform, setPlatform] = useState<"instagram" | "tiktok">("instagram");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: query, platform, email }),
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm font-medium text-primary">Thank you!</p>
        <p className="mt-1 text-xs text-text-secondary">
          We&apos;ll notify you when this account is available.
        </p>
        <button
          onClick={onClose}
          className="mt-2 text-xs text-text-muted hover:text-text"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <p className="text-sm font-medium text-text">
        Can&apos;t find this account?
      </p>
      <p className="mt-1 text-xs text-text-secondary">
        Suggest it and we&apos;ll add it to our database.
      </p>
      <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            readOnly
            className="flex-1 rounded border border-border bg-surface-alt px-3 py-1.5 text-sm"
          />
          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as "instagram" | "tiktok")
            }
            className="rounded border border-border bg-surface px-2 py-1.5 text-sm"
          >
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email (optional)"
          className="rounded border border-border px-3 py-1.5 text-sm placeholder-text-muted"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Suggest Account
        </button>
      </form>
    </div>
  );
}
