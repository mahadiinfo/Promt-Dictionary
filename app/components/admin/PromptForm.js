"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function PromptForm({ categories, initial }) {
  const router = useRouter();
  const isEdit = !!initial;

  const [title, setTitle] = useState(initial?.title || "");
  const [category, setCategory] = useState(initial?.category || categories[0]?.name || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [prompt, setPrompt] = useState(initial?.prompt || "");
  const [previewNumber, setPreviewNumber] = useState(initial?.number || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Auto-generate next number when category changes (creating new,
  // or editing an existing prompt into a different category).
  useEffect(() => {
    if (!category) return;
    const categoryChanged = isEdit && initial.category !== category;
    if (isEdit && !categoryChanged) {
      setPreviewNumber(initial.number);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/prompts/next-number?category=${encodeURIComponent(category)}`
        );
        const data = await res.json();
        if (!cancelled) setPreviewNumber(data.number || "");
      } catch {
        if (!cancelled) setPreviewNumber("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category, isEdit, initial]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        prompt,
      };
      const url = isEdit ? `/api/prompts/${initial.id}` : "/api/prompts";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      router.push("/admin/prompts");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Prompt number (auto)">
          <input
            value={previewNumber}
            readOnly
            className="h-11 w-full cursor-not-allowed rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 font-mono text-sm text-[var(--color-muted)]"
          />
        </Field>
        <Field label="Category" required>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
          >
            {categories.length === 0 && <option value="">— No categories —</option>}
            {categories.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Title" required>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Cold Outreach Writer — Personalized Messages"
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
        />
      </Field>

      <Field label="Tags (comma separated)">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Cold Outreach, Sales, Email Writing"
          className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
        />
      </Field>

      <Field label="Prompt" required>
        <textarea
          required
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={14}
          placeholder="Paste the full prompt. Markdown, bullet lists, headings and blank lines are all preserved on the site."
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-sm leading-relaxed outline-none focus:border-[var(--color-brand)]"
        />
      </Field>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 items-center rounded-lg bg-[var(--color-accent)] px-5 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create prompt"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex h-11 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-sm font-medium hover:bg-[var(--color-brand-soft)]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
