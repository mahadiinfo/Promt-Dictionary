import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/app/lib/auth";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import SignOutButton from "@/app/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="text-base font-semibold tracking-tight">
            Prompt Vault · Admin
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-medium hover:bg-[var(--color-brand-soft)]"
            >
              View site
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
