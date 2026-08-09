"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const from = search.get("from") || "/admin";
  const [email, setEmail] = useState("admin@promptvault.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Login failed");
      return;
    }
    router.replace(from);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)]">
            <Lock className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
            <p className="text-xs text-[var(--color-muted)]">Prompt Vault control panel</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
          />
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 text-sm outline-none focus:border-[var(--color-brand)]"
          />
        </label>

        <button
          disabled={busy}
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--color-accent)] text-sm font-semibold text-[var(--color-bg)] transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
