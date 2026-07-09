"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2, Pencil, Check, X } from "lucide-react";

export default function CategoriesAdminClient({ categories }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Failed");
      return;
    }
    setName("");
    router.refresh();
  }

  async function rename(id) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Rename failed");
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function remove(id) {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed");
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <h1
        className="mb-6 text-3xl font-semibold tracking-tight"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Categories
      </h1>

      <form onSubmit={add} className="mb-6 flex max-w-xl items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name…"
          className="h-11 flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
        />
        <button
          disabled={busy}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--color-accent)] px-4 text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-60"
        >
          <PlusCircle className="h-4 w-4" /> Add
        </button>
      </form>
      {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-bg)] text-left text-xs uppercase tracking-wider text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Prompts</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">
                  {editingId === c.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] px-2 text-sm"
                    />
                  ) : (
                    c.name
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-muted)]">{c.slug}</td>
                <td className="px-4 py-3 text-[var(--color-muted)]">{c.count}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editingId === c.id ? (
                      <>
                        <button
                          onClick={() => rename(c.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs hover:bg-[var(--color-brand-soft)]"
                        >
                          <Check className="h-3 w-3" /> Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setEditName(c.name);
                          }}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs hover:bg-[var(--color-brand-soft)]"
                        >
                          <Pencil className="h-3 w-3" /> Rename
                        </button>
                        <button
                          onClick={() => remove(c.id)}
                          className="inline-flex h-8 items-center gap-1 rounded-md border border-[var(--color-border)] px-2 text-xs text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-[var(--color-muted)]">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
