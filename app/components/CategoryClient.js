"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import PromptDisplay from "./PromptDisplay";
import CopyButton from "./CopyButton";
import { createFuse, searchPrompts } from "@/app/lib/search";

const PromptModal = dynamic(() => import("./PromptModal"), { ssr: false });

export default function CategoryClient({ category, prompts }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [activeId, setActiveId] = useState(null);

  const fuse = useMemo(() => createFuse(prompts), [prompts]);
  const results = useMemo(
    () => searchPrompts(fuse, prompts, query),
    [fuse, prompts, query]
  );

  const visible = query ? results : prompts;
  const isOpen = selectedIndex !== null;
  const selectedPrompt = isOpen ? visible[selectedIndex] : null;
  const prevPrompt = isOpen && selectedIndex > 0 ? visible[selectedIndex - 1] : null;
  const nextPrompt =
    isOpen && selectedIndex < visible.length - 1 ? visible[selectedIndex + 1] : null;

  const openPrompt = (idx) => setSelectedIndex(idx);
  const closePrompt = () => setSelectedIndex(null);

  const jump = (id) => {
    setActiveId(id);
    const el = document.getElementById(`prompt-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen">
      <Navbar query={query} onQuery={setQuery} onOpenSidebar={() => {}} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-fg)]"
          >
            <ArrowLeft className="h-4 w-4" /> All categories
          </Link>
          <h1
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {category.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {prompts.length} prompt{prompts.length === 1 ? "" : "s"} in this category
          </p>
        </div>

        {prompts.length > 0 && (
          <section className="mb-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
              Prompt Title
            </p>
            <ol className="sm:grid-cols-2 lg:grid-cols-3">
              {prompts.map((p) => (
                <li key={p.id} className="min-w-0 ">
                  <button
                    onClick={() => jump(p.id)}
                    className="group cursor-pointer flex w-full items-baseline gap-2 truncate text-left text-sm text-[var(--color-fg)]/85 transition hover:text-[var(--color-brand)]"
                  >
                    <span className="font-mono text-xs text-[var(--color-muted)] group-hover:text-[var(--color-brand)]">
                      {p.number}
                    </span>
                    <span className="truncate">{p.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>
        )}

        {query && (
          <div className="mb-6 text-sm text-[var(--color-muted)]">
            {results.length === 0
              ? `No prompts match "${query}".`
              : `${results.length} result${results.length === 1 ? "" : "s"} for "${query}"`}
          </div>
        )}

        <div className="space-y-8">
          {visible.map((p, idx) => (
            <article
              key={p.id}
              id={`prompt-${p.id}`}
              role="button"
              tabIndex={0}
              onClick={() => openPrompt(idx)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPrompt(idx);
                }
              }}
              className={`scroll-mt-24 cursor-pointer rounded-2xl border bg-[var(--color-surface)] p-6 shadow-sm transition hover:border-[var(--color-brand)] hover:shadow-md ${
                activeId === p.id
                  ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand-soft)]"
                  : "border-[var(--color-border)]"
              }`}
            >
              <header className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-md bg-[var(--color-brand-soft)] px-2 py-0.5 font-mono font-semibold text-[var(--color-fg)]">
                      {p.number}
                    </span>
                    <span className="text-[var(--color-muted)]">·</span>
                    <span className="text-[var(--color-muted)]">{p.category}</span>
                  </div>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                    {p.title}
                  </h2>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <CopyButton text={p.prompt} />
                </div>
              </header>

              <PromptDisplay text={p.prompt} />

              {p.tags?.length > 0 && (
                <footer className="mt-5 flex flex-wrap items-center gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]"
                    >
                      #{t}
                    </span>
                  ))}
                </footer>
              )}
            </article>
          ))}
        </div>
      </main>

      <PromptModal
        prompt={selectedPrompt}
        open={isOpen}
        onClose={closePrompt}
        prevPrompt={prevPrompt}
        nextPrompt={nextPrompt}
        onPrev={() => prevPrompt && setSelectedIndex((i) => i - 1)}
        onNext={() => nextPrompt && setSelectedIndex((i) => i + 1)}
      />

      <Footer />
    </div>
  );
}