"use client";

import Link from "next/link";
import { Github, Menu, BookOpen, LogIn, LogInIcon } from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";
import site from "@/app/data/site";

export default function Navbar({ query, onQuery, onOpenSidebar }) {
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          onClick={onOpenSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)]">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="text-base font-semibold tracking-tight">{site.title}</span>
        </Link>

        <div className="ml-6 hidden max-w-md flex-1 md:block">
          <SearchBar value={query} onChange={onQuery} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <a
            href={site.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium transition hover:bg-[var(--color-brand-soft)]"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <a
            href={"/admin"}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium transition hover:bg-[var(--color-brand-soft)]"
          >
            <LogInIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Login</span>
          </a>
          
        </div>
      </div>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2 md:hidden">
        <SearchBar value={query} onChange={onQuery} />
      </div>
    </header>
  );
}
