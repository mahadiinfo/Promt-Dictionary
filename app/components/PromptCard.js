"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import CopyButton from "./CopyButton";
import { highlight } from "@/app/lib/utils";

function Highlighted({ text, query }) {
  const chunks = highlight(text, query);
  return (
    <>
      {chunks.map((c, i) =>
        c.hit ? (
          <mark key={i} className="search-hit">
            {c.text}
          </mark>
        ) : (
          <span key={i}>{c.text}</span>
        )
      )}
    </>
  );
}

export default function PromptCard({ prompt, query }) {
  const [saved, setSaved] = useState(false);

  return (
    <article
      id={`prompt-${prompt.id}`}
      className="group scroll-mt-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
    >
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md bg-[var(--color-brand-soft)] px-2 py-0.5 font-mono font-semibold text-[var(--color-fg)]">
              {prompt.number}
            </span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[var(--color-muted)]">{prompt.category}</span>
            <span className="text-[var(--color-muted)]">·</span>
            <span className="text-[var(--color-muted)]">page {prompt.page}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            <a href={`#prompt-${prompt.id}`} className="hover:underline">
              <Highlighted text={prompt.title} query={query} />
            </a>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSaved((s) => !s)}
            aria-label="Bookmark"
            className={`rounded-lg p-2 transition ${
              saved
                ? "bg-[var(--color-brand-soft)] text-[var(--color-brand)]"
                : "text-[var(--color-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
          <CopyButton text={prompt.prompt} />
        </div>
      </header>

      <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-fg)]/90">
        <Highlighted text={prompt.prompt} query={query} />
      </p>

      <footer className="flex flex-wrap items-center gap-1.5">
        {prompt.tags.map((t) => (
          <span
            key={t}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-muted)]"
          >
            #{t}
          </span>
        ))}
      </footer>
    </article>
  );
}
