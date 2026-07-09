"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Hash } from "lucide-react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import Footer from "./Footer";

export default function HomeClient({ categories, totalPrompts }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q));
  }, [query, categories]);

  return (
    <div className="min-h-screen">
      <Navbar query={query} onQuery={setQuery} onOpenSidebar={() => {}} />

      <main className="min-w-0 flex-1">
        <Hero query={query} onQuery={setQuery} totalPrompts = {totalPrompts} categories = {categories} />

        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-end justify-between border-b border-[var(--color-border)] pb-4">
            <div>
              <h2
                className="text-2xl font-semibold tracking-tight sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Browse by category
              </h2>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {categories.length} categories · pick one to see its prompts
              </p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--color-border)] p-10 text-center text-sm text-[var(--color-muted)]">
              No categories yet. Add some from the{" "}
              <Link href="/admin" className="underline">
                admin panel
              </Link>
              .
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-brand)] hover:shadow-md"
                >
                  <div className="min-w-0">
                    <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-[var(--color-brand-soft)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-fg)]">
                      <Hash className="h-3 w-3" />
                      Category
                    </div>
                    <p className="truncate text-lg font-semibold">{c.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">
                      {c.count} prompt{c.count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[var(--color-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-brand)]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
