"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Hash } from "lucide-react";
import { categories } from "@/app/data/prompts";
import TableOfContents from "./TableOfContents";

function SidebarContent({ activeCategory, onNavigate }) {
  return (
    <nav className="flex h-full flex-col gap-8 p-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          Categories
        </p>
        <ul className="space-y-1">
          {categories.map((c) => {
            const isActive = activeCategory === `cat-${c.slug}`;
            return (
              <li key={c.slug}>
                <a
                  href={`#cat-${c.slug}`}
                  onClick={onNavigate}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-[var(--color-brand-soft)] font-semibold text-[var(--color-fg)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 opacity-60" />
                    {c.name}
                  </span>
                  <span className="rounded-md bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
                    {c.count}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          On this page
        </p>
        <TableOfContents />
      </div>
    </nav>
  );
}

export default function Sidebar({ open, onClose, activeCategory }) {
  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 shrink-0 overflow-y-auto border-r border-[var(--color-border)] lg:block">
        <SidebarContent activeCategory={activeCategory} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85%] overflow-y-auto border-r border-[var(--color-border)] bg-[var(--color-bg)] lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <span className="text-sm font-semibold">Menu</span>
                <button
                  onClick={onClose}
                  className="rounded-md p-2 hover:bg-[var(--color-surface)]"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <SidebarContent activeCategory={activeCategory} onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
