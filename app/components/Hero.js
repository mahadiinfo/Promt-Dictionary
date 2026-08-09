import site from "@/app/data/site";
import SearchBar from "./SearchBar";
import StatsCards from "./StatsCards";

export default function Hero({ query, onQuery, totalPrompts, categories }) {
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
        <h1
          className="animate-fade-up text-4xl font-semibold tracking-tight sm:text-6xl"
          style={{ fontFamily: "var(--font-display)", animationDelay: "50ms" }}
        >
          {site.title}
        </h1>
        <p
          className="animate-fade-up mx-auto mt-4 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg"
          style={{ animationDelay: "100ms" }}
        >
          Browse, search and copy {totalPrompts} hand-picked prompts across{" "}
          {categories.length} categories. Built as a premium documentation experience.
        </p>
        <div
          className="animate-fade-up mx-auto mt-8 max-w-xl"
          style={{ animationDelay: "150ms" }}
        >
          <SearchBar value={query} onChange={onQuery} size="lg" />
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <StatsCards totalPrompts={totalPrompts} categories={categories} />
        </div>
      </div>
    </section>
  );
}
