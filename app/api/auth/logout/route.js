import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/app/lib/auth";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}
