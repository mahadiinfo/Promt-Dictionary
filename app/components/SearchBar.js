"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ value, onChange, placeholder = "Search prompts, tags, #numbers…", size = "md" }) {
  const large = size === "lg";
  return (
    <div className="relative w-full">
      <Search
        className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] ${
          large ? "h-5 w-5" : "h-4 w-4"
        }`}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] pr-10 pl-11 text-[var(--color-fg)] placeholder:text-[var(--color-muted)] outline-none transition focus:border-[var(--color-brand)] focus:ring-4 focus:ring-[var(--color-brand-soft)] ${
          large ? "py-4 text-base" : "py-2.5 text-sm"
        }`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-muted)] hover:bg-[var(--color-border)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
