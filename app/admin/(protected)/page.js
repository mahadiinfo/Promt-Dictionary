import Link from "next/link";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";
import Category from "@/app/models/Category";
import { FileText, Folder, PlusCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  const [promptCount, categoryCount, recent] = await Promise.all([
    Prompt.countDocuments({}),
    Category.countDocuments({}),
    Prompt.find({}).sort({ updatedAt: -1 }).limit(5).lean(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manage prompts and categories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total prompts" value={promptCount} icon={FileText} />
        <StatCard label="Total categories" value={categoryCount} icon={Folder} />
        <Link
          href="/admin/prompts/new"
          className="flex items-center justify-between rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition hover:border-[var(--color-brand)]"
        >
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Quick action</p>
            <p className="mt-1 text-lg font-semibold">Add a new prompt</p>
          </div>
          <PlusCircle className="h-6 w-6 text-[var(--color-brand)]" />
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Recent prompts</h2>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {recent.length === 0 ? (
            <div className="p-6 text-sm text-[var(--color-muted)]">No prompts yet.</div>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {recent.map((p) => (
                <li key={String(p._id)} className="flex items-center justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <div className="text-xs text-[var(--color-muted)]">
                      <span className="font-mono">{p.number}</span> · {p.category}
                    </div>
                    <div className="truncate text-sm font-semibold">{p.title}</div>
                  </div>
                  <Link
                    href={`/admin/prompts/${p._id}/edit`}
                    className="text-sm text-[var(--color-brand)] hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
      </div>
      <Icon className="h-6 w-6 text-[var(--color-brand)]" />
    </div>
  );
}
