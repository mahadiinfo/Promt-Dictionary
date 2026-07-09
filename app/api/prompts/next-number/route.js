import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Prompt from "@/app/models/Prompt";

// GET /api/prompts/next-number?category=Writing
export async function GET(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  if (!category) return NextResponse.json({ error: "category required" }, { status: 400 });
  const top = await Prompt.findOne({ category }).sort({ numberInt: -1 }).lean();
  const n = (top?.numberInt || 0) + 1;
  return NextResponse.json({ numberInt: n, number: `#${n}` });
}
