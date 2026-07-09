"use client";

import { categories } from "@/app/data/prompts";

export default function TableOfContents() {
  return (
    <ul className="space-y-1 border-l border-[var(--color-border)] pl-3">
      {categories.map((c) => (
        <li key={c.slug}>
          <a
            href={`#cat-${c.slug}`}
            className="block rounded-md px-2 py-1 text-xs text-[var(--color-muted)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
          >
            {c.name}
          </a>
        </li>
      ))}
    </ul>
  );
}
