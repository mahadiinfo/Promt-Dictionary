import LoginClient from "@/app/components/admin/LoginClient";
import { Suspense } from "react";

// Standalone segment: bypass admin/layout.js by rendering its own page — but
// admin/layout.js redirects unauthenticated users to /admin/login BEFORE
// rendering children. To break out of that layout entirely, we mark this
// route as its own layout via a co-located layout.js (see next file).
export default function LoginPage({ searchParams }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
