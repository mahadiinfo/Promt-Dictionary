import prompts from "@/app/data/prompts";

export default function RecentPrompts() {
  const recent = [...prompts].slice(-4).reverse();
  return (
    <section className="mb-16">
      <div className="mb-4 flex items-end justify-between">
        <h2
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Recently added
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {recent.map((p) => (
          <a
            key={p.id}
            href={`#prompt-${p.id}`}
            className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition hover:border-[var(--color-brand)]"
          >
            <div className="min-w-0">
              <p className="text-xs text-[var(--color-muted)]">
                {p.number} · {p.category}
              </p>
              <p className="truncate text-sm font-semibold">{p.title}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
