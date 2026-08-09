import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-4 text-center">
      <div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
          404
        </p>
        <h1
          className="mt-2 text-4xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page not found
        </h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          That prompt doesn't exist — yet.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-brand-soft)]"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
