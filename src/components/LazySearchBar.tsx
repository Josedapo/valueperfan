"use client";

import dynamic from "next/dynamic";

const SearchBar = dynamic(() => import("./SearchBar"), {
  ssr: false,
  loading: () => (
    <div className="w-full rounded-lg border border-border bg-surface px-4 py-3 pl-10 text-base sm:text-sm text-text-muted">
      &nbsp;
    </div>
  ),
});

export default function LazySearchBar() {
  return <SearchBar />;
}
