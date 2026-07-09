"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, PlusCircle, Search } from "lucide-react";

export default function PromptsAdminClient({ prompts, categories }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return prompts.filter((p) => {
      if (cat && p.category !== cat) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.prompt.toLowerCase().includes(query) ||
        p.number.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(query))
      );
    });
  }, [prompts, q, cat]);

  async function onDelete(id) {
    if (!confirm("Delete this prompt? This cannot be undone.")) return;
    const res = await fetch(`/api/prompts/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert("Delete failed");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Prompts
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {prompts.length} total · showing {filtered.length}
          </p>
        </div>
        <Link
          href="/admin/prompts/new"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" /> Add prompt
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search prompts…"
            className="h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] pl-9 pr-3 text-sm outline-none focus:border-[var(--color-brand)]"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3 font-mono text-xs">{p.number}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{p.title}</div>
                  {p.tags?.length ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted)]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{p.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/prompts/${p.id}/edit`}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs hover:bg-[var(--color-brand-soft)]"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Link>
                    <button
                      onClick={() => onDelete(p.id)}
                      className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
                  No prompts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
