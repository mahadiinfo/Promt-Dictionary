import PromptCard from "./PromptCard";

export default function CategorySection({ category, prompts, query }) {
  if (!prompts.length) return null;
  return (
    <section id={`cat-${category.slug}`} className="scroll-mt-24">
      <div className="mb-5 flex items-end justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <h2
            className="text-2xl font-semibold tracking-tight sm:text-3xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {category.name}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {prompts.length} prompt{prompts.length === 1 ? "" : "s"} in this category
          </p>
        </div>
      </div>
      <div className="grid gap-4">
        {prompts.map((p) => (
          <PromptCard key={p.id} prompt={p} query={query} />
        ))}
      </div>
    </section>
  );
}
