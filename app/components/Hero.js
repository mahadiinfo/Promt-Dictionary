"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import site from "@/app/data/site";
import SearchBar from "./SearchBar";
import StatsCards from "./StatsCards";

export default function Hero({ query, onQuery , totalPrompts, categories}) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(600px circle at 20% 0%, var(--color-brand-soft), transparent 60%), radial-gradient(500px circle at 80% 20%, rgba(59,130,246,0.08), transparent 60%)",
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {site.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg"
        >
          Browse, search and copy {totalPrompts} hand-picked prompts across {categories.length} categories. Built as a premium documentation experience.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-xl"
        >
          <SearchBar value={query} onChange={onQuery} size="lg" />
        </motion.div>
        <div className="mx-auto mt-10 max-w-3xl">
          <StatsCards totalPrompts={totalPrompts} categories={categories} />
        </div>
      </div>
    </section>
  );
}
