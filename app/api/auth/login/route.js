import { NextResponse } from "next/server";
import { checkAdminCredentials, signSession, setAdminCookie } from "@/app/lib/auth";

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }
  if (!checkAdminCredentials(email, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const token = await signSession({ sub: email, role: "admin" });
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
